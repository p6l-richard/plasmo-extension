import { rejects } from "assert"

// TYPES
type GetterFunctionsElementList =
  | typeof document.getElementsByClassName
  | typeof document.getElementsByTagName
type GetterFunctionsElementNode = typeof document.getElementById
type WaitForParams = Parameters<typeof waitForCore>[0]

// FUNCTIONS
/**
 * An awaitable function that observers the document for node mutations and returns a list of HTMLElement found either by class or tag name.
 *
 * Uses the singular/plural-agnostic @link waitForCore under the hood
 *
 * @param props accepts a getter function, the getter functions' params & an optional HTMLElement to search for your element
 * @returns
 */
export const waitForElements = <
  GetterFunction extends Extract<
    WaitForParams["getterFunction"],
    GetterFunctionsElementList
  >
>(props: {
  getterFunction: GetterFunction
  params: Extract<WaitForParams["params"], Parameters<GetterFunction>[0]>
  parent?: WaitForParams["parent"]
}) => waitForCore(props)

/**
 * An awaitable function that observers the document for node mutations and returns the HTMLElement found by element id.
 *
 * Uses the singular/plural-agnostic @link waitForCore under the hood
 *
 * The singular version of @link waitForElement
 *
 * @param props accepts a getter function, the getter functions' params & an optional HTMLElement to search for your element
 * @returns
 */
export const waitForElement = <
  GetterFunction extends Extract<
    WaitForParams["getterFunction"],
    GetterFunctionsElementList
  >
>(props: {
  getterFunction: GetterFunction
  params: Extract<WaitForParams["params"], Parameters<GetterFunction>[0]>
  parent?: WaitForParams["parent"]
}) => waitForCore(props)

// CORE
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
const waitForCore = <
  GetterFunction extends GetterFunctionsElementNode | GetterFunctionsElementList
>({
  getterFunction,
  params,
  parent
}: {
  getterFunction: GetterFunction
  params: Parameters<GetterFunction>[0]
  parent?: HTMLElement
}) => {
  return new Promise<ReturnType<GetterFunction>>((resolve, rejects) => {
    if (typeof window === "undefined") {
      return rejects(
        new Error("Only supported in a context of a window object")
      )
    }
    // if element already present, return
    // note (richard): this .call binds this to the document to avoid illegal invocation
    if (getterFunction.call(document, params)) {
      // note(richard): casting as the compiler isn't able to narrow the return union
      return resolve(
        getterFunction.call(document, params) as ReturnType<GetterFunction>
      )
    }

    // else observe dom mutations for our element
    const observer = new MutationObserver(() => {
      // was the element added to the entire document?
      if (getterFunction.call(document, params)) {
        // note(richard): casting as the compiler isn't able to narrow the return union
        resolve(
          getterFunction.call(document, params) as ReturnType<GetterFunction>
        )
        // always disconnect observer on success
        observer.disconnect()
      }
    })

    // attach a new non-recursive observer on a provided element (or document.body if none provided)
    observer.observe(parent || document.body, {
      childList: true,
      // note (richard): Whenever possible observe direct parents non-recursively (subtree: false).
      subtree: !parent
    })
  })
}
