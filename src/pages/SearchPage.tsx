
import Layout from "@/components/Layout";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Search } from "lucide-react";
import { toast } from "sonner";

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('search-with-ai', {
        body: { query: searchQuery }
      });

      if (error) throw error;
      setSearchResults(data.results);
      
      if (data.results.length === 0) {
        toast.info("No birds found matching your search");
      }
    } catch (error) {
      toast.error("Error performing search");
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Layout>
      <div className="px-4 py-6 pb-20">
        <h1 className="text-2xl font-bold mb-6">Bird Search</h1>
        
        <div className="flex items-center gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search for birds..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            onClick={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </div>

        <div className="space-y-4">
          {searchResults.map((result, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-medium mb-2">{result.common_name || result.scientific_name || 'Unknown Bird'}</h3>
              {result.description && <p className="mb-2">{result.description}</p>}
              {result.habitat && <p className="text-sm text-gray-600">Habitat: {result.habitat}</p>}
              {result.diet && <p className="text-sm text-gray-600">Diet: {result.diet}</p>}
              {result.image_url && (
                <img 
                  src={result.image_url} 
                  alt={result.common_name || "Bird"} 
                  className="mt-3 rounded-md w-full h-48 object-cover"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default SearchPage;
