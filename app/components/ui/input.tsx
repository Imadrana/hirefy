import * as React from "react" // imports React for component and ref

import { cn } from "../../lib/utils" // imports class name utility function (merges Tailwind classes)

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>( // defines Input component with forwarded ref
  ({ className, type, ...props }, ref) => { // destructures props and ref
    return ( // returns JSX
      <input
        type={type} // input type (text, email, password, etc.)
        className={cn( // combines default styles + custom class
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", // default input styling
          className // adds any extra className passed from outside
        )}
        ref={ref} // forwards the ref to the actual input element
        {...props} // spreads remaining props like onChange, placeholder, etc.
      />
    )
  }
) // closes forwardRef

Input.displayName = "Input" // sets display name for debugging in React DevTools

export { Input } // exports Input component for use in other files
