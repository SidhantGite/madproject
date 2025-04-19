
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

export const searchBirds = async (
  query: string, 
  filters: {
    season?: string;
    family?: string;
    habitat?: string;
  } = {}
): Promise<Bird[]> => {
  try {
    // Base query to fetch birds
    let birdQuery = supabase
      .from('birds')
      .select('*')
      // Case-insensitive partial match across multiple fields
      .or(
        `common_name.ilike.%${query}%,` +
        `scientific_name.ilike.%${query}%,` +
        `description.ilike.%${query}%,` +
        `habitat.ilike.%${query}%,` +
        `family.ilike.%${query}%`
      );

    // Apply season filter if provided
    if (filters.season) {
      birdQuery = birdQuery.contains('seasonality', [filters.season]);
    }

    // Apply family filter if provided
    if (filters.family) {
      birdQuery = birdQuery.eq('family', filters.family);
    }

    // Apply habitat filter if provided
    if (filters.habitat) {
      birdQuery = birdQuery.ilike('habitat', `%${filters.habitat}%`);
    }

    const { data, error } = await birdQuery;

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

// Function to get unique families and habitats for filtering
export const getBirdFilterOptions = async () => {
  try {
    // Fetch unique families
    const { data: familyData, error: familyError } = await supabase
      .from('birds')
      .select('family', { count: 'exact' })
      .filter('family', 'not.is', null)
      .distinct();

    // Fetch unique habitats
    const { data: habitatData, error: habitatError } = await supabase
      .from('birds')
      .select('habitat', { count: 'exact' })
      .filter('habitat', 'not.is', null)
      .distinct();

    if (familyError || habitatError) {
      console.error("Error fetching filter options:", familyError || habitatError);
      return { families: [], habitats: [] };
    }

    return {
      families: familyData?.map(f => f.family) || [],
      habitats: habitatData?.map(h => h.habitat) || []
    };
  } catch (error) {
    console.error("Unexpected error in getting filter options:", error);
    return { families: [], habitats: [] };
  }
};

