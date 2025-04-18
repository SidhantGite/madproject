
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface HomeHeaderProps {
  isAuthenticated: boolean;
}

export const HomeHeader = ({ isAuthenticated }: HomeHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">BirdConnect</h1>
      {isAuthenticated ? (
        <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>
          Sign Out
        </Button>
      ) : (
        <Button size="sm" onClick={() => navigate("/auth")}>
          Sign In
        </Button>
      )}
    </div>
  );
};
