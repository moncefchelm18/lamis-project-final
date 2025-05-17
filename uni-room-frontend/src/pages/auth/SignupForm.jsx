"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  User,
  Mail,
  Key,
  IdCard,
} from "lucide-react";
import confetti from "canvas-confetti";
import { Tilt } from "react-tilt";
import { useSpring, animated } from "react-spring";
import logoSmall from "@/assets/logos/logo.png";

// --- Configuration ---
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function SignupForm() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    studentId: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [bgPosition, setBgPosition] = useState({ x: 0, y: 0 });

  // Animated background
  useEffect(() => {
    const handleMouseMove = (e) => {
      setBgPosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Logo animation
  const logoProps = useSpring({
    from: { transform: "scale(0.8)", opacity: 0 },
    to: { transform: "scale(1)", opacity: 1 },
    config: { tension: 200, friction: 20 },
    delay: 300,
  });

  // Success celebration effect
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#f43f5e", "#ffffff", "#f97316"],
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value) => {
    setFormData((prev) => ({ ...prev, role: value, studentId: "" })); // Reset studentId if role changes
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // --- Frontend Validation ---
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.password ||
      !formData.role
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (formData.role === "student" && !formData.studentId) {
      toast({
        title: "Error",
        description: "Student ID is required for student accounts",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // --- Prepare Data for Backend ---
    const payload = {
      name: formData.fullName,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      studentId: formData.role === "student" ? formData.studentId : undefined,
    };

    if (!payload.studentId) {
      delete payload.studentId;
    }

    // --- API Call ---
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! Status: ${response.status}`
        );
      }

      // --- Handle Success ---
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);

      setSignupSuccess(true);
      triggerConfetti();

      toast({
        title: "Success",
        description: "Account created successfully!",
      });

      // Redirect with delay for animation
      setTimeout(() => {
        const userRole = data.user?.role;
        if (userRole === "student") {
          navigate("/dashboard/student");
        } else if (userRole === "admin") {
          navigate("/dashboard/admin");
        } else if (userRole === "service") {
          navigate("/dashboard/service");
        } else {
          navigate("/dashboard");
        }
      }, 1500);
    } catch (error) {
      console.error("Signup failed:", error);
      toast({
        title: "Signup Failed",
        description:
          error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center p-4 overflow-hidden"
      style={{
        background: `
          radial-gradient(
            circle at ${bgPosition.x * 100}% ${
          bgPosition.y * 100
        }%, #fee2e2 0%, #fff1f2 30%, #fecdd3 100%
          )`,
        backgroundSize: "200% 200%",
        transition: "background-position 0.3s ease-out",
      }}
    >
      {/* Abstract shapes for visual interest */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-10 right-20 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* University campus illustration */}
      <div
        className="absolute bottom-0 left-0 w-full h-48 bg-contain bg-bottom bg-no-repeat pointer-events-none opacity-20"
        style={{ backgroundImage: "url('/images/campus-skyline.svg')" }}
      ></div>

      {/* Top Left Logo Link */}
      <animated.div style={logoProps}>
        <Link
          to="/"
          className="absolute left-8 top-8 flex items-center gap-2 text-foreground hover:scale-105 transition-transform"
        >
          <div className="p-2 bg-white bg-opacity-80 backdrop-blur-sm rounded-xl shadow-lg">
            <Building className="h-6 w-6 text-rose-500" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-rose-700">
            UniRoom
          </span>
        </Link>
      </animated.div>

      <AnimatePresence>
        {!signupSuccess ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md z-10"
          >
            <Tilt
              options={{
                max: 5,
                scale: 1.02,
                transition: true,
                perspective: 1000,
              }}
            >
              <Card className="w-full max-w-md border-none bg-white/80 backdrop-blur-md shadow-xl">
                <CardHeader className="space-y-1 text-center">
                  <motion.div
                    className="flex justify-center mb-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                      delay: 0.2,
                    }}
                  >
                    <div className="p-3">
                      <img src={logoSmall} alt="small-logo" className="h-8" />
                    </div>
                  </motion.div>
                  <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-rose-800">
                    Create an account
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Enter your information to join UniRoom
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-4">
                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Label
                        htmlFor="fullName"
                        className="text-gray-700 font-medium"
                      >
                        Full Name
                      </Label>
                      <div className="relative">
                        <Input
                          id="fullName"
                          name="fullName"
                          placeholder="John Doe"
                          value={formData.fullName}
                          onChange={handleChange}
                          required
                          disabled={isLoading}
                          className="border-gray-300 focus:border-rose-400 focus:ring focus:ring-rose-200 transition-all bg-white/70 pl-10"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Label
                        htmlFor="email"
                        className="text-gray-700 font-medium"
                      >
                        Email
                      </Label>
                      <div className="relative">
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="your.email@university.edu"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          disabled={isLoading}
                          className="border-gray-300 focus:border-rose-400 focus:ring focus:ring-rose-200 transition-all bg-white/70 pl-10"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Label
                        htmlFor="password"
                        className="text-gray-700 font-medium"
                      >
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={handleChange}
                          required
                          disabled={isLoading}
                          className="border-gray-300 focus:border-rose-400 focus:ring focus:ring-rose-200 transition-all pr-10 bg-white/70 pl-10"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Key className="h-4 w-4 text-gray-400" />
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                          tabIndex="-1"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </motion.div>

                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Label
                        htmlFor="confirmPassword"
                        className="text-gray-700 font-medium"
                      >
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                          disabled={isLoading}
                          className="border-gray-300 focus:border-rose-400 focus:ring focus:ring-rose-200 transition-all pr-10 bg-white/70 pl-10"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Key className="h-4 w-4 text-gray-400" />
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                          tabIndex="-1"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </motion.div>

                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <Label
                        htmlFor="role"
                        className="text-gray-700 font-medium"
                      >
                        Role
                      </Label>
                      <Select
                        onValueChange={handleRoleChange}
                        value={formData.role}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="border-gray-300 focus:border-rose-400 focus:ring focus:ring-rose-200 transition-all bg-white/70">
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="admin">Administrator</SelectItem>
                          <SelectItem value="service">
                            Housing Manager
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>

                    {formData.role === "student" && (
                      <motion.div
                        className="space-y-2"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Label
                          htmlFor="studentId"
                          className="text-gray-700 font-medium"
                        >
                          Student ID
                        </Label>
                        <div className="relative">
                          <Input
                            id="studentId"
                            name="studentId"
                            placeholder="e.g., S12345678"
                            value={formData.studentId}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                            className="border-gray-300 focus:border-rose-400 focus:ring focus:ring-rose-200 transition-all bg-white/70 pl-10"
                          />
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <IdCard className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <motion.div
                      className="w-full"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-medium py-2 shadow-md hover:shadow-lg transition-all duration-300"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Creating account...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            Sign Up
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        )}
                      </Button>
                    </motion.div>
                  </CardFooter>
                </form>
              </Card>
            </Tilt>

            {/* Login Link */}
            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <div className="text-sm bg-white/50 backdrop-blur-sm py-2 px-4 rounded-full shadow-sm inline-block">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-rose-500 hover:text-rose-700 transition-colors hover:underline"
                >
                  Log in
                </Link>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center p-10 bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0],
              }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </motion.div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Account Created!
            </h2>
            <p className="mt-2 text-gray-600">
              Welcome to UniRoom! Redirecting you to your dashboard...
            </p>
            <div className="mt-6">
              <Loader2 className="h-6 w-6 animate-spin text-rose-500 mx-auto" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Privacy Policy & Terms */}
      {/* <motion.div
        className="absolute bottom-4 text-xs text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <div className="flex gap-4">
          <Link to="/privacy" className="hover:text-gray-700 transition-colors">
            Privacy Policy
          </Link>
          <Link to="/terms" className="hover:text-gray-700 transition-colors">
            Terms of Service
          </Link>
          <Link to="/help" className="hover:text-gray-700 transition-colors">
            Help Center
          </Link>
        </div>
      </motion.div> */}

      {/* Add utility classes for animations */}
      {/* <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style> */}
    </div>
  );
}

export default SignupForm;
