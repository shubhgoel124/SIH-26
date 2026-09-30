import type { Metadata } from "next"
import Link from "next/link"
import { SignUpForm } from "@/components/auth/sign-up-form"
import { SangamLogo } from "@/components/sangam/logo"

export const metadata: Metadata = {
  title: "Sign up | SANGAM",
  description: "Create a SANGAM Capacity Connect account",
}

export default function SignUpPage() {
  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-slate-50 text-slate-900">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.15),transparent_50%),radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.1),transparent_40%),linear-gradient(180deg,rgba(226,241,255,0.7),transparent)]"
        aria-hidden="true"
      />
      <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center px-3 py-8 sm:px-4 sm:py-12">
        <div className="mb-6 flex justify-center px-1 sm:mb-8">
          <Link href="/" className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-sky-400">
            <SangamLogo variant="stacked" size={48} subtitle="Capacity Connect registration" />
          </Link>
        </div>
        <SignUpForm />
      </div>
    </div>
  )
}
