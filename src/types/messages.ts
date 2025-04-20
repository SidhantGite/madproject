
export interface ChatPreview {
  chat_id: string;
  username: string;
  avatar_url: string | null;
  last_message: string;
  last_message_time: string;
  user_id: string;
}

export interface Message {
  id: string;
  sender_id: string;
  content: string;
  timestamp: string;
  sender_name: string;
  sender_avatar?: string | null;
}
