// Pages where scrolling is ALLOWED. Everything else on Facebook gets locked.
const ALLOWED = ["/messages"];

const CLASS = "fbsb-locked";

// Inject the CSS once.
const style = document.createElement("style");
style.textContent = `
  html.${CLASS}, html.${CLASS} body {
    overflow: hidden !important;
    scrollbar-width: none !important;
  }
  html.${CLASS}::-webkit-scrollbar,
  html.${CLASS} body::-webkit-scrollbar {
    display: none !important;
  }
`;
(document.head || document.documentElement).appendChild(style);

function isAllowed() {
  const path = location.pathname;
  return ALLOWED.some(p => path === p || path.startsWith(p + "/"));
}

function update() {
  const lock = !isAllowed();
  document.documentElement.classList.toggle(CLASS, lock);
  if (lock) window.scrollTo(0, 0);
}

// Facebook changes pages without reloading, so watch the URL.
let lastUrl = "";
function check() {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    update();
  }
}
check();
setInterval(check, 300);
window.addEventListener("popstate", check);
