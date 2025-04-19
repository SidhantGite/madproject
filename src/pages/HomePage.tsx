
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Post } from "@/types/database";
import { HomeHeader } from "@/components/home/HomeHeader";
import { PostList } from "@/components/posts/PostList";
import { v4 as uuidv4 } from 'uuid';

interface PostWithUser extends Post {
  username: string;
  avatar_url?: string;
}

// Demo posts to show when there are no real posts
const demoPosts: PostWithUser[] = [
  {
    id: uuidv4(),
    user_id: "demo-user-1",
    content: "Just spotted a beautiful Northern Cardinal in my backyard! These vibrant birds are always a joy to see.",
    image_url: "https://upload.wikimedia.org/wikipedia/commons/d/da/Cardinal.jpg",
    likes: 14,
    created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    updated_at: new Date(Date.now() - 3600000).toISOString(),
    username: "BirdWatcher",
    avatar_url: "https://api.dicebear.com/7.x/adventurer/svg?seed=John"
  },
  {
    id: uuidv4(),
    user_id: "demo-user-2",
    content: "Early morning hike resulted in spotting this magnificent Blue Jay. Their calls are so distinctive!",
    image_url: "https://upload.wikimedia.org/wikipedia/commons/f/f4/Blue_jay_in_PP_%2830960%29.jpg",
    likes: 23,
    created_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    updated_at: new Date(Date.now() - 7200000).toISOString(),
    username: "NaturePhotographer",
    avatar_url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Sarah"
  },
  {
    id: uuidv4(),
    user_id: "demo-user-3",
    content: "Does anyone know what kind of bird this is? Saw it near the lake this morning.",
    image_url: "https://upload.wikimedia.org/wikipedia/commons/6/67/GBHfish5.jpg",
    likes: 7,
    created_at: new Date(Date.now() - 18000000).toISOString(), // 5 hours ago
    updated_at: new Date(Date.now() - 18000000).toISOString(),
    username: "BirdNewbie",
    avatar_url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Alex"
  }
];

const HomePage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showingDemoPosts, setShowingDemoPosts] = useState(false);

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
      
      if (postsData && postsData.length > 0) {
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
        setShowingDemoPosts(false);
      } else {
        // Show demo posts if no real posts are available
        setPosts(demoPosts);
        setShowingDemoPosts(true);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError("Failed to load posts. Please try again later.");
      toast.error('Failed to load posts');
      // Show demo posts on error
      setPosts(demoPosts);
      setShowingDemoPosts(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      // If we're showing demo posts, just update the state
      if (showingDemoPosts) {
        setPosts(currentPosts => 
          currentPosts.map(p => 
            p.id === postId ? { ...p, likes: p.likes + 1 } : p
          )
        );
        return;
      }
      
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

  return (
    <Layout>
      <div className="px-4 py-6 pb-20">
        <HomeHeader isAuthenticated={!!user} />
        {showingDemoPosts && !loading && !error && (
          <div className="mb-6 p-3 bg-blue-50 text-blue-700 rounded-md text-sm">
            Showing demo posts. Create an account and start posting to see real content!
          </div>
        )}
        <PostList 
          posts={posts}
          loading={loading}
          error={error}
          onLike={handleLike}
          onRetry={fetchPosts}
        />
      </div>
    </Layout>
  );
};

export default HomePage;
