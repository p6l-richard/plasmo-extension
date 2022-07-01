## Background -> Content Script communication
> One of the deceptively tricky parts of browser extension development is figuring out how to pass a message from your background service worker to a tab's content script.
> The path forward is filled with edge cases!
> - What if the tab is a chrome:// or chrome.google.com protected URL?
> - What if your extension updated and the content script in the tab is of an old version?
> - What if the tab you're on doesn't have your content script at all because your extension was installed after the web page loaded up?
> 
> These are all things you need to consider when passing a message from the background service worker to the tab.

From a [Plasmo RFC](https://github.com/PlasmoHQ/plasmo/issues/76)

## About this repo
This repo implements a naive example of background -> content communication.
It uses:
- [`Plasmo`](https://github.com/PlasmoHQ/plasmo)
- [`webext-bridge`](https://github.com/antfu/webext-bridge)

Give the quoted edge cases, it presents some issues for development, that are hidden by the dependency using webext-bridge.

## Demo
🚨 GOTCHA: Breaks after _reloading_ extension
The user needs to reload tabs/pages for this to work
**Note**: Because it usese webext-bridge, the service worker's logs don't even show the `chrome.runtime.lastError`, which makes it especially tricky to debug.
If you don't use webext-bridge, you'll at least get notified about the error in the service worker logs:

> Unchecked runtime.lastError: Could not establish connection. Receiving end does not exist -- How to make background & content script establish a connection when either side is ready?

https://user-images.githubusercontent.com/18185649/175838271-d28f0aee-906d-4d20-ac08-a5fd5e8a3787.mov

