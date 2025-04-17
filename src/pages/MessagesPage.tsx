import Layout from "@/components/Layout";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Search, MessageSquare, Loader2, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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
  const [error, setError] = useState<string | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchChats();
    }
  }, [user]);

  const fetchChats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // This is a placeholder for actual API call
      // In Phase 3, we'd implement real chat functionality using the chats and messages tables
      setTimeout(() => {
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
          },
          {
            chat_id: "3",
            username: "NaturePhotographer",
            avatar_url: null,
            last_message: "Check out this amazing cardinal photo I took yesterday!",
            last_message_time: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            user_id: "789"
          },
          {
            chat_id: "4",
            username: "OrnithologyStudent",
            avatar_url: null,
            last_message: "Do you have any resources about migration patterns?",
            last_message_time: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            user_id: "101"
          },
          {
            chat_id: "5",
            username: "WildlifeExpert",
            avatar_url: null,
            last_message: "The warbler sighting you reported is very interesting!",
            last_message_time: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
            user_id: "112"
          }
        ];
        
        setChats(mockChats);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching chats:", error);
      setError("Failed to load messages");
      toast.error("Failed to load messages");
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // Less than a day
    if (diff < 86400000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Less than a week
    if (diff < 604800000) {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return days[date.getDay()];
    }
    
    // Otherwise show the date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const filteredChats = chats.filter(chat => 
    chat.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChatClick = (chatId: string, userId: string) => {
    setSelectedChatId(chatId);
    toast.info("Full chat functionality coming in Phase 3");
    // In Phase 3, this would navigate to a chat detail view
  };

  const handleRetry = () => {
    fetchChats();
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
          <div className="flex justify-center items-center my-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
            <p>Loading messages...</p>
          </div>
        ) : error ? (
          <div className="text-center my-8 py-10 bg-gray-50 rounded-lg">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={handleRetry}>Retry</Button>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="text-center my-8 py-10 bg-gray-50 rounded-lg">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No messages found</p>
            {searchTerm && <p className="text-gray-400 mt-1">Try a different search term</p>}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredChats.map((chat) => (
              <div 
                key={chat.chat_id}
                className={`flex items-center p-3 rounded-lg bg-white shadow cursor-pointer hover:bg-gray-50 ${
                  selectedChatId === chat.chat_id ? 'border-2 border-primary' : ''
                }`}
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
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">Full messaging functionality will be available in Phase 3</p>
              <p className="text-xs text-gray-400 mt-1">This is currently showing placeholder data</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MessagesPage;
