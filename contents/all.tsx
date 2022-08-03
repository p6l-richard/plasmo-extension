import cssText from "data-text:~/contents/plasmo-overlay.css"
import type { PlasmoContentScript } from "plasmo"
import { useEffect, useState } from "react"
import { onMessage, sendMessage } from "webext-bridge"

export const config: PlasmoContentScript = {
  matches: ["https://*/*"]
}

const DIV_ID = "plasmo-shadow-div"
const SHADOW_STYLE_ID = "shadow-styling"

// We use the getRootContainer to inject the shadow host in our own way
export const getRootContainer = async () => {
  const container = document.createElement("div")

  container.id = "plasmo-shadow-container"

  container.style.cssText = `
    display: none;
    z-index: 1;
    position: absolute;
  `

  // This is the div that the shadow host will be inserted into
  const shadowHost = document.createElement("div")
  shadowHost.id = DIV_ID

  const shadowRoot = shadowHost.attachShadow({ mode: "open" })
  document.body.insertAdjacentElement("beforebegin", shadowHost)

  shadowRoot.appendChild(await getStyle())

  shadowRoot.appendChild(container)
  return container
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.id = SHADOW_STYLE_ID
  style.textContent = cssText
  return style
}
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

  // clean up the initial display: none from style element so that we can toggle
  // Now, we can inverse visibility
  // note (richard): `flex` is somewhat random here
  const shadowContainer = document
    ?.getElementById(DIV_ID)
    ?.shadowRoot?.getElementById("plasmo-shadow-container")
  if (!shadowContainer) {
    alert(`style element within shadowRoot not found!`)
    return { success: false }
  }
  shadowContainer.style.display =
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
