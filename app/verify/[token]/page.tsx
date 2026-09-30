"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import QRCode from "qrcode"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Loader2, XCircle } from "lucide-react"

type VerifyPayload = {
  valid?: boolean
  certificate?: {
    title: string
    issuer: string
    issueDate: string
    traineeName?: string
    courseTitle?: string
  }
  message?: string
}

export default function VerifyCertificatePage() {
  const params = useParams()
  const token = params.token as string
  const [data, setData] = useState<VerifyPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    fetch(`/api/verify/${token}`)
      .then((r) => r.json())
      .then((json) => setData(json))
      .catch(() => setData({ valid: false, message: "Verification request failed" }))
      .finally(() => setLoading(false))
  }, [token])

  useEffect(() => {
    if (typeof window === "undefined" || !token) return
    const url = `${window.location.origin}/verify/${token}`
    QRCode.toDataURL(url, { width: 200, margin: 2, color: { dark: "#0369a1", light: "#ffffff" } })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null))
  }, [token])

  const valid = data?.valid === true

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.15),transparent_50%),radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.1),transparent_40%),linear-gradient(180deg,rgba(226,241,255,0.7),transparent)]"
        aria-hidden="true"
      />
      <header className="border-b border-white/60 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold text-sky-700">
            SANGAM
          </Link>
          <Button asChild variant="outline" size="sm">
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12">
        <Card className="border-slate-200/80 bg-white/90 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              Certificate verification
              {!loading && valid && (
                <Badge className="bg-sky-100 text-sky-800" variant="outline">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Valid
                </Badge>
              )}
              {!loading && !valid && (
                <Badge variant="outline" className="border-red-200 bg-red-50 text-red-800">
                  <XCircle className="mr-1 h-3 w-3" />
                  Invalid
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin text-sky-600" />
                Verifying certificate
              </div>
            ) : valid && data?.certificate ? (
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-semibold text-slate-800">Title:</span> {data.certificate.title}
                </p>
                <p>
                  <span className="font-semibold text-slate-800">Issuer:</span> {data.certificate.issuer}
                </p>
                <p>
                  <span className="font-semibold text-slate-800">Issued:</span>{" "}
                  {new Date(data.certificate.issueDate).toLocaleDateString()}
                </p>
                {data.certificate.traineeName && (
                  <p>
                    <span className="font-semibold text-slate-800">Trainee:</span> {data.certificate.traineeName}
                  </p>
                )}
                {data.certificate.courseTitle && (
                  <p>
                    <span className="font-semibold text-slate-800">Course:</span> {data.certificate.courseTitle}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-600">{data?.message ?? "This certificate could not be verified."}</p>
            )}

            {qrDataUrl && (
              <div className="flex flex-col items-center gap-2 border-t border-slate-100 pt-6">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Verification QR</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrDataUrl} alt="QR code for certificate verification URL" className="rounded-lg border border-slate-200" />
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
