
export interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  likes: number;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  username: string;
  avatar_url?: string | null;
  bio?: string | null;
  created_at: string;
  updated_at: string;
}
