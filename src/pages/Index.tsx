
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold mb-4">Welcome to BirdConnect</h1>
          <p className="text-xl text-gray-600 mb-8">
            Join our community of bird enthusiasts
          </p>
          <Button onClick={() => navigate("/auth")}>Get Started</Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
