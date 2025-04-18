
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface ProfilePageState {
  profile: Profile | null;
  posts: Post[];
  loading: boolean;
  profileLoading: boolean;
  error: string | null;
  isEditing: boolean;
}

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const [state, setState] = useState<ProfilePageState>({
    profile: null,
    posts: [],
    loading: true,
    profileLoading: true,
    error: null,
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
      
      setState(prev => ({ ...prev, profileLoading: true, error: null }));
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      
      setState(prev => ({
        ...prev,
        profile: data,
        profileLoading: false
      }));
    } catch (error) {
      console.error("Error fetching profile:", error);
      setState(prev => ({
        ...prev,
        profileLoading: false,
        error: "Failed to load profile data"
      }));
      toast.error("Could not load profile data");
    }
  };

  const fetchUserPosts = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      if (!user) return;
      
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setState(prev => ({
        ...prev,
        posts: data || [],
        loading: false
      }));
    } catch (error) {
      console.error("Error fetching posts:", error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: "Failed to load posts"
      }));
      toast.error("Could not load your posts");
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
        
        {state.error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}
        
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          {state.profileLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : state.isEditing ? (
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
          error={state.error}
        />
      </div>
    </Layout>
  );
};

export default ProfilePage;
