
-- Create the posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  likes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Allow users to view all posts (public timeline)
CREATE POLICY "Anyone can view posts"
  ON public.posts
  FOR SELECT
  USING (true);

-- Allow users to create their own posts
CREATE POLICY "Users can create their own posts"
  ON public.posts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update only their own posts
CREATE POLICY "Users can update their own posts"
  ON public.posts
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow users to delete only their own posts  
CREATE POLICY "Users can delete their own posts"
  ON public.posts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create the chats table
CREATE TABLE IF NOT EXISTS public.chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create the chat_participants table to store users in each chat
CREATE TABLE IF NOT EXISTS public.chat_participants (
  chat_id UUID REFERENCES public.chats NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  PRIMARY KEY (chat_id, user_id)
);

-- Create the messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES public.chats NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for chat access
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users can only view chats they're part of
CREATE POLICY "Users can view their chats"
  ON public.chats
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.chat_participants
    WHERE chat_participants.chat_id = chats.id
    AND chat_participants.user_id = auth.uid()
  ));

-- Users can only view chat participants for chats they're part of
CREATE POLICY "Users can view chat participants of their chats"
  ON public.chat_participants
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.chat_participants AS my_chats
    WHERE my_chats.chat_id = chat_participants.chat_id
    AND my_chats.user_id = auth.uid()
  ));

-- Users can only view messages for chats they're part of
CREATE POLICY "Users can view messages of their chats"
  ON public.messages
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.chat_participants
    WHERE chat_participants.chat_id = messages.chat_id
    AND chat_participants.user_id = auth.uid()
  ));

-- Users can only insert messages to chats they're part of
CREATE POLICY "Users can send messages to their chats"
  ON public.messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    AND EXISTS (
      SELECT 1 FROM public.chat_participants
      WHERE chat_participants.chat_id = messages.chat_id
      AND chat_participants.user_id = auth.uid()
    )
  );
