
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    // Generate search context with OpenAI
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that helps generate relevant search terms and context for bird database queries.'
          },
          {
            role: 'user',
            content: `Generate relevant search terms for birds related to: ${query}. Include scientific names, habitats, and related species.`
          }
        ],
      }),
    });

    const openAIData = await openAIResponse.json();
    const enhancedSearchTerms = openAIData.choices[0].message.content;

    console.log("Enhanced search terms:", enhancedSearchTerms);

    // Use the supabase client to search through your database
    // Since we don't have a birds table yet, let's return mock data
    const mockBirds = [
      {
        id: '1',
        common_name: 'American Robin',
        scientific_name: 'Turdus migratorius',
        description: 'A migratory songbird of the true thrush genus and Turdidae family.',
        habitat: 'Woodlands, gardens, parks, yards',
        diet: 'Earthworms, insects, fruits',
        image_url: 'https://images.unsplash.com/photo-1596025148011-919193407609'
      },
      {
        id: '2',
        common_name: 'Blue Jay',
        scientific_name: 'Cyanocitta cristata',
        description: 'A passerine bird in the family Corvidae, native to eastern North America.',
        habitat: 'Forests, particularly with oaks, suburban areas',
        diet: 'Acorns, nuts, seeds, insects',
        image_url: 'https://images.unsplash.com/photo-1602523069147-73f5b96a4038'
      }
    ];
    
    // Filter based on the query
    const results = mockBirds.filter(bird => 
      bird.common_name.toLowerCase().includes(query.toLowerCase()) ||
      bird.scientific_name.toLowerCase().includes(query.toLowerCase()) ||
      bird.habitat.toLowerCase().includes(query.toLowerCase()) ||
      enhancedSearchTerms.toLowerCase().includes(bird.common_name.toLowerCase()) ||
      enhancedSearchTerms.toLowerCase().includes(bird.scientific_name.toLowerCase())
    );

    return new Response(
      JSON.stringify({
        results,
        context: enhancedSearchTerms,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
