chrome.action.onClicked.addListener((currentTab) => {
  if (!currentTab?.id) {
    return
  }
  chrome.tabs.sendMessage(currentTab?.id, "HI FROM BG", (response) =>
    console.log({ response })
  )
})

// PING-PONG
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log({ request })
  if (request === "ping") {
    sendResponse(true)
  }
  return true
})
// background console:
// > {response: undefined}
// Unchecked runtime.lastError: Could not establish connection. Receiving end does not exist.

export {}

// chrome.action.onClicked.addListener(async (currentTab) => {
//   chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
//     const tabId = tabs[0].id
//   })
// })

// PING the content script to avoid lastError: receiving end not ready
// let tab: chrome.tabs.Tab
// function pingAndConnect() {
//   chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//     tab = Boolean(tabs[0]?.id) ? tabs[0] : tab

//     if (tab.id) {
//       chrome.tabs.sendMessage(tab.id, { message: "ping" }, (response) => {
//         console.log("err?", chrome.runtime.lastError)
//         if (chrome.runtime.lastError) {
//           setTimeout(pingAndConnect, 1000)
//         } else {
//           var port = chrome.tabs.connect(tab.id, { name: "hi" })
//           console.log("connected to port:", port.name)
//           port.postMessage({ greeting: "hello" })
//           port.onMessage.addListener((response) => console.log({ response }))
//         }
//       })
//     }
//   })
// }

// chrome.action.onClicked.addListener(async (currentTab) => {
//   pingAndConnect()
// })

// chrome.runtime.onConnect.addListener((port) => {
//   port.onMessage.addListener((msg) => {
//     // Handle message however you want
//     console.log("Not sure when this is triggered?")
//   })
// })

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) =>
//   sendResponse("pong")
// )
