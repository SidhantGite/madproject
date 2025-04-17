
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="text-center max-w-md w-full">
        <div className="space-y-6">
          <h1 className="text-4xl font-bold">Welcome to BirdConnect</h1>
          <p className="text-xl text-gray-600">
            Join our community of bird enthusiasts
          </p>
          <Button 
            onClick={() => navigate("/auth")} 
            className="w-full py-6 text-lg"
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
