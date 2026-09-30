import type { Metadata } from "next"
import { Suspense } from "react"
import { LoginScreen } from "@/components/auth/login-screen"

export const metadata: Metadata = {
  title: "Sign in | SANGAM",
  description: "Sign in to SANGAM Capacity Connect",
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-600">Loading...</div>}>
      <LoginScreen />
    </Suspense>
  )
}
