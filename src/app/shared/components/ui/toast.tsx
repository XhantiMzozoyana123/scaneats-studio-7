import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"

import { cn } from "@/app/shared/lib/utils"
import { Button } from "@/components/ui/button"

const ToastProvider = ToastPrimitives.Provider
const ToastViewport = ToastPrimitives.Viewport
const Toast = ToastPrimitives.Root
const ToastTitle = ToastPrimitives.Title
const ToastDescription = ToastPrimitives.Description
const ToastClose = ToastPrimitives.Close
const ToastAction = ToastPrimitives.Action

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}