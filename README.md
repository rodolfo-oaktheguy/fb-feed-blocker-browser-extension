# FB Feed Scroll Blocker

A browser extension that stops endless scrolling on the Facebook newsfeed **without breaking Messenger**.

Most feed blockers block all of Facebook, which also kills Messages. This one blocks feed scrolling and leaves `facebook.com/messages` and the Messenger chat popups fully usable.

## Features

- Blocks feed scrolling on Facebook: mouse wheel, touchpad, keyboard (Space, arrows, Page Down, End), touch, and scrollbar dragging
- Keeps `/messages` (including `/messages/t/...`) and Messenger chat popups scrollable
- The top of the page stays usable, so you can still post and check notifications
- Optional blocking for Instagram, Twitter (X), Reddit, LinkedIn, TikTok and YouTube Shorts, each with its own messages allow-list
- **Strict Mode**: removes the "allow scrolling for 5 minutes" button
- Counts blocked scroll attempts per site
- No network requests and no tracking; only the `storage` permission for settings and stats

## How it works

Facebook is a single-page app and scrolls its feed in several ways, so hiding the scrollbar with CSS alone isn't enough. The content script (`extension/content.js`):

1. **Blocks the inputs that scroll.** Capturing `wheel`, `touchmove` and scroll-key `keydown` listeners call `preventDefault()` unless the event happens inside an allowed area (a chat popup or dialog).
2. **Snaps back anything that still scrolls.** A capturing `scroll` listener pushes the page and any inner scrolling box back to the top screen.
3. **Hides the scrollbar** with a CSS class on `<html>`.
4. **Follows in-app navigation.** It watches `location.href`, so going from the feed to Messages unlocks scrolling instantly, with no reload.

Per-site rules (allowed paths and allowed areas) live in `extension/sites.js`.

## Install (Brave, Opera GX, Chrome, Edge)

1. Download or clone this repo.
2. Open your browser's extensions page: `brave://extensions`, `opera://extensions` or `chrome://extensions`.
3. Turn on **Developer mode**.
4. Click **Load unpacked** and select the **`extension`** folder.
5. Reload Facebook.

Click the extension's icon to pick sites, turn on Strict Mode, or see your stats.

## Project structure

```
extension/
  manifest.json   Manifest V3 config
  sites.js        Site list and allow-lists
  content.js      Scroll blocking
  popup.html/js   Settings and stats popup
```
