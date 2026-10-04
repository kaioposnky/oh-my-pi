// Port of jev-ultrafast scripts/check_guards.py: freshness/execution guards in a real local Chrome.
// No model calls, no external sites. Run: npx tsx scripts/check-browse-guards.ts
import assert from "node:assert/strict";
import { CdpBrowser, StalePage, type PageState } from "../src/browse-cdp.js";

const HTML = `<!doctype html><title>Guard checks</title>
<style>body{margin:30px}button{width:180px;height:50px}#outside{position:absolute;top:3000px}</style>
<p id="context">Cart total: $10</p>
<button id="target" onclick="window.clicks=(window.clicks||0)+1">Continue</button>
<label>City<input id="field" value="Zurich"></label>
<label><input id="toggle" type="checkbox">Refundable</label>
<select aria-label="Category"><option>All</option><option>Design</option></select>
<p id="outside">Unrelated offscreen text</p>`;

const FORM = `<form><p id="price">Total $10</p>
<button type="button" id="buy">Buy</button>
<label>Search <input id="query" role="combobox" aria-controls="suggestions"></label>
<div role="listbox" id="suggestions"></div>
<label><input id="check" type="checkbox">Enabled</label>
<label><input id="radio" type="radio">Choice</label>
<input id="readonly" aria-label="Read only" readonly>
<input id="secret" type="password" value="never expose this">
<button id="off" disabled>Disabled</button>
<select id="category" aria-label="Category">
  <option>All</option><option>Design</option><option disabled>Unavailable</option>
</select></form><aside id="unrelated">News</aside>`;

const find = (page: PageState, label: string) => page.actions.find((a) => a.label === label)!;

const browser = await CdpBrowser.open("data:text/html," + encodeURIComponent(HTML));
const passed: string[] = [];
try {
  let page = await browser.observe();
  let action = find(page, "Continue");
  await browser.evaluate("document.querySelector('#target').style.transform='translateX(200px)'");
  assert.ok(await browser.fresh(page), "Movement should use fresh geometry, not another model call");
  await browser.act(action, page);
  assert.equal(await browser.evaluate("window.clicks"), 1);
  passed.push("moving target clicked at its current location");

  await browser.evaluate("document.querySelector('#outside').textContent='Updated outside the viewport'");
  assert.ok(await browser.fresh(page));
  passed.push("unrelated offscreen text does not invalidate");

  const mutations: Record<string, string> = {
    "visible context": "document.querySelector('#context').textContent='Cart total: $100'",
    "accessible label": "document.querySelector('#target').setAttribute('aria-label','Delete account')",
    "field property": "document.querySelector('#field').value='London'",
    "checkbox property": "document.querySelector('#toggle').checked=true",
    "disabled target": "document.querySelector('#target').disabled=true",
    "read-only field": "document.querySelector('#field').readOnly=true",
    "hidden target": "document.querySelector('#target').style.display='none'",
    "replaced node": "document.querySelector('#target').outerHTML=document.querySelector('#target').outerHTML",
    "dropdown option": "document.querySelector('select').options[1].text='Coastal'",
  };
  for (const [label, expression] of Object.entries(mutations)) {
    await browser.evaluate("document.querySelector('#target').style.display='block'; document.querySelector('#target').disabled=false");
    page = await browser.observe();
    await browser.evaluate(expression);
    assert.ok(!(await browser.fresh(page)), label);
    passed.push(`${label} invalidates`);
  }

  await browser.evaluate("document.querySelector('#target').disabled=false; document.querySelector('#target').style.display='block'");
  page = await browser.observe();
  action = find(page, "Delete account");
  // A textless overlay does not alter semantic state, but must block a click.
  await browser.evaluate(
    "const cover=document.createElement('div'); cover.style.cssText='position:fixed;inset:0;z-index:9999;background:white'; document.body.append(cover)"
  );
  assert.ok(await browser.fresh(page));
  await assert.rejects(browser.act(action, page), StalePage, "Covered target was clicked");
  assert.equal(await browser.evaluate("window.clicks"), 1);
  passed.push("overlay blocked before input");

  await browser.evaluate(`document.body.innerHTML=${JSON.stringify(FORM)}`);
  page = await browser.observe();
  let buy = find(page, "Buy");
  await browser.evaluate("document.querySelector('#unrelated').textContent='New unrelated news'");
  assert.ok(await browser.fresh(page, buy));
  assert.ok(!(await browser.fresh(page)));
  passed.push("click guard accepts unrelated visible updates; terminal guard rejects them");
  for (const [label, expression] of Object.entries({
    "nearby price": "document.querySelector('#price').textContent='Total $100'",
    "form value": "document.querySelector('#query').value='changed'",
    "form toggle": "document.querySelector('#check').checked=true",
    "target replacement": "document.querySelector('#buy').outerHTML=document.querySelector('#buy').outerHTML",
  })) {
    page = await browser.observe();
    buy = find(page, "Buy");
    await browser.evaluate(expression);
    assert.ok(!(await browser.fresh(page, buy)), label);
    passed.push(`${label} invalidates action-specific guard`);
  }

  page = await browser.observe();
  const actions = page.actions;
  for (const role of ["checkbox", "radio"]) {
    assert.deepEqual(new Set(actions.filter((a) => a.role === role).map((a) => a.kind)), new Set(["click"]));
  }
  assert.deepEqual(new Set(actions.filter((a) => a.label === "Read only").map((a) => a.kind)), new Set(["click"]));
  assert.ok(!actions.some((a) => a.label === "Disabled" || a.value === "never expose this"));
  assert.deepEqual(actions.filter((a) => a.kind === "select").map((a) => a.value), ["Design"]);
  passed.push("native controls expose only supported operations and safe values");

  const select = actions.find((a) => a.kind === "select")!;
  await browser.act(select, page);
  assert.equal(await browser.evaluate("document.querySelector('#category').value"), "Design");
  passed.push("native dropdown selects an observed option");

  await browser.evaluate(
    "document.querySelector('#query').addEventListener('input',()=>setTimeout(()=>{document.querySelector('#suggestions').innerHTML='<div role=option>Generated</div>'},60))"
  );
  page = await browser.observe();
  const field = page.actions.find((a) => a.kind === "fill")!;
  await browser.act(field, page, "Generated");
  page = await browser.observe();
  assert.equal(await browser.evaluate("document.querySelector('#query').value"), "Generated");
  assert.ok(page.actions.some((a) => a.role === "option"));
  passed.push("real text input waits for asynchronous combobox suggestions");

  // Port fix: a control clipped inside a scroll container is scrolled into view, not rejected forever.
  await browser.evaluate(
    `document.body.innerHTML='<div id="box" style="height:100px;overflow:auto"><div style="height:400px"></div><button id="deep" onclick="window.deep=1">Deep</button></div>'`
  );
  page = await browser.observe();
  const deep = find(page, "Deep");
  assert.ok(deep, "clipped control should still be offered (in viewport, clipped by container)");
  await browser.act(deep, page);
  assert.equal(await browser.evaluate("window.deep"), 1);
  passed.push("clipped target scrolled into its container and clicked");

  await browser.call("Page.navigate", { url: "about:blank" });
  assert.ok(!(await browser.fresh(page, field)));
  passed.push("navigation invalidates the old document");
} finally {
  await browser.close();
}
console.log(passed.join("\n"));
console.log(`PASS: ${passed.length} browser guard checks; no model calls`);
