
import Layout from "@/components/Layout";
import { useState, useEffect, ChangeEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Pencil, PlusCircle, Loader2, ImageIcon } from "lucide-react";
import { uploadImage } from "@/utils/imageUpload";

interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
}

interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  created_at: string;
  likes: number;
}

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUsername, setEditedUsername] = useState("");
  const [editedBio, setEditedBio] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [selectedProfileImage, setSelectedProfileImage] = useState<File | null>(null);
  const [selectedPostImage, setSelectedPostImage] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUserPosts();
    }
  }, [user]);
  
  const fetchProfile = async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setProfile(data);
        setEditedUsername(data.username || '');
        setEditedBio(data.bio || '');
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    }
  };
  
  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      if (!user) return;
      
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        setPosts(data);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load your posts");
    } finally {
      setLoading(false);
    }
  };
  
  const handleProfileImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedProfileImage(event.target.files[0]);
    }
  };
  
  const handlePostImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedPostImage(event.target.files[0]);
    }
  };
  
  const handleSaveProfile = async () => {
    try {
      if (!user) return;
      
      setUploadingImage(true);
      
      let avatarUrl = profile?.avatar_url;
      
      // If a new profile image was selected, upload it
      if (selectedProfileImage) {
        const imageUrl = await uploadImage(selectedProfileImage);
        if (imageUrl) {
          avatarUrl = imageUrl;
        }
      }
      
      const updates = {
        id: user.id,
        username: editedUsername,
        bio: editedBio,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
        
      if (error) throw error;
      
      setIsEditing(false);
      setSelectedProfileImage(null);
      fetchProfile(); // Refresh profile data
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setUploadingImage(false);
    }
  };
  
  const handleCreatePost = async () => {
    try {
      if (!user || !newPostContent.trim()) return;
      
      setIsCreatingPost(true);
      
      let imageUrl = null;
      
      // If an image was selected for the post, upload it
      if (selectedPostImage) {
        imageUrl = await uploadImage(selectedPostImage);
      }
      
      const newPost = {
        user_id: user.id,
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
      fetchUserPosts(); // Refresh posts
      toast.success("Post created successfully");
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post");
    } finally {
      setIsCreatingPost(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  return (
    <Layout>
      <div className="px-4 py-6 pb-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Profile</h1>
          <Button variant="outline" size="sm" onClick={() => signOut()}>
            Sign Out
          </Button>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          {isEditing ? (
            <div className="space-y-4">
              <div className="flex flex-col items-center mb-4">
                <Avatar className="h-24 w-24 mb-2">
                  <AvatarImage 
                    src={selectedProfileImage ? URL.createObjectURL(selectedProfileImage) : profile?.avatar_url || ''} 
                  />
                  <AvatarFallback>{profile?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                
                <label className="cursor-pointer">
                  <Input 
                    type="file" 
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfileImageChange}
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
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
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
          ) : (
            <div>
              <div className="flex flex-col items-center mb-4">
                <Avatar className="h-24 w-24 mb-2">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback>{profile?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">{profile?.username || user?.email}</h2>
              </div>
              
              {profile?.bio && (
                <p className="text-center text-gray-600 mb-4">{profile.bio}</p>
              )}
              
              <div className="flex justify-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {/* Create Post */}
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
                onChange={handlePostImageChange}
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
        
        {/* User Posts */}
        <h2 className="text-lg font-semibold mb-3">My Posts</h2>
        {loading ? (
          <div className="flex justify-center my-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="ml-2">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center my-8 py-10 bg-gray-50 rounded-lg">
            <p className="text-gray-500">You haven't created any posts yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-white p-4 rounded-lg shadow">
                <div className="mb-3">
                  <p className="text-xs text-gray-500">{formatDate(post.created_at)}</p>
                </div>
                
                <p className="mb-3">{post.content}</p>
                
                {post.image_url && (
                  <div className="mb-3 rounded-md overflow-hidden">
                    <img 
                      src={post.image_url} 
                      alt="Post content" 
                      className="w-full h-auto object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                      }}
                    />
                  </div>
                )}
                
                <div className="flex items-center text-sm text-gray-500">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 mr-1" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                    />
                  </svg>
                  {post.likes} likes
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProfilePage;
