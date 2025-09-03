import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { barcode } = await req.json()
    
    if (!barcode) {
      throw new Error('Código de barras requerido')
    }

    // Consultar OpenFoodFacts API
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)
    
    if (!response.ok) {
      throw new Error('Error al consultar OpenFoodFacts')
    }

    const data = await response.json()

    if (data.status === 0) {
      return new Response(
        JSON.stringify({ 
          error: true,
          message: 'Producto no encontrado en la base de datos',
          barcode 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const product = data.product
    
    // Extraer información nutricional
    const nutriments = product.nutriments || {}
    const serving100g = nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0
    
    const productData = {
      name: product.product_name || product.product_name_es || product.product_name_en || 'Producto desconocido',
      brand: product.brands || '',
      calories: Math.round(serving100g),
      protein: Math.round((nutriments['proteins_100g'] || nutriments['proteins'] || 0)),
      carbs: Math.round((nutriments['carbohydrates_100g'] || nutriments['carbohydrates'] || 0)),
      fat: Math.round((nutriments['fat_100g'] || nutriments['fat'] || 0)),
      fiber: Math.round((nutriments['fiber_100g'] || nutriments['fiber'] || 0)),
      sugar: Math.round((nutriments['sugars_100g'] || nutriments['sugars'] || 0)),
      sodium: parseFloat((nutriments['sodium_100g'] || nutriments['sodium'] || 0).toFixed(2)),
      barcode: barcode,
      image_url: product.image_url || product.image_front_url || null,
      ingredients: product.ingredients_text || product.ingredients_text_es || product.ingredients_text_en || '',
      serving_size: '100g',
      categories: product.categories || '',
      error: false
    }

    return new Response(
      JSON.stringify(productData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error en OpenFoodFacts lookup:', error)
    
    return new Response(
      JSON.stringify({ 
        error: true,
        message: error.message || 'Error al procesar la solicitud'
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})