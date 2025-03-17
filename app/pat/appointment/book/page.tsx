'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/compat/router';
import axios from 'axios';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DashboardLayout } from "@/components/ui/dashboard-layout";

// Define types for departments and doctors
interface Department {
    _id: string;
    name: string;
}

interface Doctor {
    _id: string;
    name: string;
}

const BookAppointment = () => {
    const router = typeof window !== 'undefined' ? useRouter() : null;
    const [departments, setDepartments] = useState<Department[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [formData, setFormData] = useState({
        department: '',
        doctor: '',
        date: '',
        description: '',
    });

    // useEffect(() => {
    //     const fetchDepartments = async () => {
    //         try {
    //             const { data } = await axios.get('/api/departments');
    //             setDepartments(data);
    //         } catch (error) {
    //             console.error('Error fetching departments:', error);
    //         }
    //     };
    //     fetchDepartments();
    // }, []);

    const handleDepartmentChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const department = e.target.value;
        console.log("handleDepartmentChange - department:", department); // Debug log at line 33
        setFormData((prev) => ({ ...prev, department, doctor: '' }));

        // try {
        //     const { data } = await axios.get(`/api/doctors?department=${department}`);
        //     setDoctors(data);
        // } catch (error) {
        //     console.error('Error fetching doctors:', error);
        // }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            await axios.post('/api/appointments', formData);
            alert('Appointment booked successfully!');
            router?.push('/pat');
        } catch (error) {
            console.error('Error booking appointment:', error);
            alert('Failed to book appointment. Please try again.');
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-xl mx-auto mt-10">
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <h2 className="text-2xl font-bold">Book an Appointment</h2>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="department">Department</Label>
                                <select
                                    id="department"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleDepartmentChange}
                                    className="w-full border p-2 rounded"
                                    required
                                >
                                    <option value="">Select Department</option>
                                    {/* {departments.map((dept) => (
                    <option key={dept._id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))} */}
                                    <option value="ortho">Orthopedic</option>
                                    <option value="cardio">Cardiology</option>
                                    <option value="gen">General</option>
                                    <option value="neuro">Neurology</option>
                                    <option value="ent">ENT</option>
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="doctor">Doctor</Label>
                                <select
                                    id="doctor"
                                    name="doctor"
                                    value={formData.doctor}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded"
                                    required
                                    disabled={!formData.department}
                                >
                                    <option value="">Select Doctor</option>
                                    {/* {doctors.map((doc) => (
                    <option key={doc._id} value={doc.name}>
                      {doc.name}
                    </option>
                  ))} */}
                                    if(formData.department === "ortho") {
                                        <option value="Dr. Priyanshu Patel">Dr. Priyanshu Patel</option>
                                    }
                                    else if(formData.department === "cardio") {
                                        <option value="Dr. Nitin Jha">Dr. Nitin Jha</option>
                                    }
                                    else if(formData.department === "gen") {
                                        <option value="Dr. Nishu Pandey">Dr. Nishu Pandey</option>
                                    }
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="date">Appointment Date</Label>
                                <Input
                                    id="date"
                                    name="date"
                                    type="date"
                                    value={formData.date}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Brief description of your issue"
                                    required
                                />
                            </div>
                        </CardContent>

                        <CardFooter className="flex justify-end">
                            <Button type="submit">Book Appointment</Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default BookAppointment;