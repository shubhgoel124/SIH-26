"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

const roleOptions = [
  { value: "trainee", label: "Trainee" },
  { value: "trainer", label: "Trainer" },
  { value: "admin", label: "Admin" },
]

export function SignUpForm() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = name.trim()
    const trimmedEmail = email.trim()
    if (!trimmedName) {
      toast.error("Full name is required")
      return
    }
    if (!trimmedEmail) {
      toast.error("Email is required")
      return
    }
    if (!password || password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }
    if (!role) {
      toast.error("Please select a role")
      return
    }
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch("/api/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, email: trimmedEmail, password, role }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Sign-up failed")
        return
      }
      setMessage(data.message ?? "Account created.")
      toast.success("Registration submitted")
      if (role === "trainee") {
        setTimeout(() => router.push("/sign-in"), 2000)
      }
    } catch {
      toast.error("Network error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-slate-200/80 bg-white/90 shadow-lg backdrop-blur">
      <CardHeader>
        <CardTitle className="text-2xl text-slate-900">Create account</CardTitle>
        <CardDescription>Join SANGAM Capacity Connect with your role.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name" required>
              Full name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Asha Verma"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" required>
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. asha.verma@organisation.gov.in"
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-role" required>
              Role
            </Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="signup-role">
                <SelectValue placeholder="Select Trainee, Trainer, or Admin" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(role === "trainer" || role === "admin") && (
              <p className="text-xs text-slate-500">
                Trainer and admin accounts require administrator approval before sign-in.
              </p>
            )}
          </div>
          <Button type="submit" className="w-full bg-sky-600 hover:bg-sky-700" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Sign up"
            )}
          </Button>
        </form>

        {message && (
          <p className="mt-4 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-slate-800">{message}</p>
        )}

        <p className="mt-4 text-center text-sm text-slate-600">
          Already registered?{" "}
          <Link href="/sign-in" className="font-medium text-sky-600 hover:text-sky-700">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
