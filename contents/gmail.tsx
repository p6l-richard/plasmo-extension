import type { PlasmoContentScript } from "plasmo"
import icon from "data-base64:~assets/icon512.png"

export const config: PlasmoContentScript = {
  matches: ["https://mail.google.com/mail/u/0/*"] // test on: https://mail.google.com/mail/u/0/#inbox?compose=new
}

// PROGRAMATICALLY INJECT EXTENSION CONTAINER & MOUNT

const observer = new MutationObserver(() => {

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
})
var RETRY_INTERVAL = 500;

const rejectDelay = (reason) => {
    return new Promise(function(resolve, reject) {
        setTimeout(reject.bind(null, reason), RETRY_INTERVAL); 
    });
}

// const waitAndReturnAgreeToItem = () => {
//   const agreeToItem = document.querySelector("#agreeto-item")
//   console.log("[waitAndReturnAgreeToItem] ", agreeToItem)
//   if (!agreeToItem) {
//     setTimeout(() => waitAndReturnAgreeToItem(), 1000)
//   }
//   return agreeToItem
// }
let attemptCount = 0
const attempt = async () => {
  attemptCount++
  console.log("attempt ",attemptCount)
  const agreeToItem = document.querySelector("#agreeto-item")
  if (!agreeToItem) throw Error("Element with id #agreeto-item not found.")
  return agreeToItem
}
export const getMountPoint = async () => {
  observer.observe(document.body, { childList: true });
  const MAX_RETRIES = 5;
  let promise = Promise.reject();
  let result: HTMLElement = null;
  // for range
  [...Array(MAX_RETRIES)].map((_,i) => {
    promise = promise.catch(attempt).catch(rejectDelay)
  });
  promise = promise.then((res) => {console.log("res: ", res); result = res}).catch((err) => console.error(err))
  // return inserted div to mount react
  console.log("after awaited function")
  return result
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
          src={icon}
          style={{ width: "28px", height: "28px" }}
        />
      </button>
    </div>
  )
}

export default GmailItem
