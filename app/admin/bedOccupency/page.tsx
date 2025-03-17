"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Moon, Sun, Bed, Users, CalendarClock } from "lucide-react";
import { useTheme } from "next-themes";
import { useForm } from "react-hook-form";
import axios from "axios";
import { set } from "mongoose";

// Mock data - replace with actual API calls
const departments = [
  { id: 1, name: "ICU", total: 50, occupied: 35 },
  { id: 2, name: "General Ward", total: 200, occupied: 140 },
  { id: 3, name: "Emergency", total: 30, occupied: 25 },
  { id: 4, name: "Pediatrics", total: 40, occupied: 20 },
];

export default function Home() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(false);
  const { theme, setTheme } = useTheme();
  const [departmentPredictions, setDepartmentPredictions] = useState<Array<{ id: number; available: number }>>([]);
  const [mounted, setMounted] = useState(false);
  const { register, handleSubmit } = useForm();
  const [patientStay, setPatientStay] = useState(0);

  const totalBeds = departments.reduce((acc, dept) => acc + dept.total, 0);
  const occupiedBeds = departments.reduce((acc, dept) => acc + dept.occupied, 0);
  const availableBeds = totalBeds - occupiedBeds;

  useEffect(() => {
    setMounted(true);
    setDepartmentPredictions(
      departments.map(dept => ({
        id: dept.id,
        available: Math.floor(Math.random() * 20) + 5,
      }))
    );
  }, []);

  const handleDateChange = async (newDate: Date | undefined) => {
    if (!newDate || newDate.getTime() < Date.now()) {
      alert("Cant't select a previous date");
      return; // Prevent selecting past dates or undefined
    }
    setDate(newDate);
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setDepartmentPredictions(
      departments.map(dept => ({
        id: dept.id,
        available: Math.floor(Math.random() * 20) + 5,
      }))
    );
    setLoading(false);
  };

  const bedPredict = async (data: any) => {
    console.log("bed prediction in progress", data);
    try {
      const response = await axios.post("http://localhost:5000/predict-stay", data);
      console.log("Prediction response:", response.data);
      setPatientStay(response.data);
    } catch (error) {
      console.error("Error predicting bed occupancy:", error);
    }
  };

  // Prevent hydration issues by not rendering until mounted
  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Bed className="h-8 w-8 text-primary" />
              <h1 className="ml-2 text-xl font-semibold">Bed Occupency</h1>
            </div>
            {/* <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg hover:bg-accent"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button> */}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Total Beds</h2>
              <Bed className="h-5 w-5 text-primary" />
            </div>
            <p className="text-3xl font-bold mt-2">{totalBeds}</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Occupied Beds</h2>
              <Users className="h-5 w-5 text-destructive" />
            </div>
            <p className="text-3xl font-bold mt-2">{occupiedBeds}</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Available Beds</h2>
              <CalendarClock className="h-5 w-5 text-primary" />
            </div>
            <p className="text-3xl font-bold mt-2">{availableBeds}</p>
          </Card>
        </div>

        <div className="w-full">
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Department Status</h2>
            <div className="space-y-6">
              {departments.map((dept) => (
                <div key={dept.id}>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">{dept.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {dept.total - dept.occupied} available
                    </span>
                  </div>
                  <Progress
                    value={(dept.occupied / dept.total) * 100}
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Check Future Availability</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateChange}
                className="rounded-md border"
              />
              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  Predicted Availability for {date?.toLocaleDateString()}
                </h3>
                {loading ? (
                  <p>Loading predictions...</p>
                ) : (
                  <div className="space-y-2">
                    {departments.map((dept) => {
                      const prediction = departmentPredictions.find(p => p.id === dept.id);
                      return (
                        <div key={dept.id} className="flex justify-between">
                          <span>{dept.name}</span>
                          <span className="font-medium">
                            {prediction?.available || 0} beds available
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </Card>
          <Card className="p-6 lg:col-span-2 mt-8">
            <h2 className="text-xl font-semibold mb-4">Patient Stay Prediction Form</h2>
            <form onSubmit={handleSubmit(bedPredict)} className="space-y-4">
              <div>
                <label>Age</label>
                <input type="number" {...register("age")} className="input" />
              </div>
              <div>
                <label>Gender</label>
                <select {...register("gender")} className="input">
                  <option value="0">Male</option>
                  <option value="1">Female</option>
                </select>
              </div>
              <div>
                <label>Type of Admission</label>
                <select {...register("admissionType")} className="input">
                  <option value="0">OPD</option>
                  <option value="1">Emergency</option>
                </select>
              </div>
              <div>
                <label>Duration of Stay (days)</label>
                <input type="number" {...register("durationOfStay")} className="input" />
              </div>
              <div>
                <label>Outcome</label>
                <select {...register("outcome")} className="input">
                  <option value="0">Alive</option>
                  <option value="1">Deceased</option>
                </select>
              </div>
              <div>
                <label>DM (Diabetes Mellitus)</label>
                <input type="checkbox" {...register("dm")} />
              </div>
              <div>
                <label>HTN (Hypertension)</label>
                <input type="checkbox" {...register("htn")} />
              </div>
              <div>
                <label>CAD (Coronary Artery Disease)</label>
                <input type="checkbox" {...register("cad")} />
              </div>
              <div>
                <label>Prior CMP</label>
                <input type="checkbox" {...register("priorCmp")} />
              </div>
              <div>
                <label>CKD (Chronic Kidney Disease)</label>
                <input type="checkbox" {...register("ckd")} />
              </div>
              <div>
                <label>HB (Hemoglobin)</label>
                <input type="number" step="0.1" {...register("hb")} className="input" />
              </div>
              <div>
                <label>TLC (Total Leukocyte Count)</label>
                <input type="number" step="0.1" {...register("tlc")} className="input" />
              </div>
              <div>
                <label>Platelets</label>
                <input type="number" {...register("platelets")} className="input" />
              </div>
              <div>
                <label>Glucose</label>
                <input type="number" {...register("glucose")} className="input" />
              </div>
              <div>
                <label>Urea</label>
                <input type="number" {...register("urea")} className="input" />
              </div>
              <div>
                <label>Creatinine</label>
                <input type="number" step="0.1" {...register("creatinine")} className="input" />
              </div>
              <div>
                <label>Raised Cardiac Enzymes</label>
                <input type="checkbox" {...register("raisedCardiacEnzymes")} />
              </div>
              <div>
                <label>EF (Ejection Fraction %)</label>
                <input type="number" {...register("ef")} className="input" />
              </div>
              <div>
                <label>Severe Anaemia</label>
                <input type="checkbox" {...register("severeAnaemia")} />
              </div>
              <div>
                <label>Anaemia</label>
                <input type="checkbox" {...register("anaemia")} />
              </div>
              <div>
                <label>ACS (Acute Coronary Syndrome)</label>
                <input type="checkbox" {...register("acs")} />
              </div>
              <div>
                <label>STEMI (Heart Attack Type)</label>
                <input type="checkbox" {...register("stemi")} />
              </div>
              <div>
                <label>Heart Failure</label>
                <input type="checkbox" {...register("heartFailure")} />
              </div>
              <div>
                <label>AKI (Acute Kidney Injury)</label>
                <input type="checkbox" {...register("aki")} />
              </div>
              <div>
                <label>Day of Week</label>
                <select {...register("dayOfWeek")} className="input">
                  <option value="0">Sunday</option>
                  <option value="1">Monday</option>
                  <option value="2">Tuesday</option>
                  <option value="3">Wednesday</option>
                  <option value="4">Thursday</option>
                  <option value="5">Friday</option>
                  <option value="6">Saturday</option>
                </select>
              </div>
              <div>
                <label>Is Weekend</label>
                <input type="checkbox" {...register("isWeekend")} />
              </div>
              <div>
                <label>Month</label>
                <select {...register("month")} className="input">
                  <option value="1">January</option>
                  <option value="2">February</option>
                  <option value="3">March</option>
                  <option value="4">April</option>
                  <option value="5">May</option>
                  <option value="6">June</option>
                  <option value="7">July</option>
                  <option value="8">August</option>
                  <option value="9">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                </select>
              </div>
              <div>
                <label>Lab Risk Score</label>
                <input type="number" step="0.01" {...register("labRiskScore")} className="input" />
              </div>
              <div>
                <label>Season Spring</label>
                <input type="checkbox" {...register("seasonSpring")} />
              </div>
              <div>
                <label>Season Summer</label>
                <input type="checkbox" {...register("seasonSummer")} />
              </div>
              <div>
                <label>Season Winter</label>
                <input type="checkbox" {...register("seasonWinter")} />
              </div>
              <button type="submit" className="btn btn-primary">Submit</button>
            </form>

            <p>Predictive Stay: {patientStay}</p>

          </Card>
        </div>
      </main>
    </div>
  );
}