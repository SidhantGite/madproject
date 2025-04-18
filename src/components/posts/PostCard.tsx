
import { Post } from "@/types/database";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/utils/dateFormatter";

interface PostCardProps {
  post: Post & { username: string; avatar_url?: string };
  onLike: (postId: string) => void;
}

export const PostCard = ({ post, onLike }: PostCardProps) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
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
        onClick={() => onLike(post.id)}
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
  );
};
