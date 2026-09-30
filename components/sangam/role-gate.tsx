"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

const homeForRole: Record<string, string> = {
  trainee: "/trainee",
  trainer: "/trainer",
  admin: "/admin",
}

export function RoleGate({
  allow,
  children,
}: {
  allow: "trainee" | "trainer" | "admin"
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return
    if (!session?.user) {
      router.replace("/sign-in")
      return
    }
    if (session.user.role !== allow) {
      router.replace(homeForRole[session.user.role] ?? "/")
    }
  }, [session, status, allow, router])

  if (status === "loading" || !session?.user || session.user.role !== allow) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sky-600" aria-label="Checking access" />
      </div>
    )
  }

  return <>{children}</>
}
