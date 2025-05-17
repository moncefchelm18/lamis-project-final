import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthContext } from "@/App"; // Adjust path if needed
import { useToast } from "@/components/ui/toast"; // For showing messages

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    // --- Placeholder Login Logic ---
    // In a real app, you'd make an API call here
    console.log("Attempting login with:", email, password);

    // Simulate different roles based on email for demo purposes
    let role = null;
    let userData = null;
    if (email.startsWith("student")) {
      role = "student";
      userData = { name: "Demo Student", email: email, room: "A-101" };
    } else if (email.startsWith("admin")) {
      role = "admin";
      userData = { name: "Demo Admin", email: email };
    } else if (email.startsWith("manager")) {
      role = "manager";
      userData = { name: "Demo Manager", email: email };
    }

    if (role) {
      // Simulate successful login
      login(email, role, userData); // Update context
      toast({
        title: "Login Successful",
        description: `Welcome back! Redirecting to ${role} dashboard...`,
        variant: "success", // Custom variant if defined, otherwise default
      });

      // Redirect based on role
      if (role === "student") navigate("/dashboard");
      else if (role === "admin") navigate("/admin");
      else if (role === "manager") navigate("/manager");
    } else {
      setError(
        "Invalid email or password. Use student@..., admin@..., or manager@... for demo."
      );
      toast({
        title: "Login Failed",
        description: "Invalid email or password.",
        variant: "destructive",
      });
    }
    // --- End Placeholder Login Logic ---
  };

  return (
    <Card className="w-full max-w-md shadow-lg border-t-4 border-red-500">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-10 h-10 text-red-500"
          >
            <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
            <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
          </svg>
        </div>
        <CardTitle className="text-2xl font-bold">UniRooms Login</CardTitle>
        <CardDescription>
          Enter your credentials to access your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="e.g., student@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="focus:ring-red-500 focus:border-red-500"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button
            type="submit"
            className="w-full bg-red-500 hover:bg-red-600 text-white"
          >
            Login
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-center text-sm text-gray-500">
        Use student@..., admin@..., or manager@... email prefix for demo roles.
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
