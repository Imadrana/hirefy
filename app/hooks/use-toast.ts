// ChatGPT Prompt Used
/*I want to create a custom toast (notification) system in React, similar to how the react-hot-toast library works, but built manually for my own app.

Please write a complete client component (start with "use client") in TypeScript that exports both a useToast hook and a toast() function.

Here’s what I need it to do:

🔧 General Requirements:

It should be a self-contained toast management system using only React (no external state libraries).

Use React state and effect hooks (useState, useEffect) to manage toast state updates.

Each toast should have an id, title, description, and optionally an action element.

Create types using ToastProps and ToastActionElement (assume they’re imported from a Shadcn-style toast UI component).

Use a reducer pattern (reducer, dispatch) to manage toast actions.

Use constants for action types: ADD_TOAST, UPDATE_TOAST, DISMISS_TOAST, and REMOVE_TOAST.

Support automatic removal of toasts after a delay (e.g., use setTimeout).

Limit the maximum number of visible toasts (e.g., TOAST_LIMIT = 1).

🔁 Functional Details:

Implement a global state (memoryState) to hold all active toasts.

Implement a list of listeners that subscribe to toast state changes so that multiple components using useToast remain in sync.

Create a helper genId() to generate incremental unique IDs for each toast.

When a toast is dismissed, schedule it for removal after a delay (TOAST_REMOVE_DELAY).

The reducer should handle:

Adding a new toast at the top of the list.

Updating an existing toast by ID.

Dismissing (closing) one or all toasts.

Removing one or all toasts from the list.

Expose a toast() function that:

Creates a new toast.

Returns an object containing id, update(), and dismiss() functions.

The useToast() hook should:

Subscribe to global state updates.

Return the current toasts array, the toast() function, and a dismiss() method.

🧩 Code Style:

Use idiomatic, modern React with functional components and hooks.

Keep the code TypeScript-safe (use explicit types for actions, state, etc.).

Define TOAST_LIMIT and TOAST_REMOVE_DELAY constants.

Place "use client" at the top (this will be used in a Next.js 13+ App Router environment).

Keep the implementation framework-agnostic but compatible with Shadcn UI toast components.

Please provide the complete TypeScript code for the useToast hook and toast function in one file — ready to paste into a use-toast.ts file.*/
"use client"

// Inspired by react-hot-toast library
import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, "id">

function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }
