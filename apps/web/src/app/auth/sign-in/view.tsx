"use client"

import { LoginForm } from "@/components/auth/signin-form"
export function AuthView() {
  return (
    <main className="flex grow flex-col items-center justify-center gap-4 p-4">
      <LoginForm />
    </main>
  )
}
