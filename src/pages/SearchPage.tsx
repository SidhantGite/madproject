
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
  const [expandedBird, setExpandedBird] = useState<string | null>(null);

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

  const toggleExpand = (birdId: string) => {
    setExpandedBird(prev => prev === birdId ? null : birdId);
  };

  return (
    <Layout>
      <div className="px-4 py-6 pb-20">
        <h1 className="text-2xl font-bold mb-6">Bird Search</h1>
        
        <div className="mb-6">
          <div className="flex items-center gap-2">
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
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {searchResults.map((bird) => (
            <div 
              key={bird.id} 
              className="bg-white rounded-lg shadow p-4 cursor-pointer"
              onClick={() => toggleExpand(bird.id)}
            >
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                {bird.image_url && (
                  <div className="md:w-1/3">
                    <img 
                      src={bird.image_url} 
                      alt={bird.common_name} 
                      className="rounded-md w-full h-48 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = 'https://via.placeholder.com/400x300?text=Bird+Image+Not+Available';
                      }}
                    />
                  </div>
                )}
                
                <div className={`${bird.image_url ? 'md:w-2/3' : 'w-full'}`}>
                  <h3 className="text-lg font-medium mb-1">{bird.common_name}</h3>
                  <p className="text-sm italic text-gray-600 mb-3">{bird.scientific_name}</p>
                  
                  {expandedBird === bird.id && bird.description && <p className="mb-3">{bird.description}</p>}
                  
                  {expandedBird === bird.id && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <div>
                        <h4 className="font-medium text-sm">Habitat</h4>
                        <p className="text-sm text-gray-600">{bird.habitat || 'Not specified'}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm">Diet</h4>
                        <p className="text-sm text-gray-600">{bird.diet || 'Not specified'}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm">Family</h4>
                        <p className="text-sm text-gray-600">{bird.family || 'Not specified'}</p>
                      </div>
                      
                      {bird.seasonality && (
                        <div>
                          <h4 className="font-medium text-sm">Seasonality</h4>
                          <p className="text-sm text-gray-600">{bird.seasonality.join(', ')}</p>
                        </div>
                      )}
                      
                      {bird.migration_info && (
                        <div>
                          <h4 className="font-medium text-sm">Migration</h4>
                          <p className="text-sm text-gray-600">{bird.migration_info}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(bird.id);
                    }}
                  >
                    {expandedBird === bird.id ? 'Show Less' : 'Show More'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default SearchPage;
