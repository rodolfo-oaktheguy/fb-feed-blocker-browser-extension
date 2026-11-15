# FB Feed Scroll Blocker

A lightweight browser extension that stops endless scrolling on the Facebook newsfeed **without breaking Messenger**.

Most feed blockers hide or block all of Facebook, which also kills access to Messages. This extension locks scrolling only where it's distracting and leaves `facebook.com/messages` fully usable.

## Features

- Hides the scroll bar and disables page scrolling across facebook.com
- Keeps `/messages` (Messenger on the web) fully scrollable
- Handles Facebook's single-page navigation: moving between the feed and Messages locks or unlocks scrolling instantly, with no reload needed
- Configurable allow-list of paths
- No permissions, no tracking, no network requests: one small content script

## How it works

Facebook is a single-page app, so the URL changes without the page reloading. The content script:

1. Injects a stylesheet at `document_start` that sets `overflow: hidden` and hides the scroll bar whenever `<html>` has a `fbsb-locked` class.
2. Watches `location.href` (polling plus `popstate`) to detect in-app navigation.
3. Toggles the class on or off depending on whether the current path is in the `ALLOWED` list.

Because the lock is a single CSS class, there's no visual flicker and nothing on the page has to be removed or modified.

## Install (Brave, Opera GX, Chrome, Edge)

1. Download or clone this repo.
2. Open your browser's extensions page:
   - Brave: `brave://extensions`
   - Opera GX: `opera://extensions`
   - Chrome: `chrome://extensions`
3. Turn on **Developer mode**.
4. Click **Load unpacked** and select this folder.
5. Reload Facebook.

## Configuration

Edit the allow-list at the top of `content.js`:

```js
const ALLOWED = ["/messages", "/marketplace"];
```

Then click the reload button on the extension's card.

## Tech

- Manifest V3
- Vanilla JavaScript + CSS
- Works on Chromium-based browsers

## License

MIT
