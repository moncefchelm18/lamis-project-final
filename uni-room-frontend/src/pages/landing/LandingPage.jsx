"use client";

import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Building,
  CheckCircle,
  Clock,
  Home,
  Mail,
  Shield,
  User,
  Menu,
  X,
  ArrowRight,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";
import ReactPlayer from "react-player/youtube";
import axios from "axios"; // Import axios
import { useToast } from "@/hooks/use-toast"; // Import useToast
import { AuthContext } from "@/context/AuthContext";
import logo from "@/assets/logos/logo.png";
import imageHome from "@/assets/img3d.png";
import user1 from "@/assets/users/user1.png";
import user2 from "@/assets/users/user2.jpg";
import user3 from "@/assets/users/user3.jpg";
import user4 from "@/assets/users/user4.jpg";
import studentPortalImage from "@/assets/images/studentportal.avif";
import adminDashboardImage from "@/assets/images/admindash.avif";
import houseManagementImage from "@/assets/images/housemanage.jpg";

import univ2Logo from "@/assets/universities/univ2.png";
import univ3Logo from "@/assets/universities/univ3.png";
import univ5Logo from "@/assets/universities/univ5.png";

// Define your API base URL - adjust if necessary
const API_BASE_URL = "http://localhost:5000/api"; // Or your production URL

function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const { toast } = useToast(); // Initialize toast

  // State for the contact form
  const [contactFormData, setContactFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });
  const [isSendingContact, setIsSendingContact] = useState(false);
  // You can use toast for success/error, so dedicated state might not be needed
  // const [contactSendError, setContactSendError] = useState(null);
  // const [contactSendSuccess, setContactSendSuccess] = useState(false);
  const { isAuthenticated, user } = useContext(AuthContext);

  const userAvatars = [user1, user2, user3, user4];
  const universityLogos = [
    { src: univ3Logo, alt: "Logo of University 1" },
    { src: univ2Logo, alt: "Logo of University 2" },
    { src: univ5Logo, alt: "Logo of University 3" },
    { src: univ2Logo, alt: "Logo of University 4" },
    { src: univ3Logo, alt: "Logo of University 5" },
  ];
  const videoUrl = "https://www.youtube.com/watch?v=95utSBBwE24";
  const videoThumbnailUrl =
    "https://img.youtube.com/vi/95utSBBwE24/hqdefault.jpg";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []); // Added testimonials.length dependency if testimonials array can change

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const testimonials = [
    {
      quote:
        "UniRoom has completely transformed how we manage our dormitories. It's intuitive and powerful.",
      author: "Dr. Sarah Johnson",
      role: "Housing Director, Pacific University",
    },
    {
      quote:
        "As a student, I love how easy it is to manage my housing requests and communicate with staff.",
      author: "Michael Zhang",
      role: "Junior, Computer Science",
    },
    {
      quote:
        "The analytics dashboard helps us make data-driven decisions about our housing allocation.",
      author: "Priya Patel",
      role: "University Administrator",
    },
  ];

  // Handler for contact form input changes
  const handleContactFormChange = (e) => {
    const { id, value } = e.target;
    setContactFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  // Handler for contact form submission
  const handleContactFormSubmit = async (e) => {
    e.preventDefault();
    setIsSendingContact(true);

    if (
      !contactFormData.firstName ||
      !contactFormData.email ||
      !contactFormData.message
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in your first name, email, and message.",
        variant: "destructive",
      });
      setIsSendingContact(false);
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/messages/contact-admins`,
        {
          firstName: contactFormData.firstName,
          lastName: contactFormData.lastName,
          senderEmail: contactFormData.email, // Ensure this matches backend expectation
          content: contactFormData.message, // Ensure this matches backend expectation
        }
      );

      if (response.data && response.data.success) {
        toast({
          title: "Message Sent!",
          description:
            "Thank you for contacting us. We'll get back to you shortly.",
          variant: "success", // Or use a specific success style
        });
        setContactFormData({
          firstName: "",
          lastName: "",
          email: "",
          message: "",
        }); // Reset form
      } else {
        throw new Error(
          response.data.message || "Failed to send message. Please try again."
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred.";
      toast({
        title: "Error Sending Message",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSendingContact(false);
    }
  };
  const getDashboardPath = () => {
    if (!user) return "/login"; // Should not happen if isAuthenticated is true
    if (user.role === "student") return "/dashboard/student";
    if (user.role === "admin") return "/dashboard/admin";
    if (user.role === "service") return "/dashboard/service";
    return "/dashboard"; // Fallback
  };
  return (
    <div className="flex min-h-screen flex-col">
      <header
        className={`sticky top-0 z-50 w-full backdrop-blur transition-all duration-300 ${
          isScrolled ? "bg-white/90 shadow-md" : "bg-transparent"
        }`}
      >
        {/* ... Navbar remains the same ... */}
        <div className="container px-8 flex h-20 items-center justify-between">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <img src={logo} alt="UniRoom Logo" className="h-8" />
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {["Home", "Features", "Testimonials", "About", "Contact"].map(
              (item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                >
                  <Link
                    to={item === "Home" ? "/" : `#${item.toLowerCase()}`}
                    className="text-sm font-medium relative group text-slate-700 hover:text-rose-600"
                  >
                    {item}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-rose-500 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </motion.div>
              )
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>

          {/* Login Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="hidden md:block"
          >
            {isAuthenticated ? (
              <Button
                asChild
                className="bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-xl transition-all duration-300 px-6"
              >
                <Link to={getDashboardPath()}>Dashboard</Link>
              </Button>
            ) : (
              <Button
                asChild
                className="bg-rose-500 hover:bg-rose-600 shadow-lg hover:shadow-xl transition-all duration-300 px-6"
              >
                <Link to="/login">Log In</Link>
              </Button>
            )}
          </motion.div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t"
          >
            <div className="container py-4 flex flex-col space-y-4">
              {["Home", "Features", "Testimonials", "About", "Contact"].map(
                (item) => (
                  <Link
                    key={item}
                    to={item === "Home" ? "/" : `#${item.toLowerCase()}`}
                    className="text-base font-medium px-4 py-2 hover:bg-rose-50 rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item}
                  </Link>
                )
              )}
              {isAuthenticated ? (
                <Button
                  asChild
                  className="bg-green-500 hover:bg-green-600 w-full mt-2"
                >
                  <Link
                    to={getDashboardPath()}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                </Button>
              ) : (
                <Button
                  asChild
                  className="bg-rose-500 hover:bg-rose-600 w-full mt-2"
                >
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    Log In
                  </Link>
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </header>

      <main className="flex-1">
        {/* ... Hero, Clients, Features, Benefits, Video, Testimonials, Statistics, FAQ, CTA Sections remain the same ... */}
        {/* Hero Section */}
        <section
          id="home"
          className="relative w-full px-8 py-20 md:py-32 lg:py-40 overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-rose-50 to-white z-0 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-20">
              <div className="absolute top-10 left-10 w-72 h-72 bg-rose-300 rounded-full mix-blend-multiply filter blur-3xl"></div>
              <div className="absolute bottom-10 right-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl"></div>
              <div className="absolute top-1/2 left-1/2 w-96 h-96 -translate-x-1/2 -translate-y-1/2 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
            </div>
          </div>

          <div className="container px-4 md:px-6 relative z-10">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                className="space-y-6"
              >
                <div className="inline-block px-3 py-1 rounded-full bg-rose-100 text-rose-600 font-medium text-sm">
                  University Housing Management System
                </div>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Manage Your
                  <span className="bg-gradient-to-r from-rose-500 to-indigo-600 bg-clip-text text-transparent">
                    {" "}
                    University Housing{" "}
                  </span>
                  Experience
                </h1>
                <p className="max-w-[600px] text-slate-600 text-lg md:text-xl">
                  A comprehensive platform for students, administrators, and
                  housing managers to streamline the university room management
                  process.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                  <Button
                    asChild
                    size="lg"
                    className="bg-rose-500 hover:bg-rose-600 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Link to="/login" className="flex items-center gap-2">
                      Get Started <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="group transition-all duration-300 border-slate-300 hover:border-rose-500 hover:text-rose-600"
                    onClick={() =>
                      document
                        .getElementById("features")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    <span>Learn More</span>
                    <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <div className="flex flex-shrink-0 -space-x-2 overflow-hidden">
                    {userAvatars.map((avatarSrc, index) => (
                      <img
                        key={index}
                        src={avatarSrc}
                        alt={`User avatar ${index + 1}`}
                        className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                      />
                    ))}
                  </div>

                  <div className="flex items-center">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      Trusted by 2000+ students
                    </span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7 }}
                viewport={{ once: true }}
                className="relative mx-auto"
              >
                <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-rose-200 to-indigo-200 rounded-3xl blur-2xl"></div>
                <div className="relative overflow-hidden rounded-3xl shadow-2xl border border-slate-200">
                  <img
                    src={imageHome}
                    alt="UniRoom Dashboard Preview"
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
                    <div className="p-6 text-white">
                      <p className="text-lg font-medium">
                        Modern Dashboard Interface
                      </p>
                      <p className="text-sm opacity-80">
                        Manage everything from a single place
                      </p>
                    </div>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="absolute -left-8 top-1/4 bg-white p-3 rounded-xl shadow-lg"
                >
                  <div className="flex items-center gap-2">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Room Allocated</p>
                      <p className="text-xs text-slate-500">
                        East Hall, Room 304
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="absolute -right-8 bottom-1/4 bg-white p-3 rounded-xl shadow-lg"
                >
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">New Message</p>
                      <p className="text-xs text-slate-500">Housing Office</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Clients/Partners Section */}
        <section className="w-full px-8 py-12 bg-slate-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                Trusted by Universities Across The Country
              </p>
              <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-8 sm:gap-x-16 md:gap-x-20 mt-4">
                {universityLogos.map((logo, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    viewport={{ once: true, amount: 0.5 }}
                    className="flex items-center"
                  >
                    <img
                      src={logo.src}
                      alt={logo.alt}
                      className="h-16 sm:h-18 w-auto object-contain filter grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-300"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full px-8 py-20 md:py-32">
          {/* ... Features section content ... */}
          <div className="container px-4 md:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
            >
              <div className="inline-block px-3 py-1 rounded-full bg-rose-100 text-rose-600 font-medium text-sm">
                POWERFUL FEATURES
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Everything You Need In One Place
              </h2>
              <p className="max-w-[800px] text-slate-600 md:text-xl">
                Our platform offers a comprehensive set of tools to manage
                university housing efficiently for all stakeholders.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerChildren}
              className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
            >
              {[
                {
                  icon: <User className="h-8 w-8 text-rose-500" />,
                  title: "Student Portal",
                  description:
                    "Access your profile, view room details, submit maintenance requests, and print rent receipts with ease.",
                  image: studentPortalImage,
                },
                {
                  icon: <Shield className="h-8 w-8 text-rose-500" />,
                  title: "Admin Dashboard",
                  description:
                    "Manage student records, process applications, and oversee housing operations with powerful analytics.",
                  image: adminDashboardImage,
                },
                {
                  icon: <Home className="h-8 w-8 text-rose-500" />,
                  title: "Housing Management",
                  description:
                    "Review room requests, approve profile changes, and maintain housing inventory all from one interface.",
                  image: houseManagementImage,
                },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  variants={fadeIn}
                  className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <div className="overflow-hidden h-48">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-bold">{feature.title}</h3>
                    </div>
                    <p className="text-slate-600">{feature.description}</p>
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <Link
                        to="#" // Replace with actual link if available
                        className="inline-flex items-center text-rose-600 font-medium text-sm group"
                      >
                        Learn More
                        <ArrowRight className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-200" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="w-full px-8 py-20 md:py-32 bg-gradient-to-b from-slate-50 to-white">
          {/* ... Benefits section content ... */}
          <div className="container px-4 md:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
            >
              <div className="inline-block px-3 py-1 rounded-full bg-rose-100 text-rose-600 font-medium text-sm">
                WHY CHOOSE US
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Benefits of Using UniRoom
              </h2>
              <p className="max-w-[800px] text-slate-600 md:text-xl">
                Our platform delivers measurable advantages for students,
                administrators, and housing staff.
              </p>
            </motion.div>

            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 py-8">
              {[
                {
                  icon: <CheckCircle className="h-6 w-6 text-rose-500" />,
                  title: "Streamlined Process",
                  description:
                    "Simplified room allocation and management with automated workflows.",
                },
                {
                  icon: <Clock className="h-6 w-6 text-rose-500" />,
                  title: "Time Saving",
                  description:
                    "Quick access to important housing information, reducing administrative work.",
                },
                {
                  icon: <Mail className="h-6 w-6 text-rose-500" />,
                  title: "Easy Communication",
                  description:
                    "Direct contact with housing management through integrated messaging.",
                },
                {
                  icon: <Shield className="h-6 w-6 text-rose-500" />,
                  title: "Secure System",
                  description:
                    "Role-based access control for data security and compliance.",
                },
              ].map((benefit, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="flex flex-col items-center space-y-4 rounded-lg p-6 bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-100">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-bold">{benefit.title}</h3>
                  <p className="text-center text-slate-600">
                    {benefit.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Video Showcase Section */}
        <section className="w-full px-8 py-20 md:py-32 bg-slate-100">
          {/* ... Video Showcase section content ... */}
          <div className="container px-4 md:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
            >
              <div className="inline-block px-3 py-1 rounded-full bg-rose-100 text-rose-600 font-medium text-sm">
                SEE IT IN ACTION
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Watch How UniRoom Works
              </h2>
              <p className="max-w-[800px] text-slate-600 md:text-xl">
                Get a quick overview of how our platform streamlines the
                university housing process.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true, amount: 0.2 }}
              className="relative mx-auto max-w-4xl rounded-xl md:rounded-2xl overflow-hidden shadow-xl md:shadow-2xl border border-slate-200"
            >
              <div className="aspect-video bg-slate-900">
                <ReactPlayer
                  url={videoUrl}
                  light={videoThumbnailUrl}
                  playing={false} // Set to false initially
                  controls
                  width="100%"
                  height="100%"
                  className="absolute top-0 left-0"
                  config={{
                    youtube: {
                      playerVars: { showinfo: 0, modestbranding: 1, rel: 0 },
                    },
                  }}
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section
          id="testimonials"
          className="w-full px-8 py-20 md:py-32 bg-slate-900 text-white"
        >
          {/* ... Testimonials section content ... */}
          <div className="container px-4 md:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
            >
              <div className="inline-block px-3 py-1 rounded-full bg-rose-800 text-rose-100 font-medium text-sm">
                TESTIMONIALS
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                What Our Users Say
              </h2>
              <p className="max-w-[800px] text-slate-300 md:text-xl">
                Hear from students, administrators, and housing staff who use
                UniRoom every day.
              </p>
            </motion.div>

            <div className="hidden md:grid gap-8 md:grid-cols-3">
              {testimonials.map((testimonial, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.2, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="bg-slate-800 p-8 rounded-2xl relative"
                >
                  <div className="mb-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="inline-block h-5 w-5 fill-amber-400 text-amber-400 mr-1"
                      />
                    ))}
                  </div>
                  <p className="text-lg mb-6 italic text-slate-200">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-rose-400">
                        {testimonial.author.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{testimonial.author}</p>
                      <p className="text-sm text-slate-400">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="md:hidden relative">
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{
                    transform: `translateX(-${activeTestimonial * 100}%)`,
                  }}
                >
                  {testimonials.map((testimonial, i) => (
                    <div key={i} className="w-full flex-shrink-0 px-4">
                      <div className="bg-slate-800 p-6 rounded-2xl">
                        <div className="mb-4">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className="inline-block h-4 w-4 fill-amber-400 text-amber-400 mr-1"
                            />
                          ))}
                        </div>
                        <p className="text-base mb-6 italic text-slate-200">
                          "{testimonial.quote}"
                        </p>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                            <span className="text-lg font-bold text-rose-400">
                              {testimonial.author.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{testimonial.author}</p>
                            <p className="text-xs text-slate-400">
                              {testimonial.role}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center mt-6 gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTestimonial(i)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      i === activeTestimonial
                        ? "bg-rose-500 w-6"
                        : "bg-slate-600"
                    }`}
                    aria-label={`Go to testimonial ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="w-full px-8 py-20 md:py-32">
          {/* ... Statistics section content ... */}
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 md:grid-cols-4">
              {[
                { value: "50+", label: "Universities" },
                { value: "100,000+", label: "Students" },
                { value: "500,000+", label: "Room Allocations" },
                { value: "99.8%", label: "Satisfaction Rate" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <h3 className="text-4xl md:text-5xl font-bold text-rose-500 mb-2">
                    {stat.value}
                  </h3>
                  <p className="text-slate-600 font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="about" className="w-full px-8 py-20 md:py-32 bg-slate-50">
          {" "}
          {/* Changed ID for About link */}
          {/* ... FAQ section content ... */}
          <div className="container px-4 md:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
            >
              <div className="inline-block px-3 py-1 rounded-full bg-rose-100 text-rose-600 font-medium text-sm">
                FREQUENTLY ASKED QUESTIONS
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Common Questions About UniRoom
              </h2>
              <p className="max-w-[800px] text-slate-600 md:text-xl">
                Find answers to the most frequently asked questions about our
                platform.
              </p>
            </motion.div>

            <div className="mx-auto max-w-3xl space-y-4">
              {[
                {
                  question: "How do I apply for a room using UniRoom?",
                  answer:
                    "Simply log into your student portal, navigate to 'Housing Applications,' and follow the guided process to submit your preferences and requirements.",
                },
                {
                  question:
                    "Can administrators customize the allocation algorithm?",
                  answer:
                    "Yes, housing administrators can customize matching algorithms based on institution-specific requirements, preferences, and housing availability.",
                },
                {
                  question:
                    "Is UniRoom accessible for students with disabilities?",
                  answer:
                    "Absolutely. UniRoom is fully WCAG 2.1 compliant and includes features specifically designed to accommodate students with various accessibility needs.",
                },
                {
                  question: "How secure is student data on UniRoom?",
                  answer:
                    "We implement enterprise-grade security measures including end-to-end encryption, regular security audits, and strict access controls to protect all student data.",
                },
                {
                  question:
                    "Can UniRoom integrate with our existing student management system?",
                  answer:
                    "Yes, UniRoom offers robust API integration capabilities with most popular student information systems, making data synchronization seamless.",
                },
              ].map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="rounded-lg border border-slate-200 bg-white shadow-sm"
                >
                  <details className="group">
                    <summary className="flex cursor-pointer items-center justify-between p-6 text-lg font-medium">
                      {faq.question}
                      <div className="h-7 w-7 rounded-full border border-slate-300 flex items-center justify-center group-open:bg-rose-50 group-open:border-rose-200">
                        <span className="block h-0.5 w-3 bg-slate-500 group-open:bg-rose-500 group-open:rotate-45 transition-transform duration-300"></span>
                        <span className="block h-0.5 w-3 bg-slate-500 group-open:bg-rose-500 group-open:-rotate-45 -rotate-90 absolute transition-transform duration-300"></span>
                      </div>
                    </summary>
                    <div className="px-6 pb-6 pt-0">
                      <p className="text-slate-600">{faq.answer}</p>
                    </div>
                  </details>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full px-8 py-20 md:py-32 bg-rose-500">
          {/* ... CTA section content ... */}
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white">
                  Ready to Transform Your Housing Management?
                </h2>
                <p className="text-rose-100 md:text-xl">
                  Join the growing list of universities improving their housing
                  operations with UniRoom.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
                viewport={{ once: true }}
                className="flex flex-col sm:flex-row gap-4 sm:justify-center lg:justify-end"
              >
                <Button
                  size="lg"
                  className="bg-white text-rose-600 hover:bg-rose-50 transition-all duration-300 shadow-lg hover:shadow-xl"
                  onClick={() =>
                    document
                      .getElementById("contact")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Schedule a Demo
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white bg-transparent hover:bg-white/10 transition-all duration-300"
                  onClick={() =>
                    document
                      .getElementById("features")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Learn More
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="w-full px-8 py-20 md:py-32">
          <div className="container px-4 md:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
            >
              <div className="inline-block px-3 py-1 rounded-full bg-rose-100 text-rose-600 font-medium text-sm">
                GET IN TOUCH
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Contact Our Team
              </h2>
              <p className="max-w-[800px] text-slate-600 md:text-xl">
                Have questions or ready to get started? Reach out to our team
                for more information.
              </p>
            </motion.div>

            <div className="flex flex-col gap-10 items-center lg:flex-row lg:justify-around lg:items-start">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                viewport={{ once: true }}
                className="space-y-6 text-center lg:text-left lg:max-w-md"
              >
                <div className="flex flex-col sm:flex-row lg:flex-col gap-6 items-center sm:items-start">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
                      <Mail className="h-6 w-6 text-rose-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Email Us</h3>
                      <p className="text-slate-600">support@uniroom.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
                      <Building className="h-6 w-6 text-rose-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Visit Us</h3>
                      <p className="text-slate-600">
                        123 Campus Drive, University City
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
                      <Clock className="h-6 w-6 text-rose-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Business Hours</h3>
                      <p className="text-slate-600">
                        Monday - Friday: 9am - 5pm
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                viewport={{ once: true }}
                className="relative w-full max-w-lg"
              >
                <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-rose-100 to-indigo-100 rounded-3xl blur-xl opacity-70"></div>
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
                  <h3 className="text-2xl font-bold mb-6">Send Us a Message</h3>
                  {/* UPDATED FORM HERE */}
                  <form
                    className="space-y-4"
                    onSubmit={handleContactFormSubmit}
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label
                          htmlFor="firstName" // Changed from "first-name"
                          className="text-sm font-medium"
                        >
                          First name
                        </label>
                        <input
                          id="firstName" // Changed from "first-name"
                          className="w-full rounded-md border border-slate-300 p-3 text-sm placeholder:text-slate-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                          placeholder="Enter your first name"
                          value={contactFormData.firstName}
                          onChange={handleContactFormChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="lastName" // Changed from "last-name"
                          className="text-sm font-medium"
                        >
                          Last name
                        </label>
                        <input
                          id="lastName" // Changed from "last-name"
                          className="w-full rounded-md border border-slate-300 p-3 text-sm placeholder:text-slate-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                          placeholder="Enter your last name"
                          value={contactFormData.lastName}
                          onChange={handleContactFormChange}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        className="w-full rounded-md border border-slate-300 p-3 text-sm placeholder:text-slate-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                        placeholder="Enter your email"
                        value={contactFormData.email}
                        onChange={handleContactFormChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium">
                        Message
                      </label>
                      <textarea
                        id="message"
                        className="w-full rounded-md border border-slate-300 p-3 text-sm placeholder:text-slate-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                        placeholder="Enter your message"
                        rows={5}
                        value={contactFormData.message}
                        onChange={handleContactFormChange}
                        required
                      />
                    </div>
                    <Button
                      type="submit" // Ensure type is submit
                      className="w-full bg-rose-500 hover:bg-rose-600"
                      disabled={isSendingContact} // Disable button while sending
                    >
                      {isSendingContact ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full px-8 py-16 bg-slate-900 text-white">
        {/* ... Footer remains the same ... */}
        <div className="container px-4 md:px-6">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <img src={logo} alt="UniRoom Logo" className="h-8" />
              </div>
              <p className="text-slate-400">
                Transforming university housing management with innovative
                solutions.
              </p>
              <div className="flex gap-4">
                {["facebook", "twitter", "instagram", "linkedin"].map(
                  (social) => (
                    <a
                      key={social}
                      href="#"
                      className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-rose-500 transition-colors duration-300"
                      aria-label={social}
                    >
                      {/* Placeholder for actual icons */}
                      <div
                        className={`i-${social} h-5 w-5 text-slate-400 group-hover:text-white`}
                      ></div>
                    </a>
                  )
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold">Product</h3>
              <ul className="space-y-2">
                {["Features", "Security", "Testimonials", "Pricing", "FAQ"].map(
                  (item) => (
                    <li key={item}>
                      <Link
                        to={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                        className="text-slate-400 hover:text-white transition-colors duration-300"
                        onClick={(e) => {
                          e.preventDefault();
                          document
                            .getElementById(
                              item.toLowerCase().replace(/\s+/g, "-")
                            )
                            ?.scrollIntoView({ behavior: "smooth" });
                        }}
                      >
                        {item}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold">Company</h3>
              <ul className="space-y-2">
                {["About", "Team", "Careers", "Partners", "Legal"].map(
                  (item) => (
                    <li key={item}>
                      <Link
                        to={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                        className="text-slate-400 hover:text-white transition-colors duration-300"
                        onClick={(e) => {
                          e.preventDefault();
                          document
                            .getElementById(
                              item.toLowerCase().replace(/\s+/g, "-")
                            )
                            ?.scrollIntoView({ behavior: "smooth" });
                        }}
                      >
                        {item}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold">Subscribe</h3>
              <p className="text-slate-400">
                Stay updated with the latest features and releases.
              </p>
              <form className="flex max-w-md">
                <input
                  type="email"
                  className="w-full rounded-l-md border-0 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-rose-500"
                  placeholder="Enter your email"
                  aria-label="Email for newsletter"
                />
                <Button
                  type="submit"
                  className="rounded-l-none bg-rose-500 hover:bg-rose-600"
                >
                  Subscribe
                </Button>
              </form>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-400">
              © {new Date().getFullYear()} UniRoom. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link
                to="#"
                className="text-sm text-slate-400 hover:text-white transition-colors duration-300"
              >
                Privacy Policy
              </Link>
              <Link
                to="#"
                className="text-sm text-slate-400 hover:text-white transition-colors duration-300"
              >
                Terms of Service
              </Link>
              <Link
                to="#"
                className="text-sm text-slate-400 hover:text-white transition-colors duration-300"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
export default LandingPage;
