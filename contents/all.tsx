import cssText from "data-text:~/contents/plasmo-overlay.css"
import type { PlasmoContentScript } from "plasmo"
import { useEffect, useState } from "react"
import { onMessage, sendMessage } from "webext-bridge"

export const config: PlasmoContentScript = {
  matches: ["https://*/*"]
}

const SHADOW_STYLE_ID = "shadow-styling"
export const getStyle = () => {
  const style = document.createElement("style")
  style.id = SHADOW_STYLE_ID
  style.textContent = cssText
  return style
}
// this let's us define the shadow host element's id plasmo inserts on the content pages
// note (richard): we need access to this later in our `showModal` message handler to inverse visibility
const SHADOW_HOST_ID = "all-pages-shadow-host"
export const getShadowHostId = () => SHADOW_HOST_ID

const SHADOW_CONTAINER_ID = "plasmo-shadow-container"
// Handle action click in content-script
onMessage("showModal", async ({ data }) => {
  // early return
  if (!data.message) return { success: false }

  // 🚫 ------
  //    accessing shadow dom elements from outside not possible directly
  // const plasmoShadowContainer = document.getElementById(SHADOW_CONTAINER_ID)
  // if (!plasmoShadowContainer) {
  //   alert(`shadow container not found!`)
  //   return { success: false }
  // }
  // const plasmoShadowStyleElement = document.getElementById(SHADOW_STYLE_ID)
  // if (!plasmoShadowStyleElement) {
  //   alert(`shadow style not found!`)
  //   return { success: false }
  // }
  // // inverse visibility
  // // note (richard): `flex` is somewhat random here
  // plasmoShadowContainer.style.display =
  //   plasmoShadowContainer.style.display === "none" ? "flex" : "none"
  // 🚫 -----

  // THIS WORKS AT RUNTIME but I can't define the initial state of the shadowHost.style (I want: display: none)
  const plasmoShadowHost = document.getElementById(SHADOW_HOST_ID)
  if (!plasmoShadowHost) {
    alert(`shadow root not found!`)
    return { success: false }
  }
  const shadowRoot = plasmoShadowHost.shadowRoot
  if (!shadowRoot) {
    alert(`Shadow host doesn't have a shadowRoot attached!`)
    return { success: false }
  }

  // note (richard): cumbersomly remove the initial style tag display reference to enable toggling via `style` prop
  const regex = /(#plasmo-shadow-container\s*{(?:(.|\n)*))(display:\s*none;)/
  const styleContent = shadowRoot.getElementById(SHADOW_STYLE_ID)
  const isHiddenInitially = Boolean(styleContent?.textContent?.match(regex)) // need to store ref before we remove
  console.log("is hidden initially? " + isHiddenInitially, styleContent)
  // clean up the initial display: none from style element so that we can toggle
  if (styleContent) {
    styleContent.textContent?.replace(regex, "$1")
  }
  // Now, we can inverse visibility
  // note (richard): `flex` is somewhat random here
  const shadowContainer = shadowRoot.getElementById(SHADOW_CONTAINER_ID)
  if (!shadowContainer) {
    alert(`style element within shadowRoot not found!`)
    return { success: false }
  }
  shadowContainer.style.display =
    shadowContainer.style.display === "none" || isHiddenInitially
      ? "flex"
      : "none"

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
