
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { uploadImage } from "@/utils/imageUpload";
import { ImageUpload } from "@/components/shared/ImageUpload";

interface CreatePostProps {
  userId: string;
  onPostCreated: () => void;
}

export const CreatePost = ({ userId, onPostCreated }: CreatePostProps) => {
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedPostImage, setSelectedPostImage] = useState<File | null>(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleCreatePost = async () => {
    try {
      if (!userId || !newPostContent.trim()) return;
      
      setIsCreatingPost(true);
      
      let imageUrl = null;
      
      if (selectedPostImage) {
        imageUrl = await uploadImage(selectedPostImage, setUploadProgress);
      }
      
      const newPost = {
        user_id: userId,
        content: newPostContent,
        image_url: imageUrl,
        likes: 0,
        created_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('posts')
        .insert(newPost);
        
      if (error) throw error;
      
      setNewPostContent("");
      setSelectedPostImage(null);
      setUploadProgress(0);
      onPostCreated();
      toast.success("Post created successfully");
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post");
    } finally {
      setIsCreatingPost(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <h2 className="text-lg font-medium mb-3">Create Post</h2>
      <Input
        placeholder="What's on your mind?"
        value={newPostContent}
        onChange={(e) => setNewPostContent(e.target.value)}
        className="mb-3"
        disabled={isCreatingPost}
      />
      
      <ImageUpload
        onImageSelect={(file) => setSelectedPostImage(file)}
        onImageClear={() => setSelectedPostImage(null)}
        previewUrl={selectedPostImage ? URL.createObjectURL(selectedPostImage) : undefined}
        isUploading={isCreatingPost && !!selectedPostImage}
        uploadProgress={uploadProgress}
        className="mb-3"
      />
      
      <div className="flex justify-end">
        <Button 
          onClick={handleCreatePost} 
          disabled={!newPostContent.trim() || isCreatingPost}
        >
          {isCreatingPost ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Posting...
            </>
          ) : (
            'Post'
          )}
        </Button>
      </div>
    </div>
  );
};
