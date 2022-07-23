import { ProtocolWithReturn } from "webext-bridge"

import type { HandleActionClick, HandleAuthentication } from "~background"

// webext-bridge shim
declare module "webext-bridge" {
  export interface ProtocolMap {
    showModal: ProtocolWithReturn<
      HandleActionClick["payload"],
      HandleActionClick["response"]
    >
    getProfileUserInfo: ProtocolWithReturn<
      HandleAuthentication["payload"],
      HandleAuthentication["response"]
    >
  }
}
