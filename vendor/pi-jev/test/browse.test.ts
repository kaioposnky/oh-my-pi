// Offline contracts ported from browser-use/jev-ultrafast tests/test_agent.py. No paid APIs.
import test from "node:test";
import assert from "node:assert/strict";
import { StalePage, fingerprint, type BrowsePage, type PageAction, type PageState } from "../src/browse-cdp.js";
import { BrowseRun, actionSpace, choose, parseFieldText, validateChoice, type Decision, type JevAsk } from "../src/browse.js";

function page(): PageState {
  const state: any = {
    url: "https://example.test/",
    title: "Search",
    text: "Search",
    w: 1120,
    h: 780,
    scroll: { y: 0 },
    actions: [
      { id: "e1", kind: "fill", label: "Search", role: "textbox", value: "", node: 10 },
      { id: "e2", kind: "click", label: "Open Search", role: "textbox", value: "", node: 10 },
      { id: "e3", kind: "click", label: "Go", role: "button", value: "", node: 20 },
      { id: "wait", kind: "wait", label: "Wait" },
    ],
  };
  state.fingerprint = fingerprint(state);
  return state;
}

const pick = (ids: Iterable<string>, selected: string) => ({
  choice: selected,
  confidence: 1,
  probabilities: Object.fromEntries([...ids].map((i) => [i, Number(i === selected)])),
});

const decision = (action = "e1"): Decision => ({
  choice: action,
  operation: "TYPE_TEXT",
  target: "1",
  confidence: 1,
  probabilities: { [action]: 1 },
  operation_probabilities: {},
  target_probabilities: {},
  latency_ms: 10,
  usage: {},
});

for (const mutation of ["unknown", "nan", "missing", "negative", "non_max", "confidence"]) {
  test(`invalid choice rejected: ${mutation}`, () => {
    const a: any = pick(["a", "b"], "a");
    if (mutation === "unknown") a.choice = "invented";
    else if (mutation === "nan") a.probabilities.a = NaN;
    else if (mutation === "missing") delete a.probabilities.b;
    else if (mutation === "negative") a.probabilities.b = -1;
    else if (mutation === "non_max") a.choice = "b";
    else a.confidence = 5;
    assert.throws(() => validateChoice(a, ["a", "b"]), /Invalid TypeSafe/);
  });
}

test("one index per node with operation-specific targets", () => {
  const { elements, targets, controls } = actionSpace(page().actions);
  assert.equal(elements.length, 2);
  assert.deepEqual(elements[0]!.operations, ["TYPE_TEXT", "CLICK"]);
  assert.equal(targets.TYPE_TEXT!["1"]!.id, "e1");
  assert.equal(targets.CLICK!["1"]!.id, "e2");
  assert.equal(targets.CLICK!["2"]!.id, "e3");
  assert.ok("WAIT" in controls);
});

test("all heads go in one request and only the matching head executes", async () => {
  const calls: any[] = [];
  const ask: JevAsk = async (_state, questions: any) => {
    calls.push(questions);
    return {
      answers: {
        operation: pick(Object.keys(questions.operation.criteria), "TYPE_TEXT"),
        type_text_target: pick(["1"], "1"),
        click_target: { choice: "invented" },
      },
    };
  };
  const d = await choose(page(), "Find a book", [], ask);
  assert.equal(calls.length, 1);
  assert.deepEqual([d.operation, d.target, d.choice], ["TYPE_TEXT", "1", "e1"]);
  assert.deepEqual(new Set(Object.keys(calls[0])), new Set(["operation", "click_target", "type_text_target"]));
});

test("CLICK cannot consume an out-of-set target", async () => {
  const ask: JevAsk = async (_s, questions: any) => ({
    answers: {
      operation: pick(Object.keys(questions.operation.criteria), "CLICK"),
      type_text_target: pick(["1"], "1"),
      click_target: pick(["1", "2", "999"], "999"),
    },
  });
  await assert.rejects(choose(page(), "Find a book", [], ask), /Invalid TypeSafe/);
});

test("target head receives control state and the full next-step rules", async () => {
  const p = page();
  p.actions.unshift({ id: "toggle", kind: "click", label: "Free cancellation", node: 30, role: "checkbox", checked: "true", selected: false });
  const ask: JevAsk = async (_s, questions: any) => {
    const target = questions.click_target;
    assert.equal(target.criteria["1"].checked, "true");
    assert.equal(target.criteria["1"].selected, false);
    assert.ok(target.instructions.rules.includes(questions.operation.instructions.rules));
    return { answers: { operation: pick(Object.keys(questions.operation.criteria), "CLICK"), click_target: pick(Object.keys(target.criteria), "3") } };
  };
  assert.equal((await choose(p, "Search with free cancellation", [], ask)).choice, "e3");
});

for (const content of ["Thinking: Zurich", '{"text":null}', '{"text":"Zurich","extra":true}', '{"text":123}', '{"text":"  "}']) {
  test(`text helper rejects ${content}`, () => {
    assert.throws(() => parseFieldText(content), /nothing typed/);
  });
}

test("text helper accepts a fenced single-key object", () => {
  assert.equal(parseFieldText('```json\n{"text":"Zurich"}\n```'), "Zurich");
});

class FakeBrowser implements BrowsePage {
  freshResult: boolean | Error = true;
  actCalls: [PageAction, string | null | undefined][] = [];
  actErrors: Error[] = [];
  observeError: Error | null = null;
  constructor(public current: PageState) {}
  async observe() {
    if (this.observeError) throw this.observeError;
    return this.current;
  }
  async fresh() {
    if (this.freshResult instanceof Error) throw this.freshResult;
    return this.freshResult;
  }
  async act(action: PageAction, _page: PageState, text?: string | null) {
    this.actCalls.push([action, text]);
    const err = this.actErrors.shift();
    if (err) throw err;
  }
  async close() {}
}

function runner(textCalls: { n: number } = { n: 0 }) {
  const browser = new FakeBrowser(page());
  const run = new BrowseRun(browser, "Find a book", async () => ({ answers: {} }), async () => {
    textCalls.n++;
    return { content: '{"text":"book"}', model: "test" };
  });
  run.page = browser.current;
  run.decision = decision();
  run.status = "predicted";
  return { run, browser };
}

test("stale decision is consumed before any mutation", async () => {
  const { run, browser } = runner();
  browser.freshResult = false;
  await assert.rejects(run.act(run.page.fingerprint), StalePage);
  assert.equal(browser.actCalls.length, 0);
  assert.equal(run.decision, null);
});

test("generated text is reused only for an identical retry context", async () => {
  const calls = { n: 0 };
  const { run, browser } = runner(calls);
  browser.actErrors = [new StalePage("Changed before input")];
  await assert.rejects(run.act(run.page.fingerprint), StalePage);
  run.decision = decision();
  await run.act(run.page.fingerprint);
  assert.equal(calls.n, 1);
  assert.equal(browser.actCalls.length, 2);
  assert.equal(browser.actCalls[1]![1], "book");
});

test("changed field context regenerates text", async () => {
  const calls = { n: 0 };
  const { run, browser } = runner(calls);
  browser.actErrors = [new StalePage("Changed before input")];
  await assert.rejects(run.act(run.page.fingerprint), StalePage);
  run.page.text = "Different page context";
  run.decision = decision();
  await run.act(run.page.fingerprint);
  assert.equal(calls.n, 2);
});

test("loading waits do not trigger the no-progress stop", async () => {
  const { run } = runner();
  for (let i = 0; i < 5; i++) {
    run.decision = decision("wait");
    await run.act(run.page.fingerprint);
  }
  assert.equal(run.history.length, 5);
  assert.equal(run.status, "ready");
});

test("three unchanged non-wait actions block the run", async () => {
  const { run } = runner();
  for (let i = 0; i < 3; i++) {
    run.decision = decision("e3");
    await run.act(run.page.fingerprint);
  }
  assert.equal(run.status, "blocked");
});

test("a stale post-action observation preserves the executed action", async () => {
  const { run, browser } = runner();
  run.decision = decision("e3");
  browser.observeError = new StalePage("changed");
  await assert.rejects(run.act(run.page.fingerprint), StalePage);
  assert.equal(run.history.at(-1)!.action, "Go");
  assert.equal(browser.actCalls.length, 1);
});

test("navigation during prediction re-observes without acting", async () => {
  const { run, browser } = runner();
  browser.freshResult = new StalePage("Document navigating");
  await run.tick();
  assert.equal(run.status, "ready");
  assert.equal(run.decision, null);
  assert.equal(browser.actCalls.length, 0);
});

test("fingerprint tracks values and identity, not screenshots", () => {
  const p = page();
  const other = structuredClone(p);
  other.screenshot = "changed";
  assert.equal(fingerprint(p), fingerprint(other));
  other.actions[0]!.node = 99;
  assert.notEqual(fingerprint(p), fingerprint(other));
});
