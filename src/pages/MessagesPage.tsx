import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Search, MessageSquare, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UserSearch } from "@/components/messages/UserSearch";
import { ChatPreview } from "@/components/messages/ChatPreview";
import { MessageList } from "@/components/messages/MessageList";
import { MessageInput } from "@/components/messages/MessageInput";
import { ChatHeader } from "@/components/messages/ChatHeader";
import type { ChatPreview as ChatPreviewType, Message } from "@/types/messages";

const MessagesPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [chats, setChats] = useState<ChatPreviewType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showAllUsers, setShowAllUsers] = useState(false);

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
      
      const { data: participantData, error: participantError } = await supabase
        .from('chat_participants')
        .select('chat_id')
        .eq('user_id', user?.id);
      
      if (participantError) {
        throw participantError;
      }
      
      if (!participantData || participantData.length === 0) {
        setChats([]);
        setLoading(false);
        return;
      }
      
      const chatPreviews: ChatPreview[] = [];
      
      for (const item of participantData) {
        const { data: otherParticipants, error: otherParticipantsError } = await supabase
          .from('chat_participants')
          .select('user_id')
          .eq('chat_id', item.chat_id)
          .neq('user_id', user?.id);
          
        if (otherParticipantsError) {
          console.error("Error fetching other participants:", otherParticipantsError);
          continue;
        }
        
        if (!otherParticipants || otherParticipants.length === 0) continue;
          
        for (const otherUser of otherParticipants) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .eq('id', otherUser.user_id)
            .single();
            
          if (profileError) {
            console.error("Error fetching profile:", profileError);
            continue;
          }
          
          if (!profileData) continue;
          
          const { data: messageData } = await supabase
            .from('messages')
            .select('content, created_at')
            .eq('chat_id', item.chat_id)
            .order('created_at', { ascending: false })
            .limit(1);
          
          chatPreviews.push({
            chat_id: item.chat_id,
            username: profileData.username,
            avatar_url: profileData.avatar_url,
            last_message: messageData && messageData[0] ? messageData[0].content : "No messages yet",
            last_message_time: messageData && messageData[0] ? messageData[0].created_at : new Date().toISOString(),
            user_id: profileData.id
          });
        }
      }
      
      setChats(chatPreviews);
    } catch (error) {
      console.error("Error fetching chats:", error);
      setError("Failed to load messages");
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('id, content, created_at, sender_id')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        const formattedMessages: Message[] = [];
        
        for (const msg of data) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', msg.sender_id)
            .single();
          
          formattedMessages.push({
            id: msg.id,
            sender_id: msg.sender_id,
            content: msg.content,
            timestamp: msg.created_at,
            sender_name: profileData?.username || "Unknown",
            sender_avatar: profileData?.avatar_url
          });
        }
        
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load conversation");
    }
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

  const handleChatClick = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  const handleRetry = () => {
    fetchChats();
  };

  const sendMessage = async (content: string) => {
    if (!selectedChatId || !user) return;
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          chat_id: selectedChatId,
          content: content,
          sender_id: user.id
        })
        .select();
      
      if (error) {
        throw error;
      }
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', user.id)
        .single();
        
      if (data) {
        const newMsg: Message = {
          id: data[0].id,
          sender_id: user.id,
          content: content,
          timestamp: new Date().toISOString(),
          sender_name: profileData?.username || "You",
          sender_avatar: profileData?.avatar_url
        };
        
        setMessages(prev => [...prev, newMsg]);
        
        setChats(prev => prev.map(chat => {
          if (chat.chat_id === selectedChatId) {
            return {
              ...chat,
              last_message: content,
              last_message_time: new Date().toISOString()
            };
          }
          return chat;
        }));
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
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
                onClick={() => setShowAllUsers(!showAllUsers)}
              >
                {showAllUsers ? "Back to Chats" : "New Message"}
              </Button>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder={showAllUsers ? "Search users..." : "Search chats..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {showAllUsers ? (
              <UserSearch onUserSelect={(userId, username, avatarUrl) => {
                createNewChat(userId, username, avatarUrl);
              }} />
            ) : (
              loading ? (
                <div className="flex justify-center items-center my-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                  <p>Loading chats...</p>
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
                  <p className="text-gray-400 mt-1">Click "New Message" to start a conversation</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredChats.map((chat) => (
                    <ChatPreview
                      key={chat.chat_id}
                      chat={chat}
                      isSelected={selectedChatId === chat.chat_id}
                      onClick={() => handleChatClick(chat.chat_id)}
                    />
                  ))}
                </div>
              )
            )}
          </div>
          
          <div className="flex-1 flex flex-col">
            {selectedChatId ? (
              <>
                <ChatHeader 
                  username={chats.find(c => c.chat_id === selectedChatId)?.username || 'Chat'}
                  avatarUrl={chats.find(c => c.chat_id === selectedChatId)?.avatar_url}
                />
                <MessageList messages={messages} currentUserId={user?.id} />
                <MessageInput onSendMessage={sendMessage} />
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                <p className="text-gray-500 max-w-md">
                  Choose a chat from the list or click "New Message" to start a conversation with another user.
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
