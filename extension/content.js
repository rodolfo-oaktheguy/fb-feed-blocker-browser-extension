// Feed Scroll Blocker: stops feed scrolling by blocking the inputs that scroll
// (wheel, touch, keys) and snapping any scroll that still happens back to the top screen.
(() => {
  const CLASS = "fsb-locked";
  const SCROLL_KEYS = new Set([" ", "PageDown", "PageUp", "End", "Home", "ArrowDown", "ArrowUp"]);
  let settings = fsbDefaults();
  let active = false;
  let siteId = null;
  let lastToast = 0, pendingCount = 0;

  // ---- settings ----
  chrome.storage.local.get(fsbDefaults(), s => { settings = s; refresh(); });
  chrome.storage.onChanged.addListener((ch) => {
    for (const k in ch) settings[k] = ch[k].newValue;
    refresh();
  });

  function isAllowedPath() {
    const s = FSB_SITES[siteId];
    const p = location.pathname;
    return s.allowPaths.some(a => p === a || p.startsWith(a + "/") || p.startsWith(a + "?"));
  }

  function refresh() {
    siteId = fsbSiteFor(location.hostname, location.pathname);
    const paused = !settings.strict && Date.now() < (settings.pausedUntil || 0);
    active = !!siteId && !!settings.enabled[siteId] && !paused && !isAllowedPath();
    document.documentElement.classList.toggle(CLASS, active);
  }

  // ---- CSS: hide the page scrollbar and stop overflow scrolling ----
  const style = document.createElement("style");
  style.textContent = `
    html.${CLASS}, html.${CLASS} body { overflow: hidden !important; overscroll-behavior: none !important; }
    html.${CLASS}::-webkit-scrollbar, html.${CLASS} body::-webkit-scrollbar { display: none !important; }
    .fsb-toast { position: fixed; left: 50%; bottom: 32px; transform: translateX(-50%); z-index: 2147483647;
      background: #1c1e21; color: #fff; padding: 12px 20px; border-radius: 12px; font: 600 15px system-ui, sans-serif;
      box-shadow: 0 6px 24px rgba(0,0,0,.35); pointer-events: none; transition: opacity .3s; }`;
  (document.head || document.documentElement).appendChild(style);

  // ---- is this event inside something that's allowed to scroll (chats)? ----
  function insideAllowed(target) {
    if (!(target instanceof Element)) return false;
    const sel = FSB_SITES[siteId].allowInside;
    return sel.length > 0 && !!target.closest(sel.join(","));
  }

  function editable(t) {
    return t instanceof Element && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
  }

  // ---- block the inputs ----
  function block(e) {
    if (!active || insideAllowed(e.target)) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    noteAttempt();
  }
  window.addEventListener("wheel", block, { capture: true, passive: false });
  window.addEventListener("touchmove", block, { capture: true, passive: false });
  window.addEventListener("keydown", (e) => {
    if (!active || !SCROLL_KEYS.has(e.key) || editable(e.target) || insideAllowed(e.target)) return;
    block(e);
  }, { capture: true });

  // ---- middle-click autoscroll (the browser scrolls on its own, no wheel events) ----
  // Middle-click on a link still opens it in a new tab.
  window.addEventListener("mousedown", (e) => {
    if (e.button !== 1 || !active || insideAllowed(e.target)) return;
    if (e.target instanceof Element && e.target.closest("a[href]")) return;
    block(e);
  }, { capture: true, passive: false });

  // ---- anything that still scrolls (scrollbar drag, page scripts) snaps back ----
  const limit = () => Math.round(window.innerHeight * 0.6); // the top part of the page stays usable
  document.addEventListener("scroll", (e) => {
    if (!active) return;
    const el = e.target === document ? document.scrollingElement : e.target;
    if (!el || insideAllowed(el)) return;
    if (el.scrollTop > limit()) { el.scrollTop = limit(); noteAttempt(); }
  }, { capture: true, passive: true });
  window.addEventListener("scroll", () => {
    if (active && window.scrollY > limit()) { window.scrollTo(0, limit()); noteAttempt(); }
  }, { passive: true });

  // ---- feedback + stats ----
  function noteAttempt() {
    const now = Date.now();
    if (now - lastToast < 1500) return;          // count one attempt per gesture
    lastToast = now;
    pendingCount++;
    toast(siteId === "facebook" ? "Feed scrolling is blocked 🙅  Messages still work." : "Feed scrolling is blocked 🙅");
    chrome.storage.local.get({ stats: {} }, ({ stats }) => {
      stats[siteId] = (stats[siteId] || 0) + pendingCount;
      pendingCount = 0;
      chrome.storage.local.set({ stats });
    });
  }

  function toast(text) {
    if (!document.body) return;
    const t = document.createElement("div");
    t.className = "fsb-toast";
    t.textContent = text;
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = "0"; }, 1400);
    setTimeout(() => t.remove(), 1800);
  }

  // ---- Facebook changes pages without reloading: watch the URL ----
  let lastUrl = location.href;
  setInterval(() => {
    if (location.href !== lastUrl) { lastUrl = location.href; refresh(); }
    // pause may have expired
    if (!active && siteId && settings.pausedUntil && Date.now() >= settings.pausedUntil) refresh();
  }, 300);
  window.addEventListener("popstate", refresh);
})();
