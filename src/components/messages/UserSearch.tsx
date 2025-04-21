
import { useEffect, useState } from "react";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MOCK_USERS } from "@/types/messages";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface UserSearchProps {
  onUserSelect: (userId: string, username: string, avatarUrl: string | null) => void;
}

interface RealUser {
  id: string;
  username: string;
  avatar_url: string | null;
}

export const UserSearch = ({ onUserSelect }: UserSearchProps) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [realUsers, setRealUsers] = useState<RealUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all real users from Supabase
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, avatar_url");

      if (error) {
        setRealUsers([]);
      } else if (data) {
        setRealUsers(
          data
            .filter(
              (profile: any) =>
                profile.id !== user?.id // Don't show current user
                && profile.username // Only profiles with usernames
            )
            .map((profile: any) => ({
              id: profile.id,
              username: profile.username,
              avatar_url: profile.avatar_url || null,
            }))
        );
      }
      setLoading(false);
    };

    fetchUsers();
    // eslint-disable-next-line
  }, [user?.id]);

  // Remove mock users that have the same username as real users
  const filteredMockUsers = MOCK_USERS.filter(
    (mock) =>
      !realUsers.some(
        (real) =>
          real.username.toLowerCase() === mock.username.toLowerCase()
      )
      && mock.id !== user?.id // Also don't show mock user of current id
  );

  // Merge real users and filtered mocks (ID will differentiate)
  const allOptions = [
    ...realUsers,
    ...filteredMockUsers,
  ];

  // Simple filtering of all options based on search term
  const filteredUsers = allOptions.filter(userItem =>
    userItem.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Command className="rounded-lg border shadow-md">
      <CommandInput 
        placeholder="Search users..." 
        value={searchTerm}
        onValueChange={setSearchTerm}
      />
      <CommandList>
        <CommandEmpty>
          {loading ? "Loading users..." : "No users found."}
        </CommandEmpty>
        <CommandGroup>
          {filteredUsers.map((user) => (
            <CommandItem
              key={user.id}
              onSelect={() => onUserSelect(user.id, user.username, user.avatar_url)}
              className="flex items-center gap-2 p-2 cursor-pointer"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar_url || ''} />
                <AvatarFallback>
                  {user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>{user.username}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
};
