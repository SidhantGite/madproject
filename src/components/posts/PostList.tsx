
import { Post } from "@/types/database";
import { PostCard } from "./PostCard";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PostListProps {
  posts: (Post & { username: string; avatar_url?: string; })[];
  loading: boolean;
  error: string | null;
  onLike: (postId: string) => void;
  onRetry: () => void;
}

export const PostList = ({ posts, loading, error, onLike, onRetry }: PostListProps) => {
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center my-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p>Loading posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center my-8 py-10 bg-gray-50 rounded-lg">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={onRetry}>Retry</Button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center my-8 py-10 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No posts yet. Be the first to share!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onLike={onLike} />
      ))}
    </div>
  );
};
