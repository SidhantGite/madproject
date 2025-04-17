
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Search, MessageSquare, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface LayoutProps {
  children: React.ReactNode;
  showNavBar?: boolean;
}

const Layout = ({ children, showNavBar = true }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 safe-area-inset-bottom">
      {/* Status Bar spacer for mobile */}
      <div className="h-safe-area-top bg-white" />
      
      {/* Main content */}
      <div className="flex-1">
        {children}
      </div>

      {/* Bottom Navigation Bar */}
      {showNavBar && user && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t z-10">
          <div className="flex justify-around items-center h-16 safe-area-inset-bottom">
            <button
              onClick={() => navigate("/home")}
              className={`flex flex-col items-center justify-center w-full py-2 ${
                isActive("/home") ? "text-primary" : "text-gray-500"
              }`}
            >
              <Home size={24} />
              <span className="text-xs mt-1">Home</span>
            </button>

            <button
              onClick={() => navigate("/search")}
              className={`flex flex-col items-center justify-center w-full py-2 ${
                isActive("/search") ? "text-primary" : "text-gray-500"
              }`}
            >
              <Search size={24} />
              <span className="text-xs mt-1">Search</span>
            </button>

            <button
              onClick={() => navigate("/messages")}
              className={`flex flex-col items-center justify-center w-full py-2 ${
                isActive("/messages") ? "text-primary" : "text-gray-500"
              }`}
            >
              <MessageSquare size={24} />
              <span className="text-xs mt-1">Messages</span>
            </button>

            <button
              onClick={() => navigate("/profile")}
              className={`flex flex-col items-center justify-center w-full py-2 ${
                isActive("/profile") ? "text-primary" : "text-gray-500"
              }`}
            >
              <User size={24} />
              <span className="text-xs mt-1">Profile</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
