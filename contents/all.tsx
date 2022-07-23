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
    //    ^?
    "getProfileUserInfo",
    { variant: "silently" },
    "background"
  )
  // alert user in tab about action click
  alert(`Hi, ${userInfo.email}!`)

  // return response to background script
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
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 16
      }}>
      <h1>Welcome {userInfo?.email}!</h1>
    </div>
  )
}
