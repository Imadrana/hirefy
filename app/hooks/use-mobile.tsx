// ChatGPT Prompt Used
/*
Write a small reusable React hook in TypeScript called useIsMobile.

Requirements:

It should determine whether the current viewport width is below a specific mobile breakpoint, for example 768px.

Use the window.matchMedia() API to detect screen width changes dynamically.

When the screen resizes or when the component first mounts, the hook should update its state accordingly.

Return a boolean value indicating whether the user is on a mobile device (true if below the breakpoint, false otherwise).

The default value of the state should be undefined until the first calculation is done, then resolve to a boolean.

Clean up any event listeners when the component unmounts.

Use idiomatic modern React with useState and useEffect.

Keep the code clean, simple, and properly typed with TypeScript.

You can define the breakpoint as a constant, e.g. const MOBILE_BREAKPOINT = 768.

Please include the full TypeScript code for the hook — including imports and any constants — so I can drop it into a useIsMobile.ts file directly.*/
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
