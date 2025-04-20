
import { useState } from "react";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface UserSearchProps {
  onUserSelect: (userId: string, username: string, avatarUrl: string | null) => void;
}

export const UserSearch = ({ onUserSelect }: UserSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: users, isLoading } = useQuery({
    queryKey: ['searchUsers', searchTerm],
    queryFn: async () => {
      // Get all users except the current user, regardless of search term
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url');

      if (error) {
        console.error("Error fetching users:", error);
        throw error;
      }

      // Filter by search term client-side if a search term is provided
      if (searchTerm) {
        return data.filter(user => 
          user.username.toLowerCase().includes(searchTerm.toLowerCase())
        ) || [];
      }
      
      return data || [];
    },
    initialData: []
  });

  return (
    <Command className="rounded-lg border shadow-md">
      <CommandInput 
        placeholder="Search users..." 
        value={searchTerm}
        onValueChange={setSearchTerm}
      />
      <CommandList>
        <CommandEmpty>
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : (
            "No users found."
          )}
        </CommandEmpty>
        <CommandGroup>
          {users?.map((user) => (
            <CommandItem
              key={user.id}
              onSelect={() => onUserSelect(user.id, user.username, user.avatar_url)}
              className="flex items-center gap-2 p-2 cursor-pointer"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar_url || ''} />
                <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span>{user.username}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
};
