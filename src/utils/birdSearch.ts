
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

export const searchBirds = async (query: string): Promise<Bird[]> => {
  try {
    console.log("Searching for birds with query:", query);
    
    if (!query || query.trim() === '') {
      return [];
    }
    
    // Search in both common_name and scientific_name for better results
    const { data, error } = await supabase
      .from('birds')
      .select('*')
      .or(`common_name.ilike.%${query}%,scientific_name.ilike.%${query}%`)
      .limit(20);

    if (error) {
      console.error("Error searching birds:", error);
      return [];
    }

    console.log("Bird search results:", data);
    return data || [];
  } catch (error) {
    console.error("Unexpected error in bird search:", error);
    return [];
  }
};
