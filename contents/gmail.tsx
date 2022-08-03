import icon from "data-base64:~assets/icon512.png"
import type { PlasmoContentScript } from "plasmo"
import { ReactElement, useEffect } from "react"
import { createRoot } from "react-dom/client"

export const config: PlasmoContentScript = {
  matches: ["https://mail.google.com/mail/u/0/*"] // test on: https://mail.google.com/mail/u/0/#inbox?compose=new
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

// CUSTOM getRootContainer INJECTION
// note (richard): We want to prevail Gmail styling on our root container, so we provide plasmo with our own
const CONTAINER_ID = "agreeto-item"
export const getRootContainer = async () => {
  let rootContainer // to return later

  // wait until the Gmail compose windows' bottom sheet(s) is inserted to the DOM
  // TODO: use performance-optimised waitForElement instead
  const messageWindows = await waitForElements(".btC")

  // insert rootContainer
  messageWindows.forEach((messageWindowHotbar) => {
    if (!messageWindowHotbar.querySelector(`#${CONTAINER_ID}`)) {
      // create container with our custom ID
      const container = document.createElement("div")
      container.id = CONTAINER_ID

      // insert next to send button
      const sendButton = messageWindowHotbar.childNodes.item(0)
      sendButton?.parentNode?.insertBefore(container, sendButton.nextSibling)

      // persist container outside of closure
      rootContainer = container
    }
  })
  // ✅ return rootContainer to mount react onto
  return rootContainer
}

// HELPER
/**
 * A helper function that awaits for a query selector to be inserted into the DOM
 *
 * Note (richard): Inspired by https://stackoverflow.com/a/61511955/5608461
 */
const waitForElements = (selector) => {
  return new Promise<NodeListOf<HTMLElement>>((resolve) => {
    if (document.querySelectorAll(selector)) {
      return resolve(document.querySelectorAll(selector))
    }

    const observer = new MutationObserver((mutations) => {
      const target = mutations.addedNodes.find((node) =>
        node.matchesSelector(selector)
      )
      if (target) {
        resolve(target)
        observer.disconnect()
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
  })
}

/**
 * A helper function that awaits an HTML element to be inserted into the DOM
 *
 * Note (richard):
 * API Inspired by https://stackoverflow.com/a/61511955/5608461
 * Performance notes (inspired by https://stackoverflow.com/a/38882022/5608461):
 * - on success, disconnect the observer & attach a new one (ideally, provide a `parent` param to attach it non-recursively by setting subtree: false)
 * - if you can't use getElementById, prefer getElementsByTagName and getElementsByClassName and _avoid_ querySelector and especially the extremely slow querySelectorAll
 * - If querySelectorAll is absolutely unavoidable inside MutationObserver callback, first perform the querySelector check, on the average such combo will be much faster.
 * - avoid for loops (or array methods) inside the MutationObserver callback
 */
const waitForElement = (
  props:
    | { id: string; parent?: HTMLElement }
    | { className: string; parent?: HTMLElement }
) => {
  const id = props?.id
  const className = props?.className
  return new Promise<HTMLElement>((resolve) => {
    // if element already present, return
    const earlyElement = id
      ? document.getElementById(id)
      : document.getByClassName(className)
    if (earlyElement) {
      return resolve(earlyElement)
    }

    // else observe dom mutations for our element
    const observer = new MutationObserver((mutations) => {
      // was the element added to the entire document?
      const addedElement = id
        ? document.getElementById(id)
        : document.getByClassName(className)
      if (addedElement) {
        resolve(addedElement)
        // always disconnect observer on success
        observer.disconnect()
      }
    })

    // attach a new non-recursive observer on a provided element (or document.body if none provided)
    observer.observe(parent || document.body, {
      childList: true,
      // note (richard): Whenever possible observe direct parents non-recursively (subtree: false).
      subtree: !Boolean(parent)
    })
  })
}

export default GmailItem
