import React, { useState, useContext } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Send } from "lucide-react";
import { AuthContext } from "@/App"; // Adjust path if needed

const ContactUsForm = () => {
  const { user } = useContext(AuthContext); // Get logged-in user data
  const [formData, setFormData] = useState({
    name: user?.name || "", // Pre-fill if user data available
    email: user?.email || "", // Pre-fill if user data available
    message: "",
  });
  const { toast } = useToast();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Placeholder: Sending contact message:", formData);
    toast({
      title: "Message Sent!",
      description: "Your message has been sent to support (Placeholder).",
      variant: "success",
    });
    // In a real app: Send data to backend API
    setFormData((prev) => ({ ...prev, message: "" })); // Clear message field
  };

  return (
    <Card className="shadow-md border-t-4 border-red-500">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Send className="w-6 h-6 text-red-500" /> Contact Us
        </CardTitle>
        <CardDescription>
          Send a message to the service administration.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Your Name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Your Email"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={handleChange}
              required
              placeholder="Type your message here..."
              rows={5}
            />
          </div>
          <Button
            type="submit"
            className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white"
          >
            Send Message
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ContactUsForm;
