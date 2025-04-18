
import { useState } from "react";
import { Profile } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { uploadImage } from "@/utils/imageUpload";
import { ImageUpload } from "@/components/shared/ImageUpload";

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
  const [isUpdating, setIsUpdating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleSaveProfile = async () => {
    try {
      if (!profile?.id) return;
      
      setIsUpdating(true);
      
      let avatarUrl = profile.avatar_url;
      
      if (selectedProfileImage) {
        const imageUrl = await uploadImage(selectedProfileImage, setUploadProgress);
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
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center mb-4">
        <ImageUpload
          onImageSelect={(file) => setSelectedProfileImage(file)}
          onImageClear={() => setSelectedProfileImage(null)}
          previewUrl={selectedProfileImage ? URL.createObjectURL(selectedProfileImage) : profile?.avatar_url}
          isUploading={isUpdating && !!selectedProfileImage}
          uploadProgress={uploadProgress}
          className="w-32 h-32"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Username</label>
        <Input
          value={editedUsername}
          onChange={(e) => setEditedUsername(e.target.value)}
          disabled={isUpdating}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Bio</label>
        <Input
          value={editedBio}
          onChange={(e) => setEditedBio(e.target.value)}
          placeholder="Tell us about yourself..."
          disabled={isUpdating}
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          onClick={onCancel}
          disabled={isUpdating}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSaveProfile} 
          disabled={isUpdating}
        >
          {isUpdating ? (
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
