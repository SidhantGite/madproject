
import { MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatTime } from "@/utils/dateFormatter";
import { Message } from "@/types/messages";

interface MessageListProps {
  messages: Message[];
  currentUserId?: string;
}

export const MessageList = ({ messages, currentUserId }: MessageListProps) => {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <MessageSquare className="h-12 w-12 text-gray-300 mb-2" />
        <p className="text-gray-500">No messages yet</p>
        <p className="text-sm text-gray-400">Send a message to start the conversation</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div 
          key={message.id}
          className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
        >
          <div 
            className={`max-w-[70%] p-3 rounded-lg ${
              message.sender_id === currentUserId 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            <p>{message.content}</p>
            <div className="text-xs mt-1 opacity-70">
              {formatTime(message.timestamp)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
