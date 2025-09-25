"use client"

import * as React from "react"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

export interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  /** Attribute to apply theme to (mimics next-themes). Defaults to class */
  attribute?: string
  /** If true, use system theme when no stored preference exists */
  enableSystem?: boolean
  /** If true, temporarily disable CSS transitions when switching */
  disableTransitionOnChange?: boolean
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  attribute = "class",
  enableSystem = false,
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<Theme>(defaultTheme)
  const [mounted, setMounted] = React.useState(false)

  // Read saved preference OR system preference (if enabled) on mount.
  React.useEffect(() => {
    const savedTheme = (typeof window !== "undefined" && localStorage.getItem("theme")) as Theme | null
    if (savedTheme) {
      setTheme(savedTheme)
      return
    }
    if (enableSystem && typeof window !== "undefined") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setTheme(prefersDark ? "dark" : "light")
    }
  }, [enableSystem])

  // Optional listener for system theme changes (only if no stored preference)
  React.useEffect(() => {
    if (!enableSystem) return
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = () => {
      const saved = localStorage.getItem("theme")
      if (!saved) {
        setTheme(media.matches ? "dark" : "light")
      }
    }
    media.addEventListener("change", handler)
    return () => media.removeEventListener("change", handler)
  }, [enableSystem])

  // Mark mounted to avoid hydration mismatch flashes
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Apply theme to root when mounted
  React.useEffect(() => {
    if (typeof document === "undefined" || !mounted) return
    const root = document.documentElement

    const apply = () => {
      if (attribute === "class") {
        root.classList.remove("light", "dark")
        root.classList.add(theme)
      } else {
        root.setAttribute(attribute, theme)
      }
    }

    if (disableTransitionOnChange) {
      const style = document.createElement("style")
      style.appendChild(document.createTextNode("*{transition: none !important;}"))
      document.head.appendChild(style)
      apply()
      // Force reflow then remove style
      window.getComputedStyle(style).opacity // eslint-disable-line @typescript-eslint/no-unused-expressions
      setTimeout(() => {
        document.head.removeChild(style)
      }, 0)
    } else {
      apply()
    }
    // Also reflect as data-theme for optional styling hooks
    root.setAttribute("data-theme", theme)
  }, [theme, attribute, disableTransitionOnChange, mounted])

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    try {
      localStorage.setItem("theme", newTheme)
    } catch {
      // ignore
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme }}>
      {mounted ? children : <span style={{ display: 'none' }}>{children}</span>}
    </ThemeContext.Provider>
  )
}
