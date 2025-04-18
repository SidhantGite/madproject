
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Post } from "@/types/database";
import { HomeHeader } from "@/components/home/HomeHeader";
import { PostList } from "@/components/posts/PostList";

interface PostWithUser extends Post {
  username: string;
  avatar_url?: string;
}

const HomePage = () => {
  const { user } = useAuth();
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

  return (
    <Layout>
      <div className="px-4 py-6 pb-20">
        <HomeHeader isAuthenticated={!!user} />
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
