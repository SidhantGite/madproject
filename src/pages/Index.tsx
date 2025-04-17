
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/home");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="text-center max-w-md w-full space-y-8">
        <div>
          <h1 className="text-5xl font-bold tracking-tight mb-6">BirdConnect</h1>
          <p className="text-xl text-gray-600 mb-8">
            Join our community of bird enthusiasts
          </p>
        </div>
        
        <div className="space-y-4">
          <Button 
            onClick={() => navigate("/auth")} 
            className="w-full py-6 text-lg"
            size="lg"
          >
            Get Started
          </Button>
          
          <p className="text-sm text-gray-500 pt-4">
            Connect with other bird watchers, share your sightings, and explore migration patterns.
          </p>
        </div>
      </div>
      
      <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-gray-500">
        <p>BirdConnect © 2025 | A community for bird enthusiasts</p>
      </div>
    </div>
  );
};

export default Index;
