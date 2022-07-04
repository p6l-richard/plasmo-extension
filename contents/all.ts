import type { PlasmoContentScript } from "plasmo"
import { onMessage } from "webext-bridge"

import type { HandleActionClick } from "~background"

export const config: PlasmoContentScript = {
  matches: ["https://*/*"]
}

// Handle action click in content-script
onMessage<HandleActionClick["payload"], HandleActionClick["key"]>(
  "showModal",
  ({ data }) => {
    // alert user in tab about action click
    alert(data.message)
    // return response to background script
    return { success: true }
  }
)
