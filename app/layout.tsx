import type React from "react"
import type { Metadata } from "next"
import { DM_Sans } from "next/font/google"
import { Suspense } from "react"
import { SessionProvider } from "next-auth/react"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "SANGAM | Capacity Connect",
  description: "Capacity Connect portal for trainees, trainers, and administrators",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} font-sans antialiased`}>
        <Suspense fallback={<div className="p-8 text-slate-600">Loading...</div>}>
          <SessionProvider>{children}</SessionProvider>
          <Toaster />
        </Suspense>
      </body>
    </html>
  )
}
