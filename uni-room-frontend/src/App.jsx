import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/Routes";
import { Toaster } from "@/components/ui/toaster";
import "./index.css";

/**
 * Main application component
 * @returns {React.ReactElement} The App component
 */
function App() {
  return (
    <Router>
      <AppRoutes />
      <Toaster />
    </Router>
  );
}

export default App;
