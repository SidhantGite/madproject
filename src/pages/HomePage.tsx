import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Post, Profile } from "@/types/database";

interface PostWithUser extends Post {
  username: string;
  avatar_url?: string;
}

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<PostWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (postsError) throw postsError;
      
      if (postsData) {
        const formattedPosts = await Promise.all(
          postsData.map(async (post) => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('username, avatar_url')
              .eq('id', post.user_id)
              .single();
              
            return {
              ...post,
              username: profileData?.username || 'Unknown user',
              avatar_url: profileData?.avatar_url,
            };
          })
        );
        
        setPosts(formattedPosts);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError("Failed to load posts. Please try again later.");
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;
      
      setPosts(currentPosts => 
        currentPosts.map(p => 
          p.id === postId ? { ...p, likes: p.likes + 1 } : p
        )
      );
      
      const { error } = await supabase
        .from('posts')
        .update({ likes: post.likes + 1 })
        .eq('id', postId);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Failed to like post');
      fetchPosts();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleRetry = () => {
    fetchPosts();
  };

  return (
    <Layout>
      <div className="px-4 py-6 pb-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">BirdConnect</h1>
          {user ? (
            <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>
              Sign Out
            </Button>
          ) : (
            <Button size="sm" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center my-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p>Loading posts...</p>
          </div>
        ) : error ? (
          <div className="text-center my-8 py-10 bg-gray-50 rounded-lg">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={handleRetry}>Retry</Button>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center my-8 py-10 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post.id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center mb-3">
                  <Avatar className="mr-3 h-8 w-8">
                    <AvatarImage src={post.avatar_url || ''} alt={post.username} />
                    <AvatarFallback>{post.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{post.username}</p>
                    <p className="text-xs text-gray-500">{formatDate(post.created_at)}</p>
                  </div>
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
                
                <button 
                  className="flex items-center text-sm text-gray-500 hover:text-gray-700"
                  onClick={() => handleLike(post.id)}
                >
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
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HomePage;
