"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/ui/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Clock, Calendar } from "lucide-react"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, BarChart, Bar } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    averageWaitTime: 0,
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, fetch this data from your API
    // For demo purposes, we'll use mock data
    setTimeout(() => {
      setStats({
        totalPatients: 1250,
        totalDoctors: 45,
        totalAppointments: 320,
        averageWaitTime: 18,
      })
      setLoading(false)
    }, 1000)
  }, [])

  // Mock data for charts
  const appointmentData = [
    { name: "Mon", appointments: 45 },
    { name: "Tue", appointments: 52 },
    { name: "Wed", appointments: 49 },
    { name: "Thu", appointments: 63 },
    { name: "Fri", appointments: 58 },
    { name: "Sat", appointments: 48 },
    { name: "Sun", appointments: 38 },
  ]

  const waitTimeData = [
    { name: "Cardiology", waitTime: 22 },
    { name: "Neurology", waitTime: 18 },
    { name: "Orthopedics", waitTime: 15 },
    { name: "Pediatrics", waitTime: 12 },
    { name: "Emergency", waitTime: 8 },
  ]

  const resourceUtilizationData = [
    { name: "8 AM", rooms: 65, staff: 75, equipment: 62 },
    { name: "10 AM", rooms: 78, staff: 85, equipment: 71 },
    { name: "12 PM", rooms: 92, staff: 88, equipment: 80 },
    { name: "2 PM", rooms: 85, staff: 90, equipment: 75 },
    { name: "4 PM", rooms: 72, staff: 82, equipment: 68 },
    { name: "6 PM", rooms: 58, staff: 65, equipment: 55 },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.totalPatients}</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.totalDoctors}</div>
              <p className="text-xs text-muted-foreground">+2 new this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Appointments Today</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.totalAppointments}</div>
              <p className="text-xs text-muted-foreground">+8% from yesterday</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg. Wait Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : `${stats.averageWaitTime} min`}</div>
              <p className="text-xs text-muted-foreground">-2 min from last week</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Appointments</CardTitle>
                <CardDescription>Number of appointments per day this week</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    appointments: {
                      label: "Appointments",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={appointmentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="appointments" fill="var(--color-appointments)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Average Wait Time by Department</CardTitle>
                  <CardDescription>In minutes</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      waitTime: {
                        label: "Wait Time (min)",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={waitTimeData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="waitTime" fill="var(--color-waitTime)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resource Utilization</CardTitle>
                  <CardDescription>Percentage by time of day</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      rooms: {
                        label: "Rooms",
                        color: "hsl(var(--chart-1))",
                      },
                      staff: {
                        label: "Staff",
                        color: "hsl(var(--chart-2))",
                      },
                      equipment: {
                        label: "Equipment",
                        color: "hsl(var(--chart-3))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={resourceUtilizationData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Line type="monotone" dataKey="rooms" stroke="var(--color-rooms)" />
                        <Line type="monotone" dataKey="staff" stroke="var(--color-staff)" />
                        <Line type="monotone" dataKey="equipment" stroke="var(--color-equipment)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle>Appointment Analytics</CardTitle>
                <CardDescription>Detailed appointment statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Appointment analytics content will go here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources">
            <Card>
              <CardHeader>
                <CardTitle>Resource Management</CardTitle>
                <CardDescription>Optimize resource allocation</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Resource management content will go here</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

