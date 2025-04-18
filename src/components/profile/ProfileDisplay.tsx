
import { Profile } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Pencil, Loader2 } from "lucide-react";
import { useState } from "react";

interface ProfileDisplayProps {
  profile: Profile | null;
  userEmail: string | undefined;
  onEdit: () => void;
}

export const ProfileDisplay = ({ profile, userEmail, onEdit }: ProfileDisplayProps) => {
  const [imageLoading, setImageLoading] = useState(true);

  return (
    <div>
      <div className="flex flex-col items-center mb-4">
        <Avatar className="h-24 w-24 mb-2 relative">
          {profile?.avatar_url && (
            <>
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-full">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              )}
              <AvatarImage 
                src={profile.avatar_url}
                onLoad={() => setImageLoading(false)}
                onError={() => setImageLoading(false)}
              />
            </>
          )}
          <AvatarFallback>
            {profile?.username?.charAt(0).toUpperCase() || userEmail?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <h2 className="text-xl font-bold">{profile?.username || userEmail}</h2>
      </div>
      
      {profile?.bio && (
        <p className="text-center text-gray-600 mb-4">{profile.bio}</p>
      )}
      
      <div className="flex justify-center">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onEdit}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
      </div>
    </div>
  );
};
