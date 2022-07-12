import type { PlasmoContentScript } from "plasmo"
import icon from "data-base64:~assets/icon512.png"
import { ReactElement, useEffect } from "react";
import { createRoot } from "react-dom/client";

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
  let rootContainer; // to return later

  // wait until the Gmail compose windows' bottom sheet(s) is inserted to the DOM 
  const messageWindows = await waitForElements(".btC");
  
  // insert rootContainer
  messageWindows.forEach((messageWindowHotbar) => {
    if (!messageWindowHotbar.querySelector(`#${CONTAINER_ID}`)) {
      // create container with our custom ID
      const container = document.createElement("div");
      container.id = CONTAINER_ID;

      // insert next to send button
      const sendButton = messageWindowHotbar.childNodes.item(0);
      sendButton?.parentNode?.insertBefore(container, sendButton.nextSibling);
      
      // persist container outside of closure
      rootContainer = container;
    }
  });
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
  return new Promise(resolve => {
      if (document.querySelectorAll(selector)) {
          return resolve(document.querySelectorAll(selector));
      }

      const observer = new MutationObserver(mutations => {
        const target = mutations.addedNodes.find(node => node.matchesSelector(selector))
          if (target) {
              resolve(target);
              observer.disconnect();
          }
      });

      observer.observe(document.body, {
          childList: true,
          subtree: true
      });
  });
}

export default GmailItem