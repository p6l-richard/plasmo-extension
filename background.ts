import type { Jsonify } from "type-fest"
import { onMessage, sendMessage } from "webext-bridge"

// -- Send event to content-script on action click --

// Types
export interface HandleActionClick {
  key: "showModal"
  payload: { message: string }
  response: { success: boolean }
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

// Types
export interface HandleAuthentication {
  key: "getProfileUserInfo"
  payload: { variant: "silently" }
  response: Promise<Jsonify<chrome.identity.UserInfo>>
}

onMessage("getProfileUserInfo", async () => {
  return await getProfileUserInfoPromise()
})

// wrapping the callback-based chrome.identity.getProfileUserInfo API into a promise for convenience
const getProfileUserInfoPromise = () => {
  return new Promise<chrome.identity.UserInfo>((resolve, reject) => {
    chrome.identity.getProfileUserInfo((res) => {
      if (!res) reject()
      resolve(res)
    })
  })
}

export {}
