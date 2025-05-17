import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

/**
 * 404 Not Found page component
 * @returns {React.ReactElement} Not Found page
 */
function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <h1 className="text-9xl font-bold text-rose-500">404</h1>
      <h2 className="text-3xl font-semibold mt-4 mb-6 text-center">Page Not Found</h2>
      <p className="text-gray-600 text-center max-w-md mb-8">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild>
          <Link to="/">Go to Homepage</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/contact">Contact Support</Link>
        </Button>
      </div>
    </div>
  )
}

export default NotFound
