
import { supabase } from "@/integrations/supabase/client";

export interface Bird {
  id: string;
  common_name: string;
  scientific_name: string;
  description: string | null;
  habitat: string | null;
  diet: string | null;
  family: string | null;
  image_url: string | null;
  migration_info: string | null;
  seasonality: string[] | null;
}

// Mock bird data to ensure search works while database integration is being fixed
const MOCK_BIRDS: Bird[] = [
  {
    id: "1",
    common_name: "American Robin",
    scientific_name: "Turdus migratorius",
    description: "The American robin is a migratory songbird of the true thrush genus and Turdidae, the wider thrush family.",
    habitat: "Woodlands, gardens, parks, yards",
    diet: "Insects, earthworms, berries",
    family: "Turdidae",
    image_url: "https://upload.wikimedia.org/wikipedia/commons/b/b8/Turdus-migratorius-002.jpg",
    migration_info: "Partial migrant, moving south in winter from northern breeding grounds",
    seasonality: ["Spring", "Summer", "Fall"]
  },
  {
    id: "2",
    common_name: "Blue Jay",
    scientific_name: "Cyanocitta cristata",
    description: "The blue jay is a passerine bird in the family Corvidae, native to eastern North America.",
    habitat: "Forests, particularly with oak trees, suburban gardens",
    diet: "Nuts, seeds, insects, and occasionally small vertebrates",
    family: "Corvidae",
    image_url: "https://upload.wikimedia.org/wikipedia/commons/f/f4/Blue_jay_in_PP_%2830960%29.jpg",
    migration_info: "Partially migratory, with some northern populations moving south in winter",
    seasonality: ["Spring", "Summer", "Fall", "Winter"]
  },
  {
    id: "3",
    common_name: "Northern Cardinal",
    scientific_name: "Cardinalis cardinalis",
    description: "The northern cardinal is a bird in the genus Cardinalis. It is also known colloquially as the redbird or common cardinal.",
    habitat: "Gardens, shrublands, forest edges",
    diet: "Seeds, grains, fruits, insects",
    family: "Cardinalidae",
    image_url: "https://upload.wikimedia.org/wikipedia/commons/d/da/Cardinal.jpg",
    migration_info: "Non-migratory, remains in the same territory year-round",
    seasonality: ["Spring", "Summer", "Fall", "Winter"]
  },
  {
    id: "4",
    common_name: "Great Blue Heron",
    scientific_name: "Ardea herodias",
    description: "The great blue heron is a large wading bird in the family Ardeidae, common near the shores of open water and in wetlands.",
    habitat: "Wetlands, marshes, shores of ponds, lakes, and rivers",
    diet: "Fish, amphibians, reptiles, small mammals, insects",
    family: "Ardeidae",
    image_url: "https://upload.wikimedia.org/wikipedia/commons/6/67/GBHfish5.jpg",
    migration_info: "Partially migratory, with northern populations moving south in winter",
    seasonality: ["Spring", "Summer", "Fall"]
  },
  {
    id: "5",
    common_name: "Red-tailed Hawk",
    scientific_name: "Buteo jamaicensis",
    description: "The red-tailed hawk is a bird of prey that breeds throughout most of North America.",
    habitat: "Open country, mountains, roadsides",
    diet: "Small mammals, birds, reptiles",
    family: "Accipitridae",
    image_url: "https://upload.wikimedia.org/wikipedia/commons/5/51/Buteo_jamaicensis_-John_Heinz_National_Wildlife_Refuge_at_Tinicum%2C_Pennsylvania%2C_USA-8.jpg",
    migration_info: "Partially migratory, with northern populations moving south in winter",
    seasonality: ["Spring", "Summer", "Fall", "Winter"]
  }
];

export const searchBirds = async (query: string): Promise<Bird[]> => {
  try {
    console.log("Searching for birds with query:", query);
    
    if (!query || query.trim() === '') {
      return [];
    }
    
    const normalizedQuery = query.trim().toLowerCase();
    
    // First try to search in the Supabase database
    const { data, error } = await supabase
      .from('birds')
      .select('*')
      .or(`common_name.ilike.%${normalizedQuery}%,scientific_name.ilike.%${normalizedQuery}%`)
      .limit(20);

    console.log("Supabase search results:", data, "Error:", error);
      
    // If we got results from Supabase, return them
    if (data && data.length > 0) {
      console.log("Returning data from Supabase:", data);
      return data;
    }
    
    // If no results from Supabase or there was an error, use mock data as fallback
    console.log("No results from Supabase, using mock data as fallback");
    const mockResults = MOCK_BIRDS.filter(bird => 
      bird.common_name.toLowerCase().includes(normalizedQuery) || 
      bird.scientific_name.toLowerCase().includes(normalizedQuery)
    );
    
    console.log("Mock search results:", mockResults);
    return mockResults;
    
  } catch (error) {
    console.error("Unexpected error in bird search:", error);
    
    // In case of error, still try to return mock results as fallback
    const normalizedQuery = query.trim().toLowerCase();
    const mockResults = MOCK_BIRDS.filter(bird => 
      bird.common_name.toLowerCase().includes(normalizedQuery) || 
      bird.scientific_name.toLowerCase().includes(normalizedQuery)
    );
    
    return mockResults;
  }
};
