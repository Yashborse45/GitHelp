import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

// Always run on server per request; don't cache.
export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

// The actual dashboard UI is rendered by dashboard/layout.tsx (DashboardLayout).
// This page only enforces auth at the server boundary.
export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) {
    redirect("/login")
  }
  // Children are ignored by DashboardLayout (it renders its own content), so return null.
  return null
}
