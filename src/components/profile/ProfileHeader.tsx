
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface ProfileHeaderProps {
  username: string | null;
  onSignOut: () => void;
}

export const ProfileHeader = ({ username, onSignOut }: ProfileHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">My Profile</h1>
      <Button variant="outline" size="sm" onClick={onSignOut}>
        Sign Out
      </Button>
    </div>
  );
};
