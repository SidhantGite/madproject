
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (message: string) => Promise<void>;
  disabled?: boolean;
}

export const MessageInput = ({ onSendMessage, disabled }: MessageInputProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;
    
    setSending(true);
    try {
      await onSendMessage(newMessage.trim());
      setNewMessage("");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t border-gray-200">
      <div className="flex items-end">
        <Input
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || sending}
          className="flex-1 mr-2"
        />
        <Button 
          size="icon" 
          onClick={handleSend}
          disabled={!newMessage.trim() || disabled || sending}
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};
