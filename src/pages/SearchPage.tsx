
import Layout from "@/components/Layout";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { searchBirds, Bird } from "@/utils/birdSearch";

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Bird[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setIsSearching(true);
    setError(null);
    
    try {
      const results = await searchBirds(searchQuery);
      setSearchResults(results);
      
      if (results.length === 0) {
        toast.info("No birds found matching your search");
      }
    } catch (error) {
      setError("Error performing search. Please try again.");
      toast.error("Error performing search");
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
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
              onKeyDown={handleKeyDown}
              className="pl-10"
            />
          </div>
          <Button 
            onClick={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              'Search'
            )}
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {searchResults.map((bird) => (
            <div key={bird.id} className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-medium mb-1">{bird.common_name}</h3>
              <p className="text-sm italic text-gray-600 mb-3">{bird.scientific_name}</p>
              
              {bird.description && <p className="mb-3">{bird.description}</p>}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <h4 className="font-medium text-sm">Habitat</h4>
                  <p className="text-sm text-gray-600">{bird.habitat}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm">Diet</h4>
                  <p className="text-sm text-gray-600">{bird.diet}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm">Family</h4>
                  <p className="text-sm text-gray-600">{bird.family}</p>
                </div>
                
                {bird.migration_info && (
                  <div>
                    <h4 className="font-medium text-sm">Migration</h4>
                    <p className="text-sm text-gray-600">{bird.migration_info}</p>
                  </div>
                )}
              </div>
              
              {bird.image_url && (
                <img 
                  src={bird.image_url} 
                  alt={bird.common_name} 
                  className="mt-2 rounded-md w-full h-48 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = 'https://via.placeholder.com/400x300?text=Bird+Image+Not+Available';
                  }}
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
