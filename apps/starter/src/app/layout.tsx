import type { Metadata, Viewport } from "next"
import { geistMono, geistSans } from "./fonts";

import "@repo/ui/globals.css"
import "@/styles/custom.css"

import { Header } from "@/components/header"
import type { ReactNode } from "react"
import { Providers } from "./providers"

export const metadata: Metadata = {
  title: "Better Auth Next.js Starter",
  description: "Better Auth Next.js Starter with Postgres, Drizzle, shadcn/ui and Tanstack Query"
}

export const viewport: Viewport = {
  initialScale: 1,
  viewportFit: "cover",
  width: "device-width",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "oklch(1 0 0)" },
    { media: "(prefers-color-scheme: dark)", color: "oklch(0.145 0 0)" }
  ]
}

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <div className="flex min-h-svh flex-col">
            <Header />

            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}
