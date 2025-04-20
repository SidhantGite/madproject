
import { useState } from "react";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MOCK_USERS } from "@/types/messages";

interface UserSearchProps {
  onUserSelect: (userId: string, username: string, avatarUrl: string | null) => void;
}

export const UserSearch = ({ onUserSelect }: UserSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Simple filtering of mock users based on search term
  const filteredUsers = MOCK_USERS.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Command className="rounded-lg border shadow-md">
      <CommandInput 
        placeholder="Search users..." 
        value={searchTerm}
        onValueChange={setSearchTerm}
      />
      <CommandList>
        <CommandEmpty>No users found.</CommandEmpty>
        <CommandGroup>
          {filteredUsers.map((user) => (
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
