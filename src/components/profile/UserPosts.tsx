
import { Post } from "@/types/database";
import { formatDate } from "@/utils/dateFormatter";
import { Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UserPostsProps {
  posts: Post[];
  loading: boolean;
  error: string | null;
}

export const UserPosts = ({ posts, loading, error }: UserPostsProps) => {
  if (loading) {
    return (
      <div className="flex justify-center my-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center my-8 py-10 bg-gray-50 rounded-lg">
        <p className="text-gray-500">You haven't created any posts yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div key={post.id} className="bg-white p-4 rounded-lg shadow">
          <div className="mb-3">
            <p className="text-xs text-gray-500">{formatDate(post.created_at || '')}</p>
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
  );
};
