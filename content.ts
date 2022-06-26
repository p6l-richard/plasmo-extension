import type { PlasmoContentScript } from "plasmo"

export const config: PlasmoContentScript = {
  matches: ["https://*/*"]
}

let hasConnection = false
// THIS IS NOW TOP-LEVEL
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(
    sender.tab
      ? "from a content script:" + sender.tab.url
      : "from the extension"
  )
  console.log({ request })
  sendResponse("HI from content")
  return true
})

// NO LOGS ?

function ping() {
  if (hasConnection) return
  chrome.runtime.sendMessage("ping", (response) => {
    console.log({ response })
    if (chrome.runtime.lastError) {
      setTimeout(ping, 1000)
    } else {
      hasConnection = response
    }
  })
}

ping()
