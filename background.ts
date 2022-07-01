import { sendMessage } from "webext-bridge"

// -- Send event to content-script on action click --

// Types
export interface HandleActionClick {
  key: "showModal"
  payload: { message: string }
  response: { success: true }
}
// Send event
chrome.action.onClicked.addListener(async (currentTab) => {
  // early return if tab is inactive or doesn't have an id
  if (!currentTab?.id || !currentTab.active) {
    return
  }

  // 🚨 GOTCHA: Breaks after reloading extension
  // The user needs to reload tabs/pages for this to work
  // note: it doesnt even provide chrome.runtime.lastError if used with webext-bridge

  // send message from background to content
  const res = await sendMessage<
    HandleActionClick["response"],
    HandleActionClick["key"]
  >(
    "showModal",
    { message: "action was clicked" },
    {
      context: "content-script",
      tabId: currentTab.id
    }
  )
  // ... after content responded, log response to background's console
  console.log("response received - modal showed? ", res)
})

export {}
