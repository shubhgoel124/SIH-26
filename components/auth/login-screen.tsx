"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { SangamLogo } from "@/components/sangam/logo"

const roleOptions = [
  { value: "trainee", label: "Trainee" },
  { value: "trainer", label: "Trainer" },
  { value: "admin", label: "Admin" },
]

const roleRoutes: Record<string, string> = {
  trainee: "/trainee",
  trainer: "/trainer",
  admin: "/admin",
}

const demos = [
  { email: "trainee@sangam.dev", password: "password", role: "trainee", label: "Trainee" },
  { email: "trainer@sangam.dev", password: "password", role: "trainer", label: "Trainer" },
  { email: "admin@sangam.dev", password: "password", role: "admin", label: "Admin" },
]

export function LoginScreen() {
  const router = useRouter()
  const search = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [selectedRole, setSelectedRole] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const urlError = useMemo(() => {
    const err = search.get("error")
    if (!err) return null
    if (err === "CredentialsSignin") {
      return "Invalid credentials or role. Check your details and try again."
    }
    return "Unable to sign in. Please try again."
  }, [search])

  const doSignIn = async (creds: { email: string; password: string; role: string }) => {
    setIsLoading(true)
    setFormError(null)
    try {
      const result = await signIn("credentials", {
        email: creds.email,
        password: creds.password,
        role: creds.role,
        redirect: false,
      })
      if (result?.error) {
        setFormError("Invalid credentials or account pending approval.")
        return
      }
      router.push(roleRoutes[creds.role] ?? "/trainee")
      router.refresh()
    } catch {
      setFormError("Unexpected error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-slate-50 text-slate-900">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),transparent_55%),radial-gradient(circle_at_80%_20%,rgba(56,189,248,0.12),transparent_40%),linear-gradient(180deg,rgba(226,241,255,0.85),transparent)]"
        aria-hidden="true"
      />
      <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center px-3 py-8 sm:px-4 sm:py-12">
        <div className="mb-6 flex justify-center px-1 sm:mb-8">
          <Link href="/" className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-sky-400">
            <SangamLogo
              variant="stacked"
              size={48}
              className="sm:[&_svg]:h-14 sm:[&_svg]:w-14"
              subtitle="Capacity Connect — sign in to your dashboard"
            />
          </Link>
        </div>

        <Card className="border-slate-200/80 bg-white/95 shadow-xl shadow-sky-100/60 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-900">Sign in</CardTitle>
            <CardDescription>Use your registered email, password, and role.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                if (!selectedRole) {
                  setFormError("Please select your role.")
                  return
                }
                doSignIn({ email, password, role: selectedRole })
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="email" required>
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="e.g. trainee@sangam.dev"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" required>
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" required>
                  Role
                </Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select Trainee, Trainer, or Admin" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(formError || urlError) && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                  {formError ?? urlError}
                </p>
              )}

              <Button type="submit" className="w-full bg-sky-600 hover:bg-sky-700" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-slate-600">
              New here?{" "}
              <Link href="/sign-up" className="font-medium text-sky-600 hover:text-sky-700">
                Create an account
              </Link>
            </p>

            <div className="mt-6 space-y-3 rounded-xl border border-sky-100 bg-sky-50/70 p-4">
              <p className="text-sm font-semibold text-slate-800">Quick demo access</p>
              <div className="grid grid-cols-3 gap-2">
                {demos.map((d) => (
                  <Button
                    key={d.role}
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                    className="border-sky-200 bg-white text-sky-800 hover:bg-sky-100"
                    onClick={() => {
                      setEmail(d.email)
                      setPassword(d.password)
                      setSelectedRole(d.role)
                      doSignIn(d)
                    }}
                  >
                    {d.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
