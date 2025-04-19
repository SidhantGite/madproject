
import { Post } from "@/types/database";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/utils/dateFormatter";
import { useState } from "react";
import { Heart } from "lucide-react";

interface PostCardProps {
  post: Post & { username: string; avatar_url?: string };
  onLike: (postId: string) => void;
}

export const PostCard = ({ post, onLike }: PostCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    if (!isLiked) {
      setIsLiked(true);
      onLike(post.id);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

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
            className={`w-full h-auto object-cover cursor-pointer ${isExpanded ? 'max-h-none' : 'max-h-[300px]'}`}
            onClick={toggleExpand}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
            }}
          />
        </div>
      )}
      
      <button 
        className={`flex items-center text-sm ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-gray-700'}`}
        onClick={handleLike}
      >
        <Heart 
          className={`h-5 w-5 mr-1 ${isLiked ? 'fill-red-500' : ''}`}
        />
        {isLiked ? post.likes + 1 : post.likes} likes
      </button>
    </div>
  );
};
