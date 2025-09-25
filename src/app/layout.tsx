import { ThemeProvider } from "@/components/theme-provider"
import { env } from "@/env"
import { TRPCReactProvider } from "@/trpc/react"
import { ClerkProvider } from "@clerk/nextjs"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import type React from "react"
import { Suspense } from "react"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "GitHelp - Your Codebase Has Answers",
  description: "AI assistant that instantly understands your GitHub repositories. Onboard faster and debug smarter.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <Suspense fallback={null}>
          <ClerkProvider
            publishableKey={env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? undefined}
            afterSignInUrl="/dashboard"
            afterSignUpUrl="/dashboard"
            signInUrl="/login"
            signUpUrl="/register"
            appearance={{
              baseTheme: undefined,
              variables: {
                colorPrimary: "hsl(262.1 83.3% 57.8%)", // Deep violet primary
                colorBackground: "hsl(0 0% 100%)", // White background
                colorInputBackground: "hsl(0 0% 100%)", // White input background
                colorInputText: "hsl(222.2 84% 4.9%)", // Dark text
                colorText: "hsl(222.2 84% 4.9%)", // Dark text
                colorTextSecondary: "hsl(215.4 16.3% 46.9%)", // Muted text
                colorDanger: "hsl(0 84.2% 60.2%)", // Red for errors
                colorSuccess: "hsl(142.1 76.2% 36.3%)", // Green for success
                colorWarning: "hsl(47.9 95.8% 53.1%)", // Yellow for warnings
                borderRadius: "0.75rem", // Rounded-xl
                spacingUnit: "1rem",
                fontFamily: inter.style.fontFamily,
                fontSize: "0.875rem",
                fontWeight: {
                  normal: "400",
                  medium: "500",
                  semibold: "600",
                  bold: "700",
                }
              },
              elements: {
                card: "shadow-lg border border-border/50 bg-card",
                headerTitle: "text-foreground font-semibold",
                headerSubtitle: "text-muted-foreground",
                socialButtonsBlockButton: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                formButtonPrimary: "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200",
                footerActionLink: "text-primary hover:text-primary/80 font-medium",
                formFieldInput: "border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary",
                dividerLine: "bg-border",
                dividerText: "text-muted-foreground",
              },
              layout: {
                socialButtonsPlacement: "bottom",
                socialButtonsVariant: "blockButton",
                termsPageUrl: undefined,
                privacyPageUrl: undefined,
              }
            }}
          >
            <TRPCReactProvider>
              <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
                {children}
              </ThemeProvider>
            </TRPCReactProvider>
          </ClerkProvider>
        </Suspense>
      </body>
    </html>
  )
}
