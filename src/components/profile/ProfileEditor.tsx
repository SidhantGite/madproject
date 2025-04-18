
import { useState } from "react";
import { Profile } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { uploadImage } from "@/utils/imageUpload";

interface ProfileEditorProps {
  profile: Profile | null;
  userEmail: string | undefined;
  onCancel: () => void;
  onProfileUpdate: () => void;
}

export const ProfileEditor = ({ profile, userEmail, onCancel, onProfileUpdate }: ProfileEditorProps) => {
  const [editedUsername, setEditedUsername] = useState(profile?.username || '');
  const [editedBio, setEditedBio] = useState(profile?.bio || '');
  const [selectedProfileImage, setSelectedProfileImage] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleSaveProfile = async () => {
    try {
      if (!profile?.id) return;
      
      setUploadingImage(true);
      
      let avatarUrl = profile.avatar_url;
      
      if (selectedProfileImage) {
        const imageUrl = await uploadImage(selectedProfileImage);
        if (imageUrl) {
          avatarUrl = imageUrl;
        }
      }
      
      const updates = {
        id: profile.id,
        username: editedUsername,
        bio: editedBio,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id);
        
      if (error) throw error;
      
      onProfileUpdate();
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center mb-4">
        <Avatar className="h-24 w-24 mb-2">
          <AvatarImage 
            src={selectedProfileImage ? URL.createObjectURL(selectedProfileImage) : profile?.avatar_url || ''} 
          />
          <AvatarFallback>
            {profile?.username?.charAt(0).toUpperCase() || userEmail?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <label className="cursor-pointer">
          <Input 
            type="file" 
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setSelectedProfileImage(e.target.files[0]);
              }
            }}
          />
          <Button variant="outline" size="sm" type="button" className="mt-2">
            Change Photo
          </Button>
        </label>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Username</label>
        <Input
          value={editedUsername}
          onChange={(e) => setEditedUsername(e.target.value)}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Bio</label>
        <Input
          value={editedBio}
          onChange={(e) => setEditedBio(e.target.value)}
          placeholder="Tell us about yourself..."
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button 
          onClick={handleSaveProfile} 
          disabled={uploadingImage}
        >
          {uploadingImage ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save'
          )}
        </Button>
      </div>
    </div>
  );
};
