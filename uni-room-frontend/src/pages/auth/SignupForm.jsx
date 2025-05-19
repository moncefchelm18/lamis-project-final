// SignupForm.jsx
"use client"; // Keep if needed

import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Building,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  User as UserIcon, // Aliased
  Mail as MailIcon, // Aliased
  Key as KeyIcon, // Aliased
  IdCard as IdCardIcon, // Aliased
  Clock as ClockIcon, // Aliased
  CheckCircle as CheckCircleIcon, // Aliased
} from "lucide-react";
import confetti from "canvas-confetti";
import { Tilt } from "react-tilt";
import { useSpring, animated } from "react-spring";
import logoSmall from "@/assets/logos/logo.png"; // Ensure path is correct
import { AuthContext } from "@/context/AuthContext"; // Adjust path if necessary

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function SignupForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const authContext = useContext(AuthContext);

  if (!authContext) {
    console.error(
      "AuthContext is not available. Make sure SignupForm is wrapped in AuthProvider."
    );
    return (
      <div className="flex items-center justify-center h-screen">
        Critical Error: Auth Provider Missing.
      </div>
    );
  }
  const { login, isAuthenticated, isLoadingAuth, user } = authContext;

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    studentId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupSuccessDisplay, setSignupSuccessDisplay] = useState(false); // For UI transition
  const [signupMessage, setSignupMessage] = useState(""); // For pending/success message
  const [bgPosition, setBgPosition] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    if (!isLoadingAuth && isAuthenticated) {
      const from =
        location.state?.from?.pathname ||
        (user?.role ? `/dashboard/${user.role}` : "/dashboard");
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoadingAuth, navigate, user, location.state]);

  useEffect(() => {
    const handleMouseMove = (e) =>
      setBgPosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const logoProps = useSpring({
    from: { transform: "scale(0.8)", opacity: 0 },
    to: { transform: "scale(1)", opacity: 1 },
    config: { tension: 200, friction: 20 },
    delay: 300,
  });

  const triggerConfetti = () =>
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#f43f5e", "#ffffff", "#f97316"],
    });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value) => {
    setFormData((prev) => ({ ...prev, role: value, studentId: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSignupMessage("");
    setSignupSuccessDisplay(false);

    if (
      !formData.fullName ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.role
    ) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    if (formData.password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    if (formData.role === "student" && !formData.studentId) {
      toast({
        title: "Student ID Required",
        description: "Student ID is required for student accounts.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    const payload = {
      name: formData.fullName,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      ...(formData.role === "student" && { studentId: formData.studentId }),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        let errorMessage =
          data.message || `Registration failed with status: ${response.status}`;
        if (data.errors && Array.isArray(data.errors))
          errorMessage = data.errors.map((err) => err.msg).join(", ");
        throw new Error(errorMessage);
      }

      if (data.success && data.user) {
        setSignupSuccessDisplay(true);
        triggerConfetti();

        if (data.user.status === "pending") {
          setSignupMessage(
            "Registration submitted! Your account is pending approval by an administrator. You will be notified via email once approved."
          );
          toast({
            title: "Registration Submitted",
            description: "Your account is pending approval.",
            duration: 7000,
          });
        } else if (data.user.status === "approved") {
          setSignupMessage(
            "Account created and approved! Redirecting to your dashboard..."
          );
          if (data.token && data.user) {
            login(data.user, data.token); // This will handle navigation
          } else {
            console.error(
              "Approved user data or token missing from registration response."
            );
            toast({
              title: "Registration Error",
              description: "Could not finalize your approved account.",
              variant: "destructive",
            });
          }
          toast({
            title: "Account Created!",
            description: "Welcome to UniRoom!",
          });
        }
      } else {
        throw new Error(
          data.message || "Registration failed. Please try again."
        );
      }
    } catch (error) {
      console.error("Signup failed:", error);
      setSignupSuccessDisplay(false);
      setSignupMessage("");
      toast({
        title: "Signup Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center h-screen bg-rose-50 text-rose-700">
        <Loader2 className="h-10 w-10 animate-spin" />
        <p className="ml-3 text-lg">Loading...</p>
      </div>
    );
  }
  if (isAuthenticated && !isLoadingAuth) {
    return null; // Redirect handled by useEffect
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center p-4 overflow-hidden"
      style={{
        background: `radial-gradient(circle at ${bgPosition.x * 100}% ${
          bgPosition.y * 100
        }%, #fee2e2 0%, #fff1f2 30%, #fecdd3 100%)`,
        backgroundSize: "200% 200%",
        transition: "background-position 0.3s ease-out",
      }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-10 right-20 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      <div
        className="absolute bottom-0 left-0 w-full h-48 bg-contain bg-bottom bg-no-repeat pointer-events-none opacity-20"
        style={{ backgroundImage: "url('/images/campus-skyline.svg')" }}
      ></div>

      <animated.div style={logoProps}>
        <Link
          to="/"
          className="absolute left-8 top-8 flex items-center gap-2 text-foreground hover:scale-105 transition-transform z-20"
        >
          <div className="p-2 bg-white bg-opacity-80 backdrop-blur-sm rounded-xl shadow-lg">
            <Building className="h-6 w-6 text-rose-500" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-rose-700">
            UniRoom
          </span>
        </Link>
      </animated.div>

      <AnimatePresence mode="wait">
        {!signupSuccessDisplay ? (
          <motion.div
            key="signup-form"
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
                      <img src={logoSmall} alt="UniRoom Logo" className="h-8" />
                    </div>
                  </motion.div>
                  <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-rose-800">
                    Create Your UniRoom Account
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Join our community. It's quick and easy!
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-4">
                    <motion.div
                      className="space-y-1.5"
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
                          disabled={isSubmitting}
                          className="pl-10"
                        />
                        <div className="input-icon">
                          <UserIcon />
                        </div>
                      </div>
                    </motion.div>
                    <motion.div
                      className="space-y-1.5"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Label
                        htmlFor="email"
                        className="text-gray-700 font-medium"
                      >
                        Email Address
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
                          disabled={isSubmitting}
                          className="pl-10"
                        />
                        <div className="input-icon">
                          <MailIcon />
                        </div>
                      </div>
                    </motion.div>
                    <motion.div
                      className="space-y-1.5"
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
                          disabled={isSubmitting}
                          className="pl-10 pr-10"
                        />
                        <div className="input-icon">
                          <KeyIcon />
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="password-toggle-icon"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff /> : <Eye />}
                        </button>
                      </div>
                    </motion.div>
                    <motion.div
                      className="space-y-1.5"
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
                          disabled={isSubmitting}
                          className="pl-10 pr-10"
                        />
                        <div className="input-icon">
                          <KeyIcon />
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="password-toggle-icon"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? <EyeOff /> : <Eye />}
                        </button>
                      </div>
                    </motion.div>
                    <motion.div
                      className="space-y-1.5"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <Label
                        htmlFor="role"
                        className="text-gray-700 font-medium"
                      >
                        I am a...
                      </Label>
                      <Select
                        onValueChange={handleRoleChange}
                        value={formData.role}
                        disabled={isSubmitting}
                        required
                      >
                        <SelectTrigger>
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
                        className="space-y-1.5"
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
                            required={formData.role === "student"}
                            disabled={isSubmitting}
                            className="pl-10"
                          />
                          <div className="input-icon">
                            <IdCardIcon />
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
                        className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-semibold py-3 text-base tracking-wide"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        ) : (
                          <ArrowRight className="h-5 w-5 mr-2" />
                        )}{" "}
                        {isSubmitting ? "Creating Account..." : "Sign Up"}
                      </Button>
                    </motion.div>
                  </CardFooter>
                </form>
              </Card>
            </Tilt>
            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <div className="text-sm bg-white/60 backdrop-blur-sm py-2.5 px-5 rounded-full shadow-sm inline-block text-gray-700">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-rose-600 hover:text-rose-700 hover:underline"
                >
                  Log in
                </Link>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="signup-success"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center p-10 bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl text-center max-w-md"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center shadow-inner ${
                  signupMessage.includes("pending")
                    ? "bg-blue-100"
                    : "bg-green-100"
                }`}
              >
                {signupMessage.includes("pending") ? (
                  <ClockIcon className="h-12 w-12 text-blue-500" />
                ) : (
                  <CheckCircleIcon className="h-12 w-12 text-green-500" />
                )}
              </div>
            </motion.div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              {signupMessage.includes("pending")
                ? "Registration Submitted!"
                : "Account Created & Approved!"}
            </h2>
            <p className="mt-3 text-gray-600 leading-relaxed">
              {signupMessage}
            </p>
            {signupMessage.includes("pending approval") && (
              <Button
                asChild
                className="mt-8 bg-rose-500 hover:bg-rose-600 text-base py-3 px-6"
              >
                <Link to="/">Go to Homepage</Link>
              </Button>
            )}
            {signupMessage.includes("Redirecting") && ( // Show loader if approved and redirecting
              <div className="mt-8">
                <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Simplified CSS for icons (could also use Tailwind directly if configured) */}
      <style jsx global>{`
        .input-icon {
          position: absolute;
          inset-block: 0;
          left: 0;
          display: flex;
          align-items: center;
          padding-left: 0.75rem;
          pointer-events: none;
          color: #9ca3af; /* gray-400 */
        }
        .input-icon svg {
          height: 1rem;
          width: 1rem;
        }
        .password-toggle-icon {
          position: absolute;
          inset-block: 0;
          right: 0;
          display: flex;
          align-items: center;
          padding-right: 0.75rem;
          color: #9ca3af; /* gray-400 */
        }
        .password-toggle-icon:hover {
          color: #4b5563; /* gray-600 */
        }
        .password-toggle-icon svg {
          height: 1.25rem;
          width: 1.25rem;
        }
        .Input {
          border-color: #d1d5db; /* gray-300 */
        }
        .Input:focus {
          border-color: #fb7185; /* rose-400 */
          box-shadow: 0 0 0 2px rgba(244, 63, 94, 0.2); /* ring-rose-200 */
        }
        .SelectTrigger {
          border-color: #d1d5db;
        }
        .SelectTrigger[data-state="open"],
        .SelectTrigger:focus {
          border-color: #fb7185;
          box-shadow: 0 0 0 2px rgba(244, 63, 94, 0.2);
        }
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
          animation: blob 10s infinite ease-in-out;
        }
        .animation-delay-2000 {
          animation-delay: -3s;
        }
        .animation-delay-4000 {
          animation-delay: -6s;
        }
      `}</style>
    </div>
  );
}

export default SignupForm;
