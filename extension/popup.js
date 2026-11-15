const $ = (id) => document.getElementById(id);

function render(s) {
  const sites = $("sites"), stats = $("stats");
  sites.innerHTML = ""; stats.innerHTML = "";
  let total = 0;
  for (const [id, site] of Object.entries(FSB_SITES)) {
    const l = document.createElement("label");
    l.className = "site";
    l.innerHTML = `<input type="checkbox" data-id="${id}"> <span></span>`;
    l.querySelector("span").textContent = site.label;
    l.querySelector("input").checked = !!s.enabled[id];
    sites.appendChild(l);

    const n = s.stats[id] || 0; total += n;
    const d = document.createElement("div");
    d.innerHTML = "<span></span><strong></strong>";
    d.querySelector("span").textContent = site.label;
    d.querySelector("strong").textContent = n;
    stats.appendChild(d);
  }
  $("total").textContent = total;
  $("strict").checked = !!s.strict;
  $("pause").disabled = !!s.strict;
  const left = Math.ceil(((s.pausedUntil || 0) - Date.now()) / 60000);
  $("status").textContent = !s.strict && left > 0 ? `Scrolling allowed for ${left} more min.` : "";
}

function load() { chrome.storage.local.get(fsbDefaults(), render); }

$("save").addEventListener("click", () => {
  const enabled = {};
  document.querySelectorAll("#sites input").forEach(i => { enabled[i.dataset.id] = i.checked; });
  const strict = $("strict").checked;
  chrome.storage.local.set({ enabled, strict, ...(strict ? { pausedUntil: 0 } : {}) }, () => {
    $("status").textContent = "Saved ✓";
    load();
  });
});

$("pause").addEventListener("click", () => {
  chrome.storage.local.set({ pausedUntil: Date.now() + 5 * 60 * 1000 }, load);
});

$("reset").addEventListener("click", () => {
  chrome.storage.local.set({ stats: {} }, load);
});

$("strict").addEventListener("change", () => { $("pause").disabled = $("strict").checked; });

load();
setInterval(load, 15000);
