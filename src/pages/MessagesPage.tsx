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

interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
}

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
  sender_avatar?: string | null;
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

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChatId || !user) return;
    
    setSendingMessage(true);
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          chat_id: selectedChatId,
          content: newMessage.trim(),
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
          content: newMessage.trim(),
          timestamp: new Date().toISOString(),
          sender_name: profileData?.username || "You",
          sender_avatar: profileData?.avatar_url
        };
        
        setMessages(prev => [...prev, newMsg]);
        setNewMessage("");
        
        setChats(prev => prev.map(chat => {
          if (chat.chat_id === selectedChatId) {
            return {
              ...chat,
              last_message: newMessage.trim(),
              last_message_time: new Date().toISOString()
            };
          }
          return chat;
        }));
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const createNewChat = async (userId: string, username: string, avatarUrl: string | null) => {
    try {
      const { data: existingChats } = await supabase
        .from('chat_participants')
        .select('chat_id')
        .eq('user_id', user?.id);
        
      if (existingChats) {
        for (const chat of existingChats) {
          const { data: participants } = await supabase
            .from('chat_participants')
            .select('user_id')
            .eq('chat_id', chat.chat_id);
            
          if (participants && participants.some(p => p.user_id === userId)) {
            setSelectedChatId(chat.chat_id);
            setShowAllUsers(false);
            return;
          }
        }
      }
      
      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .insert({})
        .select()
        .single();

      if (chatError) {
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
        throw participantsError;
      }

      const newChat: ChatPreview = {
        chat_id: chatData.id,
        username: username,
        avatar_url: avatarUrl,
        last_message: "No messages yet",
        last_message_time: chatData.created_at,
        user_id: userId
      };
      
      setChats(prev => [newChat, ...prev]);
      setSelectedChatId(chatData.id);
      setShowAllUsers(false);
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
              <UserSearch onUserSelect={createNewChat} />
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
                    <div 
                      key={chat.chat_id}
                      className={`flex items-center p-3 cursor-pointer hover:bg-gray-50 ${
                        selectedChatId === chat.chat_id ? 'bg-gray-100' : ''
                      }`}
                      onClick={() => handleChatClick(chat.chat_id)}
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
              )
            )}
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
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <MessageSquare className="h-12 w-12 text-gray-300 mb-2" />
                      <p className="text-gray-500">No messages yet</p>
                      <p className="text-sm text-gray-400">Send a message to start the conversation</p>
                    </div>
                  ) : (
                    messages.map((message) => (
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
                    ))
                  )}
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
