
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatHeaderProps {
  username: string;
  avatarUrl: string | null;
}

export const ChatHeader = ({ username, avatarUrl }: ChatHeaderProps) => {
  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center">
        <Avatar className="mr-3 h-8 w-8">
          <AvatarImage src={avatarUrl || ''} alt={username} />
          <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <h2 className="font-medium">{username}</h2>
      </div>
    </div>
  );
};
