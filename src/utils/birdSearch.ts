
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

// Simplified search that will work with mock data
export const searchBirds = async (query: string): Promise<Bird[]> => {
  try {
    console.log("Searching for birds with query:", query);
    
    // Use simpler query without complex conditions
    const { data, error } = await supabase
      .from('birds')
      .select('*')
      .ilike('common_name', `%${query}%`)
      .order('common_name');

    if (error) {
      console.error("Error searching birds:", error);
      throw error;
    }

    // If no results from common name, try scientific name
    if (!data || data.length === 0) {
      const { data: scientificData, error: scientificError } = await supabase
        .from('birds')
        .select('*')
        .ilike('scientific_name', `%${query}%`)
        .order('scientific_name');
      
      if (scientificError) {
        console.error("Error searching birds by scientific name:", scientificError);
        return [];
      }
      
      return scientificData || [];
    }

    console.log("Bird search results:", data);
    return data || [];
  } catch (error) {
    console.error("Unexpected error in bird search:", error);
    return [];
  }
};
