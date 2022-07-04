import type { PlasmoContentScript } from "plasmo"

export const config: PlasmoContentScript = {
  matches: ["https://mail.google.com/mail/u/0/*"] // test on: https://mail.google.com/mail/u/0/#inbox?compose=new
}

// PROGRAMATICALLY INJECT EXTENSION CONTAINER & MOUNT

// select .btC class for the google compose window's bottom sheet
export const getMountPoint = async () => {
  // get all compose windows (user may have multiple open at once)
  const composeWindowHotbars = document.querySelectorAll(".btC")
  // inject item in every hotbar
  for (const hotbar of composeWindowHotbars) {
    // only if not already injected
    if (!hotbar.querySelector("#agreeto-item")) {
      // store send button next to which to insert out item
      const sendButton = hotbar.childNodes.item(0)
      // create our item as a div w/ custom id
      const container = document.createElement("div")
      container.id = "agreeto-item"
      // insert item
      sendButton?.parentNode?.insertBefore(container, sendButton.nextSibling)
    }
  }
  // return inserted div to mount react
  return document.querySelector("#agreeto-item")
}

// REACT COMPONENT TO MOUNT
const GmailItem = () => {
  return (
    <div style={{ paddingLeft: "12px " }}>
      <button
        title="agreeto-icon-button"
        onClick={() => console.log("clicked!")}
        style={{
          padding: "2px",
          border: "none",
          backgroundColor: "transparent",
          cursor: "pointer"
        }}>
        <img
          title="agreeto-logo"
          // src={chrome.runtime.getURL("item-icon.svg")}
          style={{ width: "28px", height: "28px" }}
        />
      </button>
    </div>
  )
}

export default GmailItem
