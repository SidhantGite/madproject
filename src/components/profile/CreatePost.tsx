
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { uploadImage } from "@/utils/imageUpload";

interface CreatePostProps {
  userId: string;
  onPostCreated: () => void;
}

export const CreatePost = ({ userId, onPostCreated }: CreatePostProps) => {
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedPostImage, setSelectedPostImage] = useState<File | null>(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  const handleCreatePost = async () => {
    try {
      if (!userId || !newPostContent.trim()) return;
      
      setIsCreatingPost(true);
      
      let imageUrl = null;
      
      if (selectedPostImage) {
        imageUrl = await uploadImage(selectedPostImage);
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
      />
      
      {selectedPostImage && (
        <div className="mb-3 relative rounded-md overflow-hidden">
          <img 
            src={URL.createObjectURL(selectedPostImage)} 
            alt="Post preview" 
            className="w-full h-auto max-h-60 object-cover"
          />
          <button 
            onClick={() => setSelectedPostImage(null)}
            className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1 text-white"
          >
            &times;
          </button>
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <label className="cursor-pointer">
          <Input 
            type="file" 
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setSelectedPostImage(e.target.files[0]);
              }
            }}
          />
          <Button variant="outline" size="sm" type="button">
            <ImageIcon className="mr-2 h-4 w-4" />
            Add Image
          </Button>
        </label>
        
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
