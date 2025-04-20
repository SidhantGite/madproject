
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

// Add simple mock user data
export const MOCK_USERS = [
  {
    id: "1",
    username: "birdwatcher",
    avatar_url: null
  },
  {
    id: "2",
    username: "naturelover",
    avatar_url: null
  },
  {
    id: "3",
    username: "wildlifeexpert",
    avatar_url: null
  },
  {
    id: "4",
    username: "ornithologist",
    avatar_url: null
  },
  {
    id: "5",
    username: "eagleseye",
    avatar_url: null
  }
];
