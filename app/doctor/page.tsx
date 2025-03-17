"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/ui/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Clock, Calendar, CheckCircle } from "lucide-react"
import { useAuth } from "@/context/auth-context"

export default function DoctorDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    todayAppointments: 0,
    completedAppointments: 0,
    patientsInQueue: 0,
    averageWaitTime: 0,
  })

  const [upcomingAppointments, setUpcomingAppointments] = useState([
    {
      id: "1",
      patientName: "John Doe",
      time: "10:00 AM",
      reason: "Follow-up",
      status: "scheduled",
    },
    {
      id: "2",
      patientName: "Jane Smith",
      time: "11:30 AM",
      reason: "Consultation",
      status: "scheduled",
    },
    {
      id: "3",
      patientName: "Robert Johnson",
      time: "1:15 PM",
      reason: "Check-up",
      status: "scheduled",
    },
  ])

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, fetch this data from your API
    // For demo purposes, we'll use mock data
    setTimeout(() => {
      setStats({
        todayAppointments: 12,
        completedAppointments: 5,
        patientsInQueue: 3,
        averageWaitTime: 15,
      })
      setLoading(false)
    }, 1000)
  }, [])

  const handleNextPatient = () => {
    // In a real app, this would call your API to get the next patient
    alert("Called next patient")
  }

  const handleCompleteAppointment = (id: string) => {
    // In a real app, this would call your API to mark the appointment as completed
    setUpcomingAppointments((prev) => prev.map((app) => (app.id === id ? { ...app, status: "completed" } : app)))
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
          <Button onClick={handleNextPatient}>Call Next Patient</Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.todayAppointments}</div>
              <p className="text-xs text-muted-foreground">7 remaining</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.completedAppointments}</div>
              <p className="text-xs text-muted-foreground">Today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Patients in Queue</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.patientsInQueue}</div>
              <p className="text-xs text-muted-foreground">Next: Sarah Johnson</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg. Wait Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : `${stats.averageWaitTime} min`}</div>
              <p className="text-xs text-muted-foreground">-2 min from yesterday</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming Appointments</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Today's Schedule</CardTitle>
                <CardDescription>
                  {user?.name}'s appointments for {new Date().toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{appointment.patientName}</h3>
                        <div className="text-sm text-muted-foreground">
                          {appointment.time} - {appointment.reason}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {appointment.status === "scheduled" ? (
                          <Button size="sm" onClick={() => handleCompleteAppointment(appointment.id)}>
                            Complete
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" disabled>
                            Completed
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="completed">
            <Card>
              <CardHeader>
                <CardTitle>Completed Appointments</CardTitle>
                <CardDescription>Recently completed appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Completed appointments will be listed here</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

