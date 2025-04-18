
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { Post, Profile } from "@/types/database";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileEditor } from "@/components/profile/ProfileEditor";
import { ProfileDisplay } from "@/components/profile/ProfileDisplay";
import { CreatePost } from "@/components/profile/CreatePost";
import { UserPosts } from "@/components/profile/UserPosts";

interface ProfilePageState {
  profile: Profile | null;
  posts: Post[];
  loading: boolean;
  isEditing: boolean;
}

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const [state, setState] = useState<ProfilePageState>({
    profile: null,
    posts: [],
    loading: true,
    isEditing: false,
  });

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
        setState(prev => ({
          ...prev,
          profile: data,
        }));
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    }
  };

  const fetchUserPosts = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      if (!user) return;
      
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        setState(prev => ({ ...prev, posts: data }));
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load your posts");
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="px-4 py-6 pb-20">
        <ProfileHeader 
          username={state.profile?.username || user.email}
          onSignOut={signOut}
        />
        
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          {state.isEditing ? (
            <ProfileEditor
              profile={state.profile}
              userEmail={user.email}
              onCancel={() => setState(prev => ({ ...prev, isEditing: false }))}
              onProfileUpdate={() => {
                setState(prev => ({ ...prev, isEditing: false }));
                fetchProfile();
              }}
            />
          ) : (
            <ProfileDisplay
              profile={state.profile}
              userEmail={user.email}
              onEdit={() => setState(prev => ({ ...prev, isEditing: true }))}
            />
          )}
        </div>
        
        <CreatePost 
          userId={user.id}
          onPostCreated={fetchUserPosts}
        />
        
        <h2 className="text-lg font-semibold mb-3">My Posts</h2>
        <UserPosts 
          posts={state.posts}
          loading={state.loading}
        />
      </div>
    </Layout>
  );
};

export default ProfilePage;
