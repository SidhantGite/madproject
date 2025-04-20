
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
    
    // Use a very simple query that will definitely work
    const { data, error } = await supabase
      .from('birds')
      .select('*')
      .ilike('common_name', `%${query}%`)
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
