import Layout from "@/components/Layout";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Search, MessageSquare, Loader2, AlertCircle, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UserSearch } from "@/components/messages/UserSearch";

interface ChatPreview {
  chat_id: string;
  username: string;
  avatar_url: string | null;
  last_message: string;
  last_message_time: string;
  user_id: string;
}

interface Message {
  id: string;
  sender_id: string;
  content: string;
  timestamp: string;
  sender_name: string;
  sender_avatar?: string;
}

const MessagesPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);

  useEffect(() => {
    if (user) {
      fetchChats();
    }
  }, [user]);

  useEffect(() => {
    if (selectedChatId) {
      fetchMessages(selectedChatId);
    }
  }, [selectedChatId]);

  const fetchChats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      setTimeout(() => {
        const mockChats: ChatPreview[] = [
          {
            chat_id: "1",
            username: "JaneDoe",
            avatar_url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Jane", 
            last_message: "Have you seen the blue jay near the park?",
            last_message_time: new Date().toISOString(),
            user_id: "123"
          },
          {
            chat_id: "2",
            username: "BirdLover42",
            avatar_url: "https://api.dicebear.com/7.x/adventurer/svg?seed=BirdLover",
            last_message: "I found a rare bird nest!",
            last_message_time: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            user_id: "456"
          },
          {
            chat_id: "3",
            username: "NaturePhotographer",
            avatar_url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Nature",
            last_message: "Check out this amazing cardinal photo I took yesterday!",
            last_message_time: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            user_id: "789"
          },
          {
            chat_id: "4",
            username: "OrnithologyStudent",
            avatar_url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Student",
            last_message: "Do you have any resources about migration patterns?",
            last_message_time: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            user_id: "101"
          },
          {
            chat_id: "5",
            username: "WildlifeExpert",
            avatar_url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Wildlife",
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

  const fetchMessages = async (chatId: string) => {
    const mockMessages: Message[] = [
      {
        id: "1",
        sender_id: "123",
        content: "Hello! Have you been birdwatching lately?",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        sender_name: "JaneDoe",
        sender_avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Jane"
      },
      {
        id: "2",
        sender_id: user?.id || "current-user",
        content: "Yes! I saw a beautiful blue jay yesterday.",
        timestamp: new Date(Date.now() - 3500000).toISOString(),
        sender_name: "You",
      },
      {
        id: "3",
        sender_id: "123",
        content: "That's awesome! Where did you see it?",
        timestamp: new Date(Date.now() - 3400000).toISOString(),
        sender_name: "JaneDoe",
        sender_avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Jane"
      },
      {
        id: "4",
        sender_id: user?.id || "current-user",
        content: "In the park near my house. I took some photos too!",
        timestamp: new Date(Date.now() - 3300000).toISOString(),
        sender_name: "You",
      }
    ];

    setMessages(mockMessages);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 86400000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    if (diff < 604800000) {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return days[date.getDay()];
    }
    
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const filteredChats = chats.filter(chat => 
    chat.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChatClick = (chatId: string, userId: string) => {
    setSelectedChatId(chatId);
  };

  const handleRetry = () => {
    fetchChats();
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedChatId) return;
    
    setSendingMessage(true);
    
    setTimeout(() => {
      const newMsg: Message = {
        id: `temp-${Date.now()}`,
        sender_id: user?.id || "current-user",
        content: newMessage,
        timestamp: new Date().toISOString(),
        sender_name: "You"
      };
      
      setMessages(prev => [...prev, newMsg]);
      setNewMessage("");
      setSendingMessage(false);
      
      setTimeout(() => {
        const responseMsg: Message = {
          id: `temp-${Date.now() + 1}`,
          sender_id: "123",
          content: "Thanks for your message! This is a demo response for Phase 2. Full chat functionality will be available in Phase 3.",
          timestamp: new Date().toISOString(),
          sender_name: "JaneDoe",
          sender_avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Jane"
        };
        
        setMessages(prev => [...prev, responseMsg]);
      }, 1500);
      
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleNewChat = async (userId: string, username: string) => {
    try {
      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .insert({})
        .select()
        .single();

      if (chatError) {
        console.error("Error creating chat:", chatError);
        throw chatError;
      }

      const participants = [
        { chat_id: chatData.id, user_id: user?.id },
        { chat_id: chatData.id, user_id: userId }
      ];

      const { error: participantsError } = await supabase
        .from('chat_participants')
        .insert(participants);

      if (participantsError) {
        console.error("Error adding chat participants:", participantsError);
        throw participantsError;
      }

      const newChat: ChatPreview = {
        chat_id: chatData.id,
        username: username,
        avatar_url: null,
        last_message: "",
        last_message_time: new Date().toISOString(),
        user_id: userId
      };
      
      setChats(prev => [newChat, ...prev]);
      setSelectedChatId(chatData.id);
      setShowUserSearch(false);
      toast.success("Chat created successfully");
    } catch (error) {
      console.error("Error creating chat:", error);
      toast.error("Failed to create chat");
    }
  };

  return (
    <Layout>
      <div className="px-4 py-6 pb-20 h-full">
        <h1 className="text-2xl font-bold mb-6">Messages</h1>
        
        <div className="flex h-[calc(100vh-200px)] bg-white rounded-lg shadow overflow-hidden">
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            <div className="p-3">
              <Button 
                variant="outline" 
                className="w-full mb-3"
                onClick={() => setShowUserSearch(true)}
              >
                New Message
              </Button>
              {showUserSearch && (
                <div className="mb-3">
                  <UserSearch onUserSelect={handleNewChat} />
                </div>
              )}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Search chats..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center my-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                <p>Loading messages...</p>
              </div>
            ) : error ? (
              <div className="text-center my-8 py-10 bg-gray-50">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={handleRetry}>Retry</Button>
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="text-center my-8 py-10 bg-gray-50">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No messages found</p>
                {searchTerm && <p className="text-gray-400 mt-1">Try a different search term</p>}
              </div>
            ) : (
              <div className="space-y-1">
                {filteredChats.map((chat) => (
                  <div 
                    key={chat.chat_id}
                    className={`flex items-center p-3 cursor-pointer hover:bg-gray-50 ${
                      selectedChatId === chat.chat_id ? 'bg-gray-100' : ''
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
              </div>
            )}
            
            <div className="mt-4 px-3">
              <p className="text-xs text-center text-gray-500">
                Full chat functionality coming in Phase 3
              </p>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col">
            {selectedChatId ? (
              <>
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <Avatar className="mr-3 h-8 w-8">
                      <AvatarImage 
                        src={chats.find(c => c.chat_id === selectedChatId)?.avatar_url || ''} 
                        alt={chats.find(c => c.chat_id === selectedChatId)?.username || ''} 
                      />
                      <AvatarFallback>
                        {(chats.find(c => c.chat_id === selectedChatId)?.username || '').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="font-medium">
                      {chats.find(c => c.chat_id === selectedChatId)?.username || 'Chat'}
                    </h2>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div 
                      key={message.id}
                      className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.sender_id === user?.id 
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
                
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-end">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={sendingMessage}
                      className="flex-1 mr-2"
                    />
                    <Button 
                      size="icon" 
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || sendingMessage}
                    >
                      {sendingMessage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                <p className="text-gray-500 max-w-md">
                  Choose a chat from the list or search for someone to start a conversation with.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MessagesPage;
