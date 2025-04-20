
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Search, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UserSearch } from "@/components/messages/UserSearch";
import { ChatPreview } from "@/components/messages/ChatPreview";
import { MessageList } from "@/components/messages/MessageList";
import { MessageInput } from "@/components/messages/MessageInput";
import { ChatHeader } from "@/components/messages/ChatHeader";
import type { ChatPreview as ChatPreviewType, Message, MOCK_USERS } from "@/types/messages";

const MessagesPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [chats, setChats] = useState<ChatPreviewType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showAllUsers, setShowAllUsers] = useState(false);

  // Initialize with some mock chats
  useEffect(() => {
    const mockChats: ChatPreviewType[] = [
      {
        chat_id: "chat1",
        username: "birdwatcher",
        avatar_url: null,
        last_message: "Hello there!",
        last_message_time: new Date().toISOString(),
        user_id: "1"
      },
      {
        chat_id: "chat2",
        username: "naturelover",
        avatar_url: null,
        last_message: "Did you see that Cardinal yesterday?",
        last_message_time: new Date().toISOString(),
        user_id: "2"
      }
    ];
    
    setChats(mockChats);
    setLoading(false);
  }, []);

  // Mock function to fetch messages for a selected chat
  const fetchMessages = async (chatId: string) => {
    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock messages based on chat ID
    const mockMessages: Message[] = [
      {
        id: "msg1",
        sender_id: chatId === "chat1" ? "1" : "2",
        content: "Hello there!",
        timestamp: new Date().toISOString(),
        sender_name: chatId === "chat1" ? "birdwatcher" : "naturelover",
        sender_avatar: null
      },
      {
        id: "msg2",
        sender_id: user?.id || "current-user",
        content: "Hi! How are you?",
        timestamp: new Date().toISOString(),
        sender_name: "You",
        sender_avatar: null
      }
    ];
    
    setMessages(mockMessages);
  };

  // Handle selecting a chat
  const handleChatClick = (chatId: string) => {
    setSelectedChatId(chatId);
    fetchMessages(chatId);
  };

  // Handle creating a new chat with a user
  const createNewChat = (userId: string, username: string, avatarUrl: string | null) => {
    const newChatId = `new-chat-${Date.now()}`;
    const newChat: ChatPreviewType = {
      chat_id: newChatId,
      username: username,
      avatar_url: avatarUrl,
      last_message: "No messages yet",
      last_message_time: new Date().toISOString(),
      user_id: userId
    };
    
    setChats(prev => [newChat, ...prev]);
    setSelectedChatId(newChatId);
    setMessages([]);
    setShowAllUsers(false);
    toast.success(`Started a conversation with ${username}`);
  };

  // Handle sending a message
  const sendMessage = async (content: string) => {
    if (!selectedChatId || !user) return;
    
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      sender_id: user.id,
      content: content,
      timestamp: new Date().toISOString(),
      sender_name: "You"
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Update the last message in the chat preview
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
    
    toast.success("Message sent");
  };

  const filteredChats = chats.filter(chat => 
    chat.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                  <p>Loading chats...</p>
                </div>
              ) : error ? (
                <div className="text-center my-8 py-10 bg-gray-50">
                  <p className="text-red-500 mb-4">{error}</p>
                  <Button onClick={() => setError(null)}>Retry</Button>
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
