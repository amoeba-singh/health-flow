"use client"

import { type ReactNode, useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import {
  LayoutDashboard,
  Calendar,
  Users,
  Clock,
  Settings,
  LogOut,
  Menu,
  X,
  Database,
  BarChart,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout, loading, isAuthenticated } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth/login")
    }
  }, [loading, isAuthenticated, router])

  const navigation = [
    { name: "Dashboard", href: `/${user?.role}`, icon: LayoutDashboard },
    { name: "Appointments", href: `/${user?.role}/appointments`, icon: Calendar },
    { name: "Queue Management", href: `/${user?.role}/queue`, icon: Clock },
  ]

  // Add role-specific navigation items
  if (user?.role === "admin") {
    navigation.push(
      { name: "Users", href: "/admin/users", icon: Users },
      { name: "Resources", href: "/admin/resources", icon: Database },
      { name: "Analytics", href: "/admin/analytics", icon: BarChart },
    )
  } else if (user?.role === "doctor") {
    navigation.push({ name: "Patients", href: "/doctor/patients", icon: Users })
  }

  navigation.push({ name: "Settings", href: `/${user?.role}/settings`, icon: Settings })

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await logout()
    setIsLoggingOut(false)
  }

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render the dashboard if not authenticated
  
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div className="md:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 z-50"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 border-b">
            <h2 className="text-xl font-bold text-primary">HealthFlow</h2>
          </div>
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    pathname === item.href ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="p-4 border-t">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full flex items-center justify-center"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing out...
                </>
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:pl-64">
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}

