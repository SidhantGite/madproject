
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
    // Base query to fetch birds with case-insensitive partial match
    const { data, error } = await supabase
      .from('birds')
      .select('*')
      .or(
        `common_name.ilike.%${query}%,` +
        `scientific_name.ilike.%${query}%,` +
        `description.ilike.%${query}%,` +
        `habitat.ilike.%${query}%,` +
        `family.ilike.%${query}%`
      );

    if (error) {
      console.error("Error searching birds:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error in bird search:", error);
    return [];
  }
};
