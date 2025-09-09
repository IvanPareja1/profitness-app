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

    const url = new URL(req.url);
    const method = req.method;

    // GET /meals - Obtener comidas del usuario
    if (method === 'GET' && url.pathname === '/meals') {
      const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabaseClient
        .from('meals')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', `${date}T00:00:00.000Z`)
        .lt('created_at', `${date}T23:59:59.999Z`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Calcular totales
      const totals = data.reduce((acc, meal) => ({
        calories: acc.calories + (meal.calories || 0),
        carbs: acc.carbs + (meal.carbs || 0),
        protein: acc.protein + (meal.protein || 0),
        fat: acc.fat + (meal.fat || 0),
      }), { calories: 0, carbs: 0, protein: 0, fat: 0 });

      return new Response(
        JSON.stringify({ meals: data, totals }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /meals - Agregar nueva comida
    if (method === 'POST' && url.pathname === '/meals') {
      const body = await req.json();
      
      const { data, error } = await supabaseClient
        .from('meals')
        .insert({
          user_id: user.id,
          name: body.name,
          calories: body.calories,
          carbs: body.carbs || 0,
          protein: body.protein || 0,
          fat: body.fat || 0,
          quantity: body.quantity || 1,
          unit: body.unit || 'porción',
          meal_type: body.meal_type || 'snack',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ meal: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // DELETE /meals/:id - Eliminar comida
    if (method === 'DELETE' && url.pathname.startsWith('/meals/')) {
      const mealId = url.pathname.split('/')[2];
      
      const { error } = await supabaseClient
        .from('meals')
        .delete()
        .eq('id', mealId)
        .eq('user_id', user.id);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /meals/search - Buscar alimentos en base de datos
    if (method === 'POST' && url.pathname === '/meals/search') {
      const { query } = await req.json();
      
      // Base de datos de alimentos ampliada
      const foodDatabase = [
        { name: 'Manzana', calories: 52, carbs: 14, protein: 0.3, fat: 0.2, per: '100g' },
        { name: 'Plátano', calories: 89, carbs: 23, protein: 1.1, fat: 0.3, per: '100g' },
        { name: 'Pollo a la plancha', calories: 165, carbs: 0, protein: 31, fat: 3.6, per: '100g' },
        { name: 'Arroz blanco', calories: 130, carbs: 28, protein: 2.7, fat: 0.3, per: '100g' },
        { name: 'Arroz integral', calories: 111, carbs: 23, protein: 2.6, fat: 0.9, per: '100g' },
        { name: 'Huevo cocido', calories: 155, carbs: 1.1, protein: 13, fat: 11, per: '100g' },
        { name: 'Avena', calories: 389, carbs: 66, protein: 17, fat: 7, per: '100g' },
        { name: 'Salmón', calories: 208, carbs: 0, protein: 20, fat: 13, per: '100g' },
        { name: 'Brócoli', calories: 34, carbs: 7, protein: 3, fat: 0.4, per: '100g' },
        { name: 'Yogur griego', calories: 59, carbs: 4, protein: 10, fat: 0.4, per: '100g' },
        { name: 'Almendras', calories: 579, carbs: 22, protein: 21, fat: 50, per: '100g' },
        { name: 'Pasta integral', calories: 124, carbs: 23, protein: 5, fat: 1.1, per: '100g' },
        { name: 'Quinoa', calories: 120, carbs: 22, protein: 4.4, fat: 1.9, per: '100g' },
        { name: 'Pechuga de pavo', calories: 135, carbs: 0, protein: 30, fat: 1, per: '100g' },
        { name: 'Atún en agua', calories: 116, carbs: 0, protein: 26, fat: 1, per: '100g' },
        { name: 'Lentejas', calories: 116, carbs: 20, protein: 9, fat: 0.4, per: '100g' },
        { name: 'Espinacas', calories: 23, carbs: 3.6, protein: 2.9, fat: 0.4, per: '100g' },
        { name: 'Tomate', calories: 18, carbs: 3.9, protein: 0.9, fat: 0.2, per: '100g' },
        { name: 'Aguacate', calories: 160, carbs: 9, protein: 2, fat: 15, per: '100g' },
        { name: 'Pan integral', calories: 247, carbs: 41, protein: 13, fat: 4, per: '100g' },
        { name: 'Leche descremada', calories: 34, carbs: 5, protein: 3.4, fat: 0.1, per: '100ml' },
        { name: 'Queso cottage', calories: 98, carbs: 3.4, protein: 11, fat: 4.3, per: '100g' },
      ];

      const results = foodDatabase.filter(food => 
        food.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10);

      return new Response(
        JSON.stringify({ results }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /meals/barcode - Buscar producto por código de barras
    if (method === 'POST' && url.pathname === '/meals/barcode') {
      const { barcode } = await req.json();
      
      // Base de datos de productos con códigos de barras
      const productDatabase = [
        { 
          barcode: '7501000123456', 
          name: 'Yogur Natural Danone 150g', 
          calories: 89, 
          carbs: 12, 
          protein: 5, 
          fat: 3.2,
          brand: 'Danone',
          category: 'Lácteos'
        },
        { 
          barcode: '7501000234567', 
          name: 'Leche Descremada Lala 1L', 
          calories: 35, 
          carbs: 5, 
          protein: 3.5, 
          fat: 0.1,
          brand: 'Lala',
          category: 'Lácteos'
        },
        { 
          barcode: '7501000345678', 
          name: 'Cereal Fitness Nestlé 300g', 
          calories: 375, 
          carbs: 75, 
          protein: 8, 
          fat: 3,
          brand: 'Nestlé',
          category: 'Cereales'
        },
        { 
          barcode: '7501000456789', 
          name: 'Atún en Agua Herdez 140g', 
          calories: 116, 
          carbs: 0, 
          protein: 26, 
          fat: 1,
          brand: 'Herdez',
          category: 'Conservas'
        },
        { 
          barcode: '7501000567890', 
          name: 'Pan Integral Bimbo 680g', 
          calories: 250, 
          carbs: 42, 
          protein: 12, 
          fat: 4.5,
          brand: 'Bimbo',
          category: 'Panadería'
        },
        { 
          barcode: '7501000678901', 
          name: 'Pasta Integral Barilla 500g', 
          calories: 350, 
          carbs: 70, 
          protein: 12, 
          fat: 2.5,
          brand: 'Barilla',
          category: 'Pasta'
        },
        { 
          barcode: '7501000789012', 
          name: 'Quinoa Real Orgánica 500g', 
          calories: 368, 
          carbs: 64, 
          protein: 14, 
          fat: 6,
          brand: 'Real',
          category: 'Granos'
        },
        { 
          barcode: '7501000890123', 
          name: 'Almendras Natural Great Value 200g', 
          calories: 579, 
          carbs: 22, 
          protein: 21, 
          fat: 50,
          brand: 'Great Value',
          category: 'Frutos secos'
        },
        { 
          barcode: '7501000901234', 
          name: 'Aceite de Oliva Extra Virgen Capullo 500ml', 
          calories: 884, 
          carbs: 0, 
          protein: 0, 
          fat: 100,
          brand: 'Capullo',
          category: 'Aceites'
        },
        { 
          barcode: '7501001012345', 
          name: 'Miel de Abeja Pura Carlota 300g', 
          calories: 304, 
          carbs: 82, 
          protein: 0.3, 
          fat: 0,
          brand: 'Carlota',
          category: 'Endulzantes'
        }
      ];

      // Buscar producto por código de barras
      const product = productDatabase.find(p => p.barcode === barcode);

      if (product) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            product: {
              ...product,
              per: '100g'
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        // Si no se encuentra, devolver producto genérico
        return new Response(
          JSON.stringify({ 
            success: false, 
            product: {
              barcode,
              name: 'Producto no encontrado',
              calories: 0,
              carbs: 0,
              protein: 0,
              fat: 0,
              brand: 'Desconocido',
              category: 'Sin categoría',
              per: '100g'
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});