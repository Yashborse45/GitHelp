import { GradientButton } from "@/components/gradient-button"
import Link from "next/link"
import { Code, Sparkles } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-royal opacity-60" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-primary opacity-10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-primary opacity-15 rounded-full blur-3xl" />

      <div className="container mx-auto max-w-screen-xl px-4 relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 flex justify-center">
            <div className="relative rounded-full px-4 py-2 text-sm leading-6 text-muted-foreground ring-1 ring-border bg-card/50 backdrop-blur-sm">
              <Sparkles className="inline h-4 w-4 mr-2 text-gradient-primary" />
              Powered by AI. Built for Developers.
            </div>
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            <span className="text-gradient-primary text-balance">Your Codebase Has Answers.</span>
            <br />
            <span className="text-foreground text-balance">Start Asking.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground text-pretty">
            GitHelp is the AI assistant that instantly understands your GitHub repositories. Onboard faster and debug
            smarter.
          </p>

          <div className="mt-10 flex items-center justify-center gap-x-6">
            <GradientButton size="lg" className="text-lg px-8 py-6 shadow-2xl" asChild>
              <Link href="/register">Get Started Free</Link>
            </GradientButton>
          </div>

          <div className="mt-16 flow-root sm:mt-24">
            <div className="relative -m-2 rounded-xl bg-card/80 backdrop-blur-sm p-2 ring-1 ring-border border-gradient lg:-m-4 lg:rounded-2xl lg:p-4">
              <div className="aspect-video rounded-md bg-gradient-royal shadow-2xl ring-1 ring-border/50">
                <div className="flex h-full items-center justify-center bg-card/90 rounded-md">
                  <div className="text-center">
                    <div className="relative">
                      <Code className="mx-auto h-12 w-12 text-gradient-primary mb-4" />
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-primary rounded-full animate-pulse" />
                    </div>
                    <p className="text-sm text-muted-foreground">Dashboard Preview Coming Soon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
