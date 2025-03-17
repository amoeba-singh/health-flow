"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/ui/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export default function QueueManagement() {
  const [department, setDepartment] = useState("cardiology")
  const [loading, setLoading] = useState(true)

  // Mock data for departments
  const departments = [
    { id: "cardiology", name: "Cardiology" },
    { id: "neurology", name: "Neurology" },
    { id: "orthopedics", name: "Orthopedics" },
    { id: "pediatrics", name: "Pediatrics" },
    { id: "emergency", name: "Emergency" },
  ]

  // Mock data for queue
  const [queueData, setQueueData] = useState({
    currentNumber: "A45",
    patientsInQueue: 12,
    averageWaitTime: 18,
    longestWaitTime: 35,
    patients: [
      {
        id: "1",
        name: "John Doe",
        ticketNumber: "A43",
        waitTime: 28,
        priority: "medium",
        status: "waiting",
        checkInTime: "10:15 AM",
      },
      {
        id: "2",
        name: "Sarah Johnson",
        ticketNumber: "A44",
        waitTime: 22,
        priority: "high",
        status: "waiting",
        checkInTime: "10:22 AM",
      },
      {
        id: "3",
        name: "Michael Chen",
        ticketNumber: "A45",
        waitTime: 15,
        priority: "medium",
        status: "in-progress",
        checkInTime: "10:35 AM",
      },
      {
        id: "4",
        name: "Emily Rodriguez",
        ticketNumber: "A46",
        waitTime: 10,
        priority: "low",
        status: "waiting",
        checkInTime: "10:45 AM",
      },
      {
        id: "5",
        name: "Robert Kim",
        ticketNumber: "A47",
        waitTime: 5,
        priority: "emergency",
        status: "waiting",
        checkInTime: "10:55 AM",
      },
    ],
  })

  // Mock data for wait time trends
  const waitTimeTrends = [
    { time: "8 AM", waitTime: 12 },
    { time: "9 AM", waitTime: 15 },
    { time: "10 AM", waitTime: 22 },
    { time: "11 AM", waitTime: 18 },
    { time: "12 PM", waitTime: 25 },
    { time: "1 PM", waitTime: 20 },
    { time: "2 PM", waitTime: 15 },
    { time: "3 PM", waitTime: 10 },
    { time: "4 PM", waitTime: 8 },
  ]

  useEffect(() => {
    // In a real app, fetch queue data from API based on department
    // For demo, we'll use mock data
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [department])

  const handleCallNext = () => {
    // In a real app, this would call your API to get the next patient
    alert("Called next patient")
  }

  const handleCompleteService = (id: string) => {
    // In a real app, this would call your API to mark the patient as completed
    setQueueData((prev) => ({
      ...prev,
      patients: prev.patients.map((patient) => (patient.id === id ? { ...patient, status: "completed" } : patient)),
    }))
  }

  const handleNoShow = (id: string) => {
    // In a real app, this would call your API to mark the patient as no-show
    setQueueData((prev) => ({
      ...prev,
      patients: prev.patients.map((patient) => (patient.id === id ? { ...patient, status: "no-show" } : patient)),
    }))
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "emergency":
        return <Badge className="bg-red-500">Emergency</Badge>
      case "high":
        return <Badge className="bg-orange-500">High</Badge>
      case "medium":
        return <Badge className="bg-blue-500">Medium</Badge>
      case "low":
        return <Badge className="bg-green-500">Low</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "waiting":
        return (
          <Badge variant="outline" className="text-amber-500 border-amber-500">
            Waiting
          </Badge>
        )
      case "in-progress":
        return (
          <Badge variant="outline" className="text-blue-500 border-blue-500">
            In Progress
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="text-green-500 border-green-500">
            Completed
          </Badge>
        )
      case "no-show":
        return (
          <Badge variant="outline" className="text-red-500 border-red-500">
            No Show
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Queue Management</h1>
          <Button onClick={handleCallNext}>Call Next Patient</Button>
        </div>

        <div className="flex items-center space-x-4">
          <Label htmlFor="department">Department:</Label>
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger id="department" className="w-[200px]">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Current Number</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : queueData.currentNumber}</div>
              <p className="text-xs text-muted-foreground">Now serving</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Patients in Queue</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : queueData.patientsInQueue}</div>
              <p className="text-xs text-muted-foreground">+3 in the last hour</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg. Wait Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : `${queueData.averageWaitTime} min`}</div>
              <p className="text-xs text-muted-foreground">-2 min from yesterday</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Longest Wait</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : `${queueData.longestWaitTime} min`}</div>
              <p className="text-xs text-muted-foreground">Patient: John Doe</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="queue">
          <TabsList>
            <TabsTrigger value="queue">Current Queue</TabsTrigger>
            <TabsTrigger value="analytics">Queue Analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="queue">
            <Card>
              <CardHeader>
                <CardTitle>Patient Queue</CardTitle>
                <CardDescription>
                  Manage patients currently in the {departments.find((d) => d.id === department)?.name} queue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket #</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Wait Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {queueData.patients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell className="font-medium">{patient.ticketNumber}</TableCell>
                        <TableCell>
                          <div>
                            <div>{patient.name}</div>
                            <div className="text-xs text-muted-foreground">Check-in: {patient.checkInTime}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getPriorityBadge(patient.priority)}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{patient.waitTime} min</span>
                            <Progress
                              value={Math.min(100, (patient.waitTime / 30) * 100)}
                              className="h-1 mt-1"
                              color={patient.waitTime > 25 ? "bg-red-500" : undefined}
                            />
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(patient.status)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {patient.status === "waiting" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 px-2"
                                  onClick={() => handleCompleteService(patient.id)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Complete
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 px-2"
                                  onClick={() => handleNoShow(patient.id)}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  No Show
                                </Button>
                              </>
                            )}
                            {patient.status === "in-progress" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-2"
                                onClick={() => handleCompleteService(patient.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Complete
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Wait Time Trends</CardTitle>
                <CardDescription>
                  Average wait time throughout the day for {departments.find((d) => d.id === department)?.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    waitTime: {
                      label: "Wait Time (min)",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={waitTimeTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="waitTime" stroke="var(--color-waitTime)" />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

