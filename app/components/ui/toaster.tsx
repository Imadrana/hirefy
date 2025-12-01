//// ChatGPT Prompt Used
//“create a reusable Toaster component in Next.js using shadcn/ui toast primitives.
//it should import useToast from a custom hook and render active toasts inside a ToastProvider.
//map through all toasts, showing title, description, action button (if any), and include ToastClose and ToastViewport.
//mark it with 'use client' since it uses hooks.”
"use client"

import { useToast } from "../../hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "../ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
