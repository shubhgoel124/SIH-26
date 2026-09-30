import type { Metadata } from "next"
import Link from "next/link"
import { SignUpForm } from "@/components/auth/sign-up-form"

export const metadata: Metadata = {
  title: "Sign up | SANGAM",
  description: "Create a SANGAM Capacity Connect account",
}

export default function SignUpPage() {
  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.15),transparent_50%),radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.1),transparent_40%),linear-gradient(180deg,rgba(226,241,255,0.7),transparent)]"
        aria-hidden="true"
      />
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-12">
        <div className="mb-8 text-center">
          <Link href="/" className="text-3xl font-bold tracking-tight text-sky-700">
            SANGAM
          </Link>
          <p className="mt-2 text-sm text-slate-600">Capacity Connect registration</p>
        </div>
        <SignUpForm />
      </div>
    </div>
  )
}
