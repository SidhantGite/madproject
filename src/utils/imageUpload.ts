
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

export const uploadImage = async (file: File): Promise<string | null> => {
  try {
    if (!file) return null;

    // Create a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload the file to Supabase storage
    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    if (error) throw error;

    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
};
