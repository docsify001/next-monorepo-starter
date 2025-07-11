"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogTrigger } from "@repo/ui/components/dialog"
import { LoginForm } from "@/components/auth/signin-form"
import { Button } from "@repo/ui/components/button"

interface LoginModalProps {
  trigger?: React.ReactNode
  onSuccess?: () => void
}

export function LoginModal({ trigger, onSuccess }: LoginModalProps) {
  const [open, setOpen] = useState(false)

  const handleSuccess = () => {
    setOpen(false)
    onSuccess?.()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || <Button>登录</Button>}</DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 border-none">
        <LoginForm onSuccess={handleSuccess} onCancel={() => setOpen(false)} isModal={true} />
      </DialogContent>
    </Dialog>
  )
}
