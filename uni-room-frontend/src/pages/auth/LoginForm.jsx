"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
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
import { useToast } from "@/hooks/use-toast";
import { Building, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";
import { Tilt } from "react-tilt";
import { useSpring, animated } from "react-spring";
import logoSmall from "@/assets/logos/logo.png";

// --- Configuration ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("000000");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = { email, password };

    try {
      if (!API_BASE_URL) {
        throw new Error(
          "API base URL is not configured. Check your .env file."
        );
      }

      const response = await axios.post(`${API_BASE_URL}/auth/login`, payload);
      const data = response.data;

      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);

      setLoginSuccess(true);
      triggerConfetti();

      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.user?.name || "user"}!`,
      });

      const userRole = data.user?.role;

      // Add slight delay for animation before navigation
      setTimeout(() => {
        if (userRole === "student") {
          navigate("/dashboard/student");
        } else if (userRole === "admin") {
          navigate("/dashboard/admin");
        } else if (userRole === "service") {
          navigate("/dashboard/service");
        } else {
          navigate("/dashboard");
        }
      }, 1500); // Longer delay for animation
    } catch (error) {
      console.error("Login failed:", error);
      let errorMessage = "An unexpected error occurred. Please try again.";
      let errorTitle = "Login Failed";

      if (error.response) {
        const status = error.response.status;
        const responseData = error.response.data;
        errorMessage =
          responseData?.message || `Request failed with status code ${status}`;
        if (status === 400 || status === 401) {
          errorTitle = "Invalid Credentials";
          errorMessage =
            responseData?.message || "Incorrect email or password.";
        } else if (status === 404) {
          errorTitle = "User Not Found";
          errorMessage =
            responseData?.message ||
            "No account found with that email address.";
        }
      } else if (error.request) {
        errorTitle = "Network Error";
        errorMessage =
          "Could not connect to the server. Please check your network.";
      } else {
        errorTitle = "Request Error";
        errorMessage = error.message;
      }

      toast({
        title: errorTitle,
        description: errorMessage,
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
          radial -
          gradient(
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
        {!loginSuccess ? (
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
                    {/* <div className="rounded-full bg-gradient-to-br from-rose-400 to-rose-600 p-3 shadow-lg">
                      <Building className="h-8 w-8 text-white" />
                    </div> */}
                    <div className="p-3">
                      {/* <Building className="h-8 w-8 text-white" /> */}
                      <img src={logoSmall} alt="small-logo" className="h-8" />
                    </div>
                  </motion.div>
                  <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-rose-800">
                    Welcome back
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                  <CardContent className="space-y-5">
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
                          type="email"
                          placeholder="your.email@university.edu"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={isLoading}
                          className="border-gray-300 focus:border-rose-400 focus:ring focus:ring-rose-200 transition-all bg-white/70"
                        />
                      </div>
                    </motion.div>
                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="password"
                          className="text-gray-700 font-medium"
                        >
                          Password
                        </Label>
                        <Link
                          to="/forgot-password"
                          className="text-xs text-rose-500 hover:text-rose-700 hover:underline transition-colors"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={isLoading}
                          className="border-gray-300 focus:border-rose-400 focus:ring focus:ring-rose-200 transition-all pr-10 bg-white/70"
                        />
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
                  </CardContent>
                  <CardFooter>
                    <motion.div
                      className="w-full"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-medium py-2 shadow-md hover:shadow-lg transition-all duration-300"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Logging in...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            Log In
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        )}
                      </Button>
                    </motion.div>
                  </CardFooter>
                </form>
              </Card>
            </Tilt>

            {/* Signup Link */}
            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="text-sm bg-white/50 backdrop-blur-sm py-2 px-4 rounded-full shadow-sm inline-block">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="font-medium text-rose-500 hover:text-rose-700 transition-colors hover:underline"
                >
                  Sign up
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
              Login Successful!
            </h2>
            <p className="mt-2 text-gray-600">
              Redirecting you to your dashboard...
            </p>
            <div className="mt-6">
              <Loader2 className="h-6 w-6 animate-spin text-rose-500 mx-auto" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Privacy Policy & Terms */}
      <motion.div
        className="absolute bottom-4 text-xs text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
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
      </motion.div>
    </div>
  );
}
// "use client";

// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { useToast } from "@/hooks/use-toast";
// import { Building } from "lucide-react";

// // --- Configuration ---
// const API_BASE_URL = "http://localhost:5000/api";

// export default function LoginPage() {
//   const navigate = useNavigate();
//   const { toast } = useToast();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [isLoading, setIsLoading] = useState(false);

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);

//     const payload = { email, password };

//     try {
//       if (!API_BASE_URL) {
//         throw new Error(
//           "API base URL is not configured. Check your .env file."
//         );
//       }

//       const response = await axios.post(
//         `${API_BASE_URL}/auth/login`,
//         payload
//       );
//       const data = response.data;

//       localStorage.setItem("user", JSON.stringify(data.user));
//       localStorage.setItem("token", data.token);

//       toast({
//         title: "Login Successful",
//         description: `Welcome back, ${data.user?.name || "user"}!`,
//       });

//       const userRole = data.user?.role;
//       console.log("User roleXX:", userRole);
//       // Add slight delay for toast visibility before navigation
//       setTimeout(() => {
//         console.log("User roleYYy:", userRole);
//         if (userRole === "student") {
//           navigate("/dashboard/student");
//         } else if (userRole === "admin") {
//           navigate("/dashboard/admin");
//         } else if (userRole === "service") {
//           navigate("/dashboard/service");
//         } else {
//           navigate("/dashboard");
//         }
//       }, 300); // 300ms delay
//     } catch (error) {
//       console.error("Login failed:", error);
//       let errorMessage = "An unexpected error occurred. Please try again.";
//       let errorTitle = "Login Failed";

//       if (error.response) {
//         const status = error.response.status;
//         const responseData = error.response.data;
//         errorMessage =
//           responseData?.message || `Request failed with status code ${status}`;
//         if (status === 400 || status === 401) {
//           errorTitle = "Invalid Credentials";
//           errorMessage =
//             responseData?.message || "Incorrect email or password.";
//         } else if (status === 404) {
//           errorTitle = "User Not Found";
//           errorMessage =
//             responseData?.message ||
//             "No account found with that email address.";
//         }
//       } else if (error.request) {
//         errorTitle = "Network Error";
//         errorMessage =
//           "Could not connect to the server. Please check your network.";
//       } else {
//         errorTitle = "Request Error";
//         errorMessage = error.message;
//       }

//       toast({
//         title: errorTitle,
//         description: errorMessage,
//         variant: "destructive",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
//       {/* Top Left Logo Link */}
//       <Link
//         to="/"
//         className="absolute left-8 top-8 flex items-center gap-2 text-foreground"
//       >
//         <Building className="h-6 w-6 text-rose-500" />
//         <span className="text-xl font-bold">UniRoom</span>
//       </Link>

//       {/* Login Card */}
//       <Card className="w-full max-w-md">
//         <CardHeader className="space-y-1 text-center">
//           <div className="flex justify-center mb-4">
//             <div className="rounded-full bg-rose-100 p-3">
//               <Building className="h-8 w-8 text-rose-500" />
//             </div>
//           </div>
//           <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
//           <CardDescription>
//             Enter your credentials to access your account
//           </CardDescription>
//         </CardHeader>
//         <form onSubmit={handleLogin}>
//           <CardContent className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="email">Email</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 placeholder="your.email@university.edu"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//                 disabled={isLoading}
//               />
//             </div>
//             <div className="space-y-2">
//               <div className="flex items-center justify-between">
//                 <Label htmlFor="password">Password</Label>
//                 <Link
//                   to="/forgot-password"
//                   /* Update if you have this route */ className="text-xs text-rose-500 hover:underline"
//                 >
//                   Forgot password?
//                 </Link>
//               </div>
//               <Input
//                 id="password"
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//                 disabled={isLoading}
//               />
//             </div>
//           </CardContent>
//           <CardFooter>
//             <Button
//               type="submit"
//               className="w-full bg-rose-500 hover:bg-rose-600"
//               disabled={isLoading}
//             >
//               {isLoading ? "Logging in..." : "Log In"}
//             </Button>
//           </CardFooter>
//         </form>
//       </Card>

//       {/* Signup Link */}
//       <div className="mt-6 text-center text-sm">
//         {" "}
//         {/* Increased margin-top */}
//         Don't have an account?{" "}
//         <Link
//           to="/signup" // Make sure this matches your signup route
//           className="font-medium text-rose-500 hover:underline"
//         >
//           Sign up
//         </Link>
//       </div>
//     </div>
//   );
// }
