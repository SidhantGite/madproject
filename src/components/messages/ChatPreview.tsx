
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatTime } from "@/utils/dateFormatter";
import { ChatPreview as ChatPreviewType } from "@/types/messages";

interface ChatPreviewProps {
  chat: ChatPreviewType;
  isSelected: boolean;
  onClick: () => void;
}

export const ChatPreview = ({ chat, isSelected, onClick }: ChatPreviewProps) => {
  return (
    <div 
      className={`flex items-center p-3 cursor-pointer hover:bg-gray-50 ${
        isSelected ? 'bg-gray-100' : ''
      }`}
      onClick={onClick}
    >
      <Avatar className="mr-3 h-12 w-12">
        <AvatarImage src={chat.avatar_url || ''} alt={chat.username} />
        <AvatarFallback>{chat.username.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex justify-between">
          <h3 className="font-medium">{chat.username}</h3>
          <span className="text-xs text-gray-500">{formatTime(chat.last_message_time)}</span>
        </div>
        <p className="text-sm text-gray-600 truncate">{chat.last_message}</p>
      </div>
    </div>
  );
};
