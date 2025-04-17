
import { supabase } from "@/integrations/supabase/client";

// Bird data interface
export interface Bird {
  id: string;
  common_name: string;
  scientific_name: string;
  description: string;
  habitat: string;
  diet: string;
  image_url: string | null;
  family: string;
  migration_info: string | null;
}

// Mock bird data for the search functionality
const mockBirdData: Bird[] = [
  {
    id: "1",
    common_name: "American Robin",
    scientific_name: "Turdus migratorius",
    description: "A common North American bird with a reddish-orange breast and gray back.",
    habitat: "Woodlands, gardens, parks, and suburban areas",
    diet: "Insects, earthworms, and fruits",
    image_url: "https://upload.wikimedia.org/wikipedia/commons/b/b8/Turdus-migratorius-002.jpg",
    family: "Turdidae",
    migration_info: "Partial migrant, with northern populations moving south for winter"
  },
  {
    id: "2",
    common_name: "Blue Jay",
    scientific_name: "Cyanocitta cristata",
    description: "A vibrant blue bird with a noisy call and distinctive crest.",
    habitat: "Deciduous and coniferous forests, urban and suburban areas",
    diet: "Nuts, seeds, insects, and occasionally small vertebrates",
    image_url: "https://upload.wikimedia.org/wikipedia/commons/f/f4/Blue_jay_in_PP_%2830960%29.jpg",
    family: "Corvidae",
    migration_info: "Mostly non-migratory, though some northern populations may move south"
  },
  {
    id: "3",
    common_name: "Northern Cardinal",
    scientific_name: "Cardinalis cardinalis",
    description: "A striking red bird with a prominent crest and black face mask.",
    habitat: "Gardens, shrublands, forest edges, and urban areas",
    diet: "Seeds, fruits, insects, and berries",
    image_url: "https://upload.wikimedia.org/wikipedia/commons/d/da/Cardinal.jpg",
    family: "Cardinalidae",
    migration_info: "Non-migratory"
  },
  {
    id: "4",
    common_name: "Great Blue Heron",
    scientific_name: "Ardea herodias",
    description: "A large wading bird with blue-gray plumage and a long neck.",
    habitat: "Wetlands, marshes, lakes, and coastal areas",
    diet: "Fish, amphibians, reptiles, small mammals, and birds",
    image_url: "https://upload.wikimedia.org/wikipedia/commons/6/67/GBHfish5.jpg",
    family: "Ardeidae",
    migration_info: "Partial migrant, with northern populations moving south for winter"
  },
  {
    id: "5",
    common_name: "Red-tailed Hawk",
    scientific_name: "Buteo jamaicensis",
    description: "A large raptor with a characteristic rusty-red tail.",
    habitat: "Open country, mountains, and roadsides",
    diet: "Small mammals, birds, and reptiles",
    image_url: "https://upload.wikimedia.org/wikipedia/commons/5/51/RT_Hawk.jpg",
    family: "Accipitridae",
    migration_info: "Partial migrant, with northern populations moving south for winter"
  }
];

// Add more mock bird data to reach 20+ entries
const additionalBirds: Partial<Bird>[] = [
  {
    id: "6",
    common_name: "Barn Swallow",
    scientific_name: "Hirundo rustica",
    description: "A small bird with a deeply forked tail and blue upperparts.",
    habitat: "Open areas near water and human structures",
    diet: "Flying insects",
    image_url: "https://upload.wikimedia.org/wikipedia/commons/f/f8/Barn_Swallow_%28Hirundo_rustica%29_%2826246036206%29.jpg",
    family: "Hirundinidae",
    migration_info: "Long-distance migrant, wintering in Central and South America, Africa, and South Asia"
  },
  {
    id: "7",
    common_name: "Bald Eagle",
    scientific_name: "Haliaeetus leucocephalus",
    description: "A large bird of prey with a distinctive white head and tail.",
    habitat: "Lakes, rivers, marshes, and coasts",
    diet: "Fish, waterfowl, and carrion",
    image_url: "https://upload.wikimedia.org/wikipedia/commons/1/1a/About_to_Launch_%2826075320352%29.jpg",
    family: "Accipitridae",
    migration_info: "Partial migrant, with some northern populations moving south for winter"
  },
  // More birds would be added here
];

// Combine the bird data
const allBirds: Bird[] = [...mockBirdData, ...(additionalBirds as Bird[])];

export const searchBirds = async (query: string): Promise<Bird[]> => {
  try {
    // In a real app, this would be a call to your Supabase function or database
    // For now, we'll just filter the mock data
    const lowerQuery = query.toLowerCase();
    
    const results = allBirds.filter(bird => 
      bird.common_name.toLowerCase().includes(lowerQuery) ||
      bird.scientific_name.toLowerCase().includes(lowerQuery) ||
      bird.description.toLowerCase().includes(lowerQuery) ||
      bird.habitat.toLowerCase().includes(lowerQuery) ||
      bird.family.toLowerCase().includes(lowerQuery)
    );
    
    return results;
  } catch (error) {
    console.error("Error searching birds:", error);
    return [];
  }
};
