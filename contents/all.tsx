import type { PlasmoContentScript } from "plasmo"
import { useEffect, useState } from "react"
import { onMessage, sendMessage } from "webext-bridge"

export const config: PlasmoContentScript = {
  matches: ["https://*/*"]
}

// Handle action click in content-script
onMessage("showModal", async ({ data }) => {
  // early return
  if (!data.message) return { success: false }

  const userInfo = await sendMessage(
    "getProfileUserInfo",
    { variant: "silently" },
    "background"
  )
  // note (richard): This will work if plasmo accepts a PR to define the shadow host's id
  const plasmoShadowHost = document.getElementById("plasmo-shadow-host")
  if (!plasmoShadowHost) {
    alert(`shadow root not found!`)
    return { success:false }
  }
  // inverse visibility
  plasmoShadowHost.style.display = plasmoShadowHost.style.display === "none" ? "flex" : "none";
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
      aria-modal="true"
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 16
      }}>
      <h1>Welcome {userInfo?.email}!</h1>
    </div>
  )
}
