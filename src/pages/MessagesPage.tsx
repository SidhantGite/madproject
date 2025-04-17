
import Layout from "@/components/Layout";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface ChatPreview {
  chat_id: string;
  username: string;
  avatar_url: string | null;
  last_message: string;
  last_message_time: string;
  user_id: string;
}

const MessagesPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchChats();
    }
  }, [user]);

  const fetchChats = async () => {
    try {
      setLoading(true);
      
      // This is a placeholder for actual API call
      // In a real app, you'd fetch actual chat data from your Supabase tables
      const mockChats: ChatPreview[] = [
        {
          chat_id: "1",
          username: "JaneDoe",
          avatar_url: null, 
          last_message: "Have you seen the blue jay near the park?",
          last_message_time: new Date().toISOString(),
          user_id: "123"
        },
        {
          chat_id: "2",
          username: "BirdLover42",
          avatar_url: null,
          last_message: "I found a rare bird nest!",
          last_message_time: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          user_id: "456"
        }
      ];
      
      setChats(mockChats);
    } catch (error) {
      console.error("Error fetching chats:", error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filteredChats = chats.filter(chat => 
    chat.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChatClick = (chatId: string, userId: string) => {
    toast.info("Chat functionality coming soon");
    // In a full implementation, this would navigate to a chat detail page
    // navigate(`/messages/${chatId}`);
  };

  return (
    <Layout>
      <div className="px-4 py-6 pb-20">
        <h1 className="text-2xl font-bold mb-6">Messages</h1>
        
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {loading ? (
          <div className="flex justify-center my-8">
            <p>Loading messages...</p>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="text-center my-8 py-10 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No messages found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredChats.map((chat) => (
              <div 
                key={chat.chat_id}
                className="flex items-center p-3 rounded-lg bg-white shadow cursor-pointer hover:bg-gray-50"
                onClick={() => handleChatClick(chat.chat_id, chat.user_id)}
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
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MessagesPage;
