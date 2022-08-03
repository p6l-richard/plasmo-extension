import cssText from "data-text:~/contents/plasmo-overlay.css"
import type { PlasmoContentScript } from "plasmo"
import { useEffect, useState } from "react"
import { onMessage, sendMessage } from "webext-bridge"

export const config: PlasmoContentScript = {
  matches: ["https://*/*"]
}

// element IDs
const SHADOW_HOST_ID = "plasmo-shadow-div"
const SHADOW_STYLE_ID = "shadow-styling"
const PLASMO_CONTAINER_ID = "plasmo-shadow-container"

// We use the getRootContainer to inject the shadow host in our own way
export const getRootContainer = async () => {
  // 1. create a host for with a shadow root
  const shadowHost = document.createElement("div")
  shadowHost.id = SHADOW_HOST_ID
  // note (richard):  hiding initially to enable toggle onMessage
  shadowHost.style.cssText = `
  display: none;
  `
  const shadowRoot = shadowHost.attachShadow({ mode: "open" })
  // inject the shadowHost w/ shadowRoot into the body
  document.body.insertAdjacentElement("beforebegin", shadowHost)
  // add our custom style element for the shadow dom
  shadowRoot.appendChild(getStyleShadowDOM())

  // 2. create and insert container for our application mount
  const container = document.createElement("div")
  container.id = PLASMO_CONTAINER_ID
  container.style.cssText = `
    z-index: 1;
    position: absolute;
  `
  shadowRoot.appendChild(container)

  return container
}

const getStyleShadowDOM = () => {
  const style = document.createElement("style")
  style.id = SHADOW_STYLE_ID
  style.textContent = cssText
  return style
}

// Toggle app visibility on action click in content-script
onMessage("showModal", async ({ data }) => {
  // early return
  if (!data.message) return { success: false }

  // Now, we can inverse visibility
  const shadowContainer = document?.getElementById(SHADOW_HOST_ID)
  if (!shadowContainer) {
    alert(`style element within shadowRoot not found!`)
    return { success: false }
  }
  shadowContainer.style.display =
    // note (richard): `flex` is somewhat random here
    shadowContainer.style.display === "none" ? "flex" : "none"

  return { success: true }
})

export default function AllContent() {
  const [userInfo, setUserInfo] = useState<chrome.identity.UserInfo>()
  useEffect(() => {
    const getProfileUserInfo = async () => {
      const userInfo = await sendMessage(
        "getProfileUserInfo",
        { variant: "silently" },
        "background"
      )
      if (!userInfo.email) return
      setUserInfo(userInfo)
    }
    getProfileUserInfo()
  }, [])

  return (
    <div
      id="extension-dialog"
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 16
      }}>
      <h1>Welcome {userInfo?.email}!</h1>
    </div>
  )
}
