import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { barcode } = await req.json();

    // Función para buscar en Open Food Facts
    const searchOpenFoodFacts = async (barcode: string) => {
      try {
        const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
        const data = await response.json();
        
        if (data.status === 1 && data.product) {
          const product = data.product;
          
          // Extraer información nutricional
          const nutriments = product.nutriments || {};
          
          return {
            success: true,
            product: {
              barcode,
              name: product.product_name || product.product_name_es || 'Producto sin nombre',
              calories: Math.round(nutriments.energy_kcal_100g || nutriments['energy-kcal_100g'] || 0),
              carbs: Math.round((nutriments.carbohydrates_100g || nutriments['carbohydrates_100g'] || 0) * 10) / 10,
              protein: Math.round((nutriments.proteins_100g || nutriments['proteins_100g'] || 0) * 10) / 10,
              fat: Math.round((nutriments.fat_100g || nutriments['fat_100g'] || 0) * 10) / 10,
              fiber: Math.round((nutriments.fiber_100g || nutriments['fiber_100g'] || 0) * 10) / 10,
              sodium: Math.round((nutriments.sodium_100g || nutriments['sodium_100g'] || 0) * 1000) / 1000,
              sugar: Math.round((nutriments.sugars_100g || nutriments['sugars_100g'] || 0) * 10) / 10,
              brand: product.brands || 'Marca desconocida',
              category: product.categories_tags?.[0]?.replace('en:', '') || 'Sin categoría',
              image_url: product.image_front_url || product.image_url,
              ingredients: product.ingredients_text || product.ingredients_text_es,
              per: '100g',
              source: 'openfoodfacts'
            }
          };
        }
        
        return { success: false, error: 'Producto no encontrado en Open Food Facts' };
      } catch (error) {
        console.error('Error fetching from Open Food Facts:', error);
        return { success: false, error: 'Error al consultar Open Food Facts' };
      }
    };

    // Base de datos local de respaldo
    const localProductDatabase = [
      { 
        barcode: '7501000123456', 
        name: 'Yogur Natural Danone 150g', 
        calories: 89, 
        carbs: 12, 
        protein: 5, 
        fat: 3.2,
        brand: 'Danone',
        category: 'Lácteos',
        source: 'local'
      },
      { 
        barcode: '7501000234567', 
        name: 'Leche Descremada Lala 1L', 
        calories: 35, 
        carbs: 5, 
        protein: 3.5, 
        fat: 0.1,
        brand: 'Lala',
        category: 'Lácteos',
        source: 'local'
      },
      { 
        barcode: '7501000345678', 
        name: 'Cereal Fitness Nestlé 300g', 
        calories: 375, 
        carbs: 75, 
        protein: 8, 
        fat: 3,
        brand: 'Nestlé',
        category: 'Cereales',
        source: 'local'
      },
      { 
        barcode: '7501000456789', 
        name: 'Atún en Agua Herdez 140g', 
        calories: 116, 
        carbs: 0, 
        protein: 26, 
        fat: 1,
        brand: 'Herdez',
        category: 'Conservas',
        source: 'local'
      },
      { 
        barcode: '7501000567890', 
        name: 'Pan Integral Bimbo 680g', 
        calories: 250, 
        carbs: 42, 
        protein: 12, 
        fat: 4.5,
        brand: 'Bimbo',
        category: 'Panadería',
        source: 'local'
      },
      { 
        barcode: '7501000678901', 
        name: 'Pasta Integral Barilla 500g', 
        calories: 350, 
        carbs: 70, 
        protein: 12, 
        fat: 2.5,
        brand: 'Barilla',
        category: 'Pasta',
        source: 'local'
      },
      { 
        barcode: '7501000789012', 
        name: 'Quinoa Real Orgánica 500g', 
        calories: 368, 
        carbs: 64, 
        protein: 14, 
        fat: 6,
        brand: 'Real',
        category: 'Granos',
        source: 'local'
      },
      { 
        barcode: '7501000890123', 
        name: 'Almendras Natural Great Value 200g', 
        calories: 579, 
        carbs: 22, 
        protein: 21, 
        fat: 50,
        brand: 'Great Value',
        category: 'Frutos secos',
        source: 'local'
      },
      { 
        barcode: '7501000901234', 
        name: 'Aceite de Oliva Extra Virgen Capullo 500ml', 
        calories: 884, 
        carbs: 0, 
        protein: 0, 
        fat: 100,
        brand: 'Capullo',
        category: 'Aceites',
        source: 'local'
      },
      { 
        barcode: '7501001012345', 
        name: 'Miel de Abeja Pura Carlota 300g', 
        calories: 304, 
        carbs: 82, 
        protein: 0.3, 
        fat: 0,
        brand: 'Carlota',
        category: 'Endulzantes',
        source: 'local'
      },
      // Productos mexicanos adicionales
      { 
        barcode: '7502000123456', 
        name: 'Tortillas de Maíz Maseca 1kg', 
        calories: 218, 
        carbs: 45, 
        protein: 6, 
        fat: 2.9,
        brand: 'Maseca',
        category: 'Tortillas',
        source: 'local'
      },
      { 
        barcode: '7503000123456', 
        name: 'Frijoles Negros La Costeña 560g', 
        calories: 91, 
        carbs: 16, 
        protein: 6, 
        fat: 0.5,
        brand: 'La Costeña',
        category: 'Legumbres',
        source: 'local'
      }
    ];

    // Buscar primero en base de datos local
    const localProduct = localProductDatabase.find(p => p.barcode === barcode);
    
    if (localProduct) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          product: {
            ...localProduct,
            per: '100g'
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Si no se encuentra localmente, buscar en Open Food Facts
    console.log(`Searching barcode ${barcode} in Open Food Facts...`);
    const openFoodResult = await searchOpenFoodFacts(barcode);
    
    if (openFoodResult.success) {
      // Opcional: Guardar en base de datos local para futuras consultas
      try {
        await supabaseClient
          .from('scanned_products')
          .upsert({
            barcode,
            product_data: openFoodResult.product,
            user_id: user.id,
            created_at: new Date().toISOString()
          });
      } catch (error) {
        console.error('Error saving to local cache:', error);
      }

      return new Response(
        JSON.stringify(openFoodResult),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Si no se encuentra en ningún lado, devolver error
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Producto no encontrado',
        message: 'No se pudo encontrar información nutricional para este código de barras'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in barcode lookup:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        message: 'Error interno del servidor'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});