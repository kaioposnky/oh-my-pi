// Port of browser-use/jev-ultrafast browser.py + snapshot.js (MIT). One CDP session, one atomic DOM read per
// observation, code-owned node identities, freshness guards rechecked immediately before every input.
import { spawn, type ChildProcess } from "node:child_process";
import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

/** A decision no longer refers to the observed page. Safe to re-observe and choose again. */
export class StalePage extends Error {}

export interface PageAction {
  id: string;
  kind: "click" | "fill" | "select" | "scroll" | "wait";
  label: string;
  node?: number;
  role?: string;
  value?: string;
  current_value?: string;
  checked?: string;
  selected?: string | boolean;
  expanded?: string;
  delta?: number;
  rect?: unknown;
}

export interface PageState {
  url: string;
  title: string;
  text: string;
  w: number;
  h: number;
  scroll: { y: number; height?: number };
  actions: PageAction[];
  marker?: unknown;
  page_key?: unknown;
  guards?: Record<string, unknown>;
  omitted_actions?: number;
  fingerprint: string;
  screenshot?: string;
}

/** What the run loop needs from a browser; the CDP implementation below is the only real one. */
export interface BrowsePage {
  observe(screenshot?: boolean): Promise<PageState>;
  fresh(page: PageState, action?: PageAction): Promise<boolean>;
  act(action: PageAction, page: PageState, text?: string | null): Promise<void>;
  close(): Promise<void>;
}

// Upstream snapshot.js, verbatim. Atomically reads visible controls, names, values and visible text.
export const READ_STATE = String.raw`(() => {
  if (!document.body) return null;
  const cache = window.__jevFast ||= {ids:new WeakMap(), nodes:new Map(), next:1};
  const identity = e => {
    if (!cache.ids.has(e)) cache.ids.set(e,cache.next++);
    const id=cache.ids.get(e); cache.nodes.set(id,e); return id;
  };
  for (const [id,e] of cache.nodes) if (!e.isConnected) cache.nodes.delete(id);
  const safe = e => !['password','file','hidden'].includes(e.type);
  const visible = e => !e.closest('[aria-hidden="true"],[inert]') &&
    e.checkVisibility({checkOpacity:true,checkVisibilityCSS:true});
  const name = (e,seen=new Set()) => {
    if (!e || seen.has(e)) return '';
    seen.add(e);
    const referenced=(e.getAttribute('aria-labelledby')||'').split(/\s+/)
      .map(id=>name(document.getElementById(id),seen)).filter(Boolean).join(' ');
    return referenced || e.getAttribute('aria-label') ||
      [...(e.labels||[])].map(l=>name(l,seen)).filter(Boolean).join(' ') ||
      (['button','submit','reset'].includes(e.type) ? e.value : '') || e.getAttribute('alt') ||
      (e.tagName==='INPUT' ? '' : [...e.childNodes].map(n=>n.nodeType===3 ? n.textContent :
        n.nodeType===1 && n.getAttribute('aria-hidden')!=='true' ? name(n,seen) : '').join(' ').trim()) ||
      e.getAttribute('title') || e.getAttribute('placeholder') || '';
  };
  const roles=['button','link','checkbox','radio','switch','tab','menuitem','menuitemradio',
    'option','gridcell','combobox','textbox','searchbox','spinbutton'];
  const selector='a[href],button,input,textarea,select,summary,[contenteditable="true"],'+
    roles.map(role=>'[role="'+role+'"]').join(',');
  const role = e => {
    const explicit=e.getAttribute('role');
    if (roles.includes(explicit)) return explicit;
    if (e.tagName==='BUTTON' || e.tagName==='SUMMARY') return 'button';
    if (e.tagName==='A') return 'link';
    if (e.tagName==='SELECT') return 'combobox';
    if (e.tagName==='TEXTAREA' || e.isContentEditable) return 'textbox';
    if (e.tagName==='INPUT') {
      if (['checkbox','radio'].includes(e.type)) return e.type;
      if (['button','submit','reset','image'].includes(e.type)) return 'button';
      if (e.type==='search') return 'searchbox';
      if (e.type==='number') return 'spinbutton';
      if (['text','email','url','tel'].includes(e.type)) return 'textbox';
    }
    return null;
  };
  cache.pageKey=()=>[performance.timeOrigin,location.href,scrollX,scrollY,innerWidth,innerHeight,
    [...document.querySelectorAll('input,textarea,select')].filter(safe)
      .map(e=>[identity(e),e.value,e.checked,e.selectedIndex,e.disabled,e.readOnly])];
  cache.guard=e=>{
    if (!e?.isConnected || !visible(e)) return null;
    const scope=e.closest('form,dialog,[role="dialog"],article,li,tr,[role="row"]') || e.parentElement;
    return [identity(e),role(e),name(e),e.value??null,e.checked??null,e.selectedIndex??null,
      e.readOnly??null,e.matches(':disabled'),e.getAttribute('aria-disabled'),
      e.getAttribute('aria-expanded'),e.getAttribute('aria-checked'),e.getAttribute('aria-selected'),
      e.getAttribute('href'),scope?.innerText?.slice(0,6000)||''];
  };
  const actions=[];
  for (const e of document.querySelectorAll(selector)) {
    if (!safe(e) || !visible(e) || e.matches(':disabled') || e.closest('[aria-disabled="true"]')) continue;
    const r=e.getBoundingClientRect(), x=r.x+r.width/2, y=r.y+r.height/2, rname=role(e);
    if (!rname || r.width<=0 || r.height<=0 || x<0 || y<0 || x>=innerWidth || y>=innerHeight) continue;
    if (rname==='gridcell' && e.querySelector('button,[role="button"]')) continue;
    const base={node:identity(e),role:rname,label:name(e)||rname,
      rect:{x:r.x,y:r.y,w:r.width,h:r.height}};
    for (const key of ['checked','selected','expanded']) {
      const value=e.getAttribute('aria-'+key);
      if (value!==null) base[key]=value;
    }
    if (['checkbox','radio'].includes(e.type)) base.checked=String(e.checked);
    if (e.tagName==='SELECT') {
      for (const o of e.options) if (!o.selected && !o.disabled && !o.closest('optgroup[disabled]'))
        actions.push({...base,kind:'select',value:o.value,
          current_value:[...e.selectedOptions].map(o=>o.label).join(', '),label:base.label+' → '+o.label});
    } else {
      const editable=!e.readOnly && e.getAttribute('aria-readonly')!=='true' &&
        (['textbox','searchbox','spinbutton'].includes(rname) ||
          (rname==='combobox' && ['INPUT','TEXTAREA'].includes(e.tagName)));
      const value='value' in e ? String(e.value) :
        e.isContentEditable || rname==='combobox' ? e.innerText.trim() : '';
      actions.push({...base,kind:editable?'fill':'click',value});
      if (editable) actions.push({...base,kind:'click',value,label:'Open '+base.label});
    }
  }
  const words=[], walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  const range=document.createRange(); let node,length=0;
  while ((node=walker.nextNode()) && length<6000) {
    const value=node.textContent.trim(), parent=node.parentElement;
    if (!value || !parent || parent.closest('script,style,noscript,template') || !visible(parent)) continue;
    range.selectNodeContents(node); const r=range.getBoundingClientRect();
    if (r.width>0 && r.height>0 && r.bottom>0 && r.top<innerHeight && r.right>0 && r.left<innerWidth) {
      words.push(value); length+=value.length;
    }
  }
  const text=words.join('\n').slice(0,6000), height=document.documentElement.scrollHeight;
  const page_key=cache.pageKey(), guards={};
  for (const a of actions) if (!(a.node in guards)) guards[a.node]=cache.guard(cache.nodes.get(a.node));
  // Compare meaning and identity. Geometry is always resolved and hit-tested just before input.
  const semantics=actions.map(({rect,...action})=>action);
  const marker=[performance.timeOrigin,location.href,scrollX,scrollY,innerWidth,innerHeight,
    document.title,text,semantics,page_key[6]];
  const omitted_actions=Math.max(0,actions.length-250);
  actions.splice(250);
  actions.forEach((a,i)=>a.id='e'+(i+1));
  if (scrollY+innerHeight<height-2) actions.push({id:'scroll_down',kind:'scroll',label:'Scroll down',delta:560});
  if (scrollY>0) actions.push({id:'scroll_up',kind:'scroll',label:'Scroll up',delta:-560});
  actions.push({id:'wait',kind:'wait',label:'Wait for the page to update'});
  return {url:location.href,title:document.title,w:innerWidth,h:innerHeight,text,
    scroll:{y:scrollY,height},actions,marker,page_key,guards,omitted_actions};
})()`;

const MARKER = `(() => { const state=${READ_STATE}; return state?.marker ?? null; })()`;

// After input: up to two animation frames / 50 ms; editable comboboxes wait for visible options, capped at 200 ms.
const SETTLE = String.raw`(action => new Promise(resolve => {
  const field=window.__jevFast?.nodes.get(action.node);
  const autocomplete=action.kind==='fill' && field?.getAttribute('role')==='combobox';
  let frames=0, stopped=false;
  const finish=()=>{stopped=true;resolve()};
  setTimeout(finish,autocomplete ? 200 : 50);
  const ready=()=>{
    if (stopped) return;
    const ids=(field?.getAttribute('aria-controls')||field?.getAttribute('aria-owns')||'')
      .split(/\s+/).filter(Boolean);
    const roots=ids.length ? ids.map(id=>document.getElementById(id)).filter(Boolean) : [document];
    const options=roots.flatMap(root=>[...root.querySelectorAll('[role="option"]')]);
    if (++frames>=2 && (!autocomplete || options.some(e=>{
      const r=e.getBoundingClientRect();
      return r.width && r.height && r.bottom>0 && r.top<innerHeight &&
        e.checkVisibility({checkOpacity:true,checkVisibilityCSS:true});
    }))) finish();
    else requestAnimationFrame(ready);
  };
  requestAnimationFrame(ready);
}))`;

// Resolve the observed node, recheck enabled/visible/unobstructed, then return its current centre.
const RESOLVE_TARGET = String.raw`(action => {
  const e=window.__jevFast?.nodes.get(action.node);
  if (!e?.isConnected || e.matches(':disabled') || e.closest('[aria-disabled="true"],[inert]') ||
      !e.checkVisibility({checkOpacity:true,checkVisibilityCSS:true})) return null;
  if (action.kind==='fill' && (e.readOnly || e.getAttribute('aria-readonly')==='true')) return null;
  const centre=()=>{ const r=e.getBoundingClientRect(); return {r,x:r.x+r.width/2,y:r.y+r.height/2}; };
  let {r,x,y}=centre();
  // Port fix: a target clipped by a scroll container (e.g. a calendar month list) is scrolled into view once;
  // upstream rejected it forever and the policy re-chose it every step. Covering overlays still fail below.
  if (r.width && r.height && !e.contains(document.elementFromPoint(x,y))) {
    e.scrollIntoView({block:'nearest',inline:'nearest'}); ({r,x,y}=centre());
  }
  if (!r.width || !r.height || x<0 || y<0 || x>=innerWidth || y>=innerHeight) return null;
  if (!e.contains(document.elementFromPoint(x,y))) return null;
  if (action.kind==='select') {
    if (e.tagName!=='SELECT' || ![...e.options].some(o=>o.value===action.value &&
        !o.disabled && !o.closest('optgroup[disabled]'))) return null;
    e.value=action.value;
    e.dispatchEvent(new Event('input',{bubbles:true}));
    e.dispatchEvent(new Event('change',{bubbles:true}));
  }
  return {x,y};
})`;

/** Canonical JSON (sorted keys), matching Python's json.dumps(sort_keys=True) for fingerprints. */
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((k) => `${JSON.stringify(k)}:${canonical((value as any)[k])}`).join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

/** Page identity for history: values and node identity, never screenshots. */
export function fingerprint(state: Pick<PageState, "url" | "text" | "actions" | "scroll">): string {
  const { url, text, actions, scroll } = state;
  return createHash("sha256").update(canonical({ actions, scroll, text, url })).digest("hex");
}

function sleep(ms: number): Promise<void> {
  const { promise, resolve } = Promise.withResolvers<void>();
  setTimeout(resolve, ms);
  return promise;
}

/** Minimal flattened-session CDP client over the browser WebSocket. */
export class Cdp {
  private nextId = 1;
  private pending = new Map<number, { resolve: (v: any) => void; reject: (e: Error) => void }>();
  private constructor(private ws: WebSocket) {
    ws.addEventListener("message", (event) => {
      const msg = JSON.parse(String(event.data));
      const waiter = msg.id !== undefined && this.pending.get(msg.id);
      if (!waiter) return;
      this.pending.delete(msg.id);
      if (msg.error) waiter.reject(new Error(`CDP ${msg.error.message ?? "error"}`));
      else waiter.resolve(msg.result ?? {});
    });
    ws.addEventListener("close", () => {
      for (const w of this.pending.values()) w.reject(new Error("CDP connection closed"));
      this.pending.clear();
    });
  }

  static async connect(wsUrl: string): Promise<Cdp> {
    const ws = new WebSocket(wsUrl);
    const { promise, resolve, reject } = Promise.withResolvers<void>();
    ws.addEventListener("open", () => resolve(), { once: true });
    ws.addEventListener("error", () => reject(new Error(`Cannot connect to Chrome DevTools at ${wsUrl}`)), { once: true });
    await promise;
    return new Cdp(ws);
  }

  send(method: string, params: Record<string, unknown> = {}, sessionId?: string, timeoutMs = 30_000): Promise<any> {
    const id = this.nextId++;
    const { promise, resolve, reject } = Promise.withResolvers<any>();
    const timer = setTimeout(() => {
      this.pending.delete(id);
      reject(new Error(`CDP ${method} timed out`));
    }, timeoutMs);
    this.pending.set(id, {
      resolve: (v) => (clearTimeout(timer), resolve(v)),
      reject: (e) => (clearTimeout(timer), reject(e)),
    });
    this.ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    return promise;
  }

  close(): void {
    this.ws.close();
  }
}

/** Resolve `ws://…` directly, or `http://host:port` via /json/version. */
async function resolveWsUrl(cdpUrl: string): Promise<string> {
  if (/^wss?:\/\//.test(cdpUrl)) return cdpUrl;
  const res = await fetch(`${cdpUrl.replace(/\/+$/, "")}/json/version`);
  if (!res.ok) throw new Error(`Chrome DevTools at ${cdpUrl} returned HTTP ${res.status}`);
  const { webSocketDebuggerUrl } = (await res.json()) as { webSocketDebuggerUrl?: string };
  if (!webSocketDebuggerUrl) throw new Error(`No webSocketDebuggerUrl at ${cdpUrl}`);
  return webSocketDebuggerUrl;
}

export function findChrome(): string | null {
  const explicit = process.env.JEV_BROWSE_CHROME?.trim() || process.env.PUPPETEER_EXECUTABLE_PATH?.trim();
  if (explicit) return explicit;
  const names = ["google-chrome-stable", "google-chrome", "chromium", "chromium-browser", "chrome", "msedge"];
  for (const dir of (process.env.PATH ?? "").split(path.delimiter)) {
    for (const name of names) {
      const candidate = path.join(dir, name);
      if (dir && fs.existsSync(candidate)) return candidate;
    }
  }
  const fixed = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  ];
  return fixed.find((p) => fs.existsSync(p)) ?? null;
}

/** Owned Chromes still running; SIGKILLed if the host exits before `close()` (e.g. `omp -p` ending). */
const owned = new Map<ChildProcess, string>();
process.once("exit", () => {
  for (const child of owned.keys()) child.kill("SIGKILL");
});

/**
 * Remove profiles left by hosts that exited mid-run (a dying Chrome can rewrite `Default/` after the exit hook).
 * Profile dirs are named `jev-browse-<pid>-…`; only those whose owning host pid is gone are removed.
 */
function sweepStaleProfiles(): void {
  for (const name of fs.readdirSync(os.tmpdir())) {
    const pid = Number(name.match(/^jev-browse-(\d+)-/)?.[1]);
    if (!pid || pid === process.pid) continue;
    try {
      process.kill(pid, 0);
    } catch {
      fs.rmSync(path.join(os.tmpdir(), name), { recursive: true, force: true });
    }
  }
}

/** Kill Chrome and remove its temp profile only after it exits (it keeps writing until then). */
async function stopChrome(child: ChildProcess, profile: string): Promise<void> {
  if (child.exitCode === null && child.signalCode === null) {
    const { promise, resolve } = Promise.withResolvers<void>();
    child.once("exit", () => resolve());
    child.kill();
    const timer = setTimeout(() => (child.kill("SIGKILL"), resolve()), 3_000);
    await promise;
    clearTimeout(timer);
  }
  owned.delete(child);
  fs.rmSync(profile, { recursive: true, force: true });
}

async function launchChrome(): Promise<{ wsUrl: string; child: ChildProcess; profile: string }> {
  const chrome = findChrome();
  if (!chrome) {
    throw new Error("No Chrome/Chromium found. Set JEV_BROWSE_CHROME, or pass cdp_url to attach to a running Chrome.");
  }
  sweepStaleProfiles();
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), `jev-browse-${process.pid}-`));
  const child = spawn(
    chrome,
    // Without these, headless Chrome throttles the tab to ~1 animation frame/s and CSS menu transitions never finish.
    ["--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "--no-first-run",
      "--no-default-browser-check", "--disable-blink-features=AutomationControlled",
      "--disable-renderer-backgrounding", "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows", "about:blank"],
    { stdio: ["ignore", "ignore", "pipe"] }
  );
  owned.set(child, profile);
  try {
    const { promise, resolve, reject } = Promise.withResolvers<string>();
    let buffer = "";
    const timer = setTimeout(() => reject(new Error("Chrome did not open DevTools within 15s")), 15_000);
    child.once("exit", (code) => (clearTimeout(timer), reject(new Error(`Chrome exited (${code}) before DevTools opened`))));
    child.once("error", (err) => (clearTimeout(timer), reject(err)));
    child.stderr!.on("data", (chunk) => {
      buffer += chunk;
      const match = buffer.match(/DevTools listening on (ws:\/\/\S+)/);
      if (match) (clearTimeout(timer), resolve(match[1]!));
    });
    const wsUrl = await promise;
    child.stderr!.resume();
    return { wsUrl, child, profile };
  } catch (err) {
    await stopChrome(child, profile);
    throw err;
  }
}

/**
 * An owned tab, either in a freshly launched headless Chrome (default) or in a running Chrome reached via
 * `cdpUrl` (shares that profile's logins, like upstream's Browser Harness connection).
 */
export class CdpBrowser implements BrowsePage {
  private target: string | null = null;
  private session = "";
  private afterInput: PageAction | null = null;
  private launched: { child: ChildProcess; profile: string } | null = null;
  private cdp!: Cdp;

  static async open(url: string, options: { cdpUrl?: string } = {}): Promise<CdpBrowser> {
    const b = new CdpBrowser();
    try {
      let wsUrl: string;
      if (options.cdpUrl) wsUrl = await resolveWsUrl(options.cdpUrl);
      else {
        const launched = await launchChrome();
        b.launched = launched;
        wsUrl = launched.wsUrl;
      }
      b.cdp = await Cdp.connect(wsUrl);
      // Owned headless Chrome has no user tab to disturb, so its target runs foreground (unthrottled).
      b.target = (await b.cdp.send("Target.createTarget", { url: "about:blank", background: !b.launched })).targetId;
      b.session = (await b.cdp.send("Target.attachToTarget", { targetId: b.target, flatten: true })).sessionId;
      await b.call("Emulation.setDeviceMetricsOverride", { width: 1120, height: 780, deviceScaleFactor: 1, mobile: false });
      // Keep rAF/menus rendering in an owned background tab, without activating the user's visible tab.
      await b.call("Emulation.setFocusEmulationEnabled", { enabled: true });
      if (b.launched) {
        // Headless Chrome advertises itself in the UA; many sites (Google included) degrade or block it.
        const { userAgent } = await b.cdp.send("Browser.getVersion");
        await b.call("Emulation.setUserAgentOverride", { userAgent: String(userAgent).replace("HeadlessChrome", "Chrome") });
      }
      await b.call("Page.navigate", { url });
      const deadline = Date.now() + 15_000;
      while (Date.now() < deadline) {
        try {
          if ((await b.evaluate("document.readyState")) === "complete") break;
        } catch (err) {
          if (!(err instanceof StalePage)) throw err;
        }
        await sleep(20);
      }
      return b;
    } catch (err) {
      await b.close();
      throw err;
    }
  }

  call(method: string, params: Record<string, unknown> = {}): Promise<any> {
    return this.cdp.send(method, params, this.session);
  }

  async evaluate(expression: string): Promise<any> {
    const response = await this.call("Runtime.evaluate", { expression, returnByValue: true });
    if (response.exceptionDetails) throw new StalePage("Document changed during evaluation");
    return response.result?.value;
  }

  async observe(screenshot = false): Promise<PageState> {
    if (this.afterInput) {
      const action = this.afterInput;
      this.afterInput = null;
      // Read-only, after execution was logged; a navigation interrupting it is harmless.
      await this.call("Runtime.evaluate", {
        expression: `${SETTLE}(${JSON.stringify(action)})`,
        awaitPromise: true,
        returnByValue: true,
      }).catch(() => undefined);
    }
    for (let attempt = 0; attempt < 10; attempt++) {
      try {
        const info = await this.evaluate(READ_STATE);
        if (info === null || info === undefined) throw new StalePage("Document is navigating");
        info.fingerprint = fingerprint(info);
        if (screenshot) info.screenshot = (await this.call("Page.captureScreenshot", { format: "jpeg", quality: 72 })).data;
        return info as PageState;
      } catch (err) {
        if (!(err instanceof StalePage) || attempt === 9) throw err;
        await sleep(20);
      }
    }
    throw new StalePage("Page did not settle");
  }

  async fresh(page: PageState, action?: PageAction): Promise<boolean> {
    if (action && (action.kind === "click" || action.kind === "select")) {
      if (!Number.isInteger(action.node)) return false;
      const current = await this.evaluate(
        `(() => { const c=window.__jevFast; return c ? [c.pageKey(),c.guard(c.nodes.get(${action.node}))] : null; })()`
      );
      return JSON.stringify(current) === JSON.stringify([page.page_key, page.guards?.[String(action.node)] ?? null]);
    }
    return JSON.stringify(await this.evaluate(MARKER)) === JSON.stringify(page.marker);
  }

  async act(action: PageAction, page: PageState, text?: string | null): Promise<void> {
    if (!(await this.fresh(page, action))) throw new StalePage("Page changed since this decision. Observe again.");
    if (action.kind === "wait") await sleep(100);
    else if (action.kind === "scroll") {
      await this.call("Input.dispatchMouseEvent", { type: "mouseWheel", x: 550, y: 650, deltaX: 0, deltaY: action.delta });
    } else {
      if (!Number.isInteger(action.node)) throw new Error("Invalid observed node");
      // Code-owned node IDs refer to actual observed elements, never model-generated selectors.
      const response = await this.call("Runtime.evaluate", {
        expression: `${RESOLVE_TARGET}(${JSON.stringify(action)})`,
        returnByValue: true,
      });
      const target = response.exceptionDetails ? undefined : response.result?.value;
      if (action.kind === "select") {
        // The change event may already have fired; never retry this as a stale page.
        if (!target) throw new Error("Dropdown execution was not confirmed; inspect before retrying.");
      } else {
        if (!target) throw new StalePage("Target changed or is covered. Observe again.");
        const { x, y } = target;
        for (const type of ["mousePressed", "mouseReleased"]) {
          await this.call("Input.dispatchMouseEvent", { type, x, y, button: "left", clickCount: 1 });
        }
        if (action.kind === "fill") {
          const modifiers = process.platform === "darwin" ? 4 : 2;
          await this.call("Input.dispatchKeyEvent", { type: "keyDown", key: "a", code: "KeyA", modifiers, commands: ["selectAll"] });
          await this.call("Input.dispatchKeyEvent", { type: "keyUp", key: "a", code: "KeyA", modifiers });
          await this.call("Input.insertText", { text: text ?? "" });
        }
      }
    }
    this.afterInput = action.kind === "wait" ? null : action;
  }

  async close(): Promise<void> {
    try {
      if (this.target) await this.cdp.send("Target.closeTarget", { targetId: this.target }).catch(() => undefined);
    } finally {
      this.target = null;
      this.cdp?.close();
      if (this.launched) {
        await stopChrome(this.launched.child, this.launched.profile);
        this.launched = null;
      }
    }
  }
}
