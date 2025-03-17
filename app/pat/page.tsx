"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/ui/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";

export default function PatientDashboard() {
  const router = useRouter();
  const { user } = useAuth();

  const [queueStatus, setQueueStatus] = useState({
    inQueue: true,
    ticketNumber: "A45",
    estimatedWaitTime: 25,
    position: 3,
    department: "Cardiology",
  });

  const [appointments, setAppointments] = useState([
    {
      id: "1",
      doctorName: "Dr. Priyanshu Patel",
      department: "Cardiology",
      date: "2025-03-20",
      time: "10:00 AM",
      status: "scheduled",
    },
    {
      id: "2",
      doctorName: "Dr. Nitin Jha",
      department: "Neurology",
      date: "2025-03-22",
      time: "2:30 PM",
      status: "scheduled",
    },
    {
      id: "3",
      doctorName: "Dr. Nishu Pandey",
      department: "General",
      date: "2025-03-25",
      time: "11:30 AM",
      status: "scheduled",
    },
  ]);

  const handleCheckIn = () => {
    alert("Checked in successfully");
  };

  const handleCancelAppointment = (id: string) => {
    console.log("handleCancelAppointment called with id:", id);
    setAppointments((prev) =>
      prev.map((app) => {
        console.log("Processing appointment:", app);
        return app.id === id ? { ...app, status: "cancelled" } : app;
      })
    );
  };

  const openAppointment = () => {
    router.push('/pat/appointment/book');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-black">Patient Dashboard</h1>

        {queueStatus.inQueue && (
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center text-black">
                <Clock className="mr-2 h-5 w-5 text-black" />
                Currently in Queue - {queueStatus.department}
              </CardTitle>
              <CardDescription>
                Your ticket number: <span className="font-bold text-black">{queueStatus.ticketNumber}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Queue Position: {queueStatus.position}</span>
                  <span className="text-sm font-medium">Estimated Wait: {queueStatus.estimatedWaitTime} min</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              <p className="text-sm text-black">
                You can leave the waiting area and return when your number is close to being called. We'll notify you when you're next in line.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="mt-4 w-full" onClick={openAppointment}>Schedule an Appointment</Button>
                
            </CardFooter>
          </Card>
        )}

        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming Appointments</TabsTrigger>
            <TabsTrigger value="past">Past Appointments</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {appointments.filter((app) => app.status === "scheduled").map((appointment) => (
              <Card key={appointment.id}>
                <CardHeader>
                  <CardTitle>{appointment.doctorName}</CardTitle>
                  <CardDescription>{appointment.department}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>
                        {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>Estimated wait time: 15-20 minutes</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => handleCancelAppointment(appointment.id)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCheckIn}>Check In</Button>
                </CardFooter>
              </Card>
            ))}

            {appointments.filter((app) => app.status === "scheduled").length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <Calendar className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-center text-muted-foreground">You don't have any upcoming appointments.</p>
                  <Button className="mt-4" onClick={openAppointment}>Schedule an Appointment</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past">
            <Card>
              <CardHeader>
                <CardTitle>Past Appointments</CardTitle>
                <CardDescription>Your appointment history</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Past appointments will be listed here</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>Health Reminders</CardTitle>
            <CardDescription>Important health information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start">
              <CheckCircle className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h3 className="font-medium">Annual check-up completed</h3>
                <p className="text-sm text-muted-foreground">Your next check-up is due in 11 months</p>
              </div>
            </div>
            <div className="flex items-start">
              <AlertCircle className="mr-2 h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <h3 className="font-medium">Prescription refill needed</h3>
                <p className="text-sm text-muted-foreground">Your medication will run out in 5 days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}