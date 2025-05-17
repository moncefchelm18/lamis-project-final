"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import DashboardShell from "@/components/layout/DashboardShell";
import { toast } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "John Doe",
    email: "john.doe@university.edu",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would send the message to the server
    toast({
      title: "Message sent",
      description: "Your message has been sent to the housing department.",
    });
    setFormData((prev) => ({ ...prev, subject: "", message: "" }));
  };

  return (
    <DashboardShell role="student">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Contact Us</h1>
      </div>
      <div className="mt-2">
        <p className="text-muted-foreground">
          Have questions or concerns? Send us a message.
        </p>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Contact Housing Department</CardTitle>
            <CardDescription>
              Fill out the form below to get in touch with the housing
              department.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    readOnly
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What is your message about?"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Please provide details about your inquiry..."
                  rows={5}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="bg-rose-500 hover:bg-rose-600">
                Send Message
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>
              Alternative ways to reach the housing department.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium">Housing Office</h3>
                <p className="text-sm text-muted-foreground">
                  Student Center, Room 101
                  <br />
                  123 University Avenue
                  <br />
                  Campus, State 12345
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Contact Details</h3>
                <p className="text-sm text-muted-foreground">
                  Phone: (123) 456-7890
                  <br />
                  Email: service@university.edu
                  <br />
                  Hours: Monday-Friday, 9am-5pm
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </DashboardShell>
  );
}
