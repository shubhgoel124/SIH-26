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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setFormError(null)

    if (!selectedRole) {
      setFormError("Please select your role.")
      setIsLoading(false)
      return
    }

    try {
      const result = await signIn("credentials", {
        email,
        password,
        role: selectedRole,
        redirect: false,
      })

      if (result?.error) {
        setFormError("Invalid credentials or account pending approval.")
        return
      }

      router.push(roleRoutes[selectedRole] ?? "/trainee")
    } catch {
      setFormError("Unexpected error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

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
          <p className="mt-2 text-sm text-slate-600">Capacity Connect — sign in to your dashboard</p>
        </div>

        <Card className="border-slate-200/80 bg-white/90 shadow-lg backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-900">Sign in</CardTitle>
            <CardDescription>Use your registered email, password, and role.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@sangam.dev"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole} required>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
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

            <div className="mt-6 rounded-xl border border-sky-100 bg-sky-50/50 p-4 text-sm text-slate-700">
              <p className="mb-2 font-semibold text-slate-800">Demo credentials</p>
              <ul className="space-y-1 text-xs sm:text-sm">
                <li>trainee@sangam.dev / password (Trainee)</li>
                <li>trainer@sangam.dev / password (Trainer)</li>
                <li>admin@sangam.dev / password (Admin)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
