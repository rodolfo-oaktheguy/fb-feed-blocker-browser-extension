// Which sites can be blocked, and where scrolling is still allowed on each.
// allowPaths: URL paths that are never blocked (messages).
// allowInside: CSS selectors; scrolling inside these boxes is allowed (chat popups).
// onlyPaths: if set, block ONLY on these paths (YouTube Shorts).
const FSB_SITES = {
  facebook: {
    label: "Facebook", hosts: ["facebook.com"], defaultOn: true,
    allowPaths: ["/messages", "/messenger_media", "/settings"],
    allowInside: ['[role="dialog"]', '[aria-label*="Chat" i]', '[aria-label*="Messenger" i]',
                  '[aria-label*="Notifications" i]']
  },
  instagram: {
    label: "Instagram", hosts: ["instagram.com"], defaultOn: false,
    allowPaths: ["/direct", "/accounts"], allowInside: ['[role="dialog"]']
  },
  twitter: {
    label: "Twitter (X)", hosts: ["x.com", "twitter.com"], defaultOn: false,
    allowPaths: ["/messages", "/settings"], allowInside: ['[role="dialog"]']
  },
  reddit: {
    label: "Reddit", hosts: ["reddit.com"], defaultOn: false,
    allowPaths: ["/message", "/chat", "/settings"], allowInside: []
  },
  linkedin: {
    label: "LinkedIn", hosts: ["linkedin.com"], defaultOn: false,
    allowPaths: ["/messaging", "/jobs"], allowInside: ['[class*="msg-overlay"]']
  },
  tiktok: {
    label: "TikTok", hosts: ["tiktok.com"], defaultOn: false,
    allowPaths: ["/messages"], allowInside: []
  },
  shorts: {
    label: "YouTube Shorts", hosts: ["youtube.com"], defaultOn: false,
    onlyPaths: ["/shorts"], allowPaths: [], allowInside: []
  }
};

function fsbSiteFor(hostname, pathname) {
  for (const [id, s] of Object.entries(FSB_SITES)) {
    if (!s.hosts.some(h => hostname === h || hostname.endsWith("." + h))) continue;
    if (s.onlyPaths && !s.onlyPaths.some(p => pathname.startsWith(p))) continue;
    return id;
  }
  return null;
}

function fsbDefaults() {
  const enabled = {};
  for (const [id, s] of Object.entries(FSB_SITES)) enabled[id] = s.defaultOn;
  return { enabled, strict: false, pausedUntil: 0, stats: {} };
}
