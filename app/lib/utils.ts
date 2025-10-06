//// ChatGPT Prompt Used
//“create a utility function for merging Tailwind CSS class names in Next.js using clsx and tailwind-merge.
//it should take multiple class values and return a merged string.
//export the function named cn.”
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}