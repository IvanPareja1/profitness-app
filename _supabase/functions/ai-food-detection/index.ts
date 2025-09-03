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
    const { image, apiKey } = await req.json()
    
    if (!image || !apiKey) {
      throw new Error('Imagen y API key requeridas')
    }

    // Llamar a la API de OpenAI GPT-4 Vision
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analiza esta imagen de comida y proporciona la información nutricional en el siguiente formato JSON exacto. Identifica todos los alimentos visibles y estima las porciones:

{
  "name": "Plato detectado por IA",
  "items": [
    {
      "name": "nombre del alimento",
      "confidence": 0.95,
      "calories": 120,
      "protein": 8,
      "carbs": 15,
      "fat": 3
    }
  ],
  "totalCalories": 340,
  "protein": 25,
  "carbs": 45,
  "fat": 12
}

Reglas importantes:
- Identifica cada alimento por separado
- Confidence entre 0.7 y 1.0
- Valores nutricionales por porción visible
- Sé preciso con las estimaciones
- Si no puedes identificar claramente, indica confidence menor
- Responde SOLO con el JSON, sin texto adicional`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${image}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      })
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json()
      console.error('OpenAI API error:', errorData)
      throw new Error(`Error de OpenAI: ${errorData.error?.message || 'Error desconocido'}`)
    }

    const openaiData = await openaiResponse.json()
    const content = openaiData.choices[0]?.message?.content

    if (!content) {
      throw new Error('No se recibió respuesta de OpenAI')
    }

    // Parsear la respuesta JSON
    let analysisResult
    try {
      // Limpiar la respuesta por si tiene texto adicional
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      const jsonString = jsonMatch ? jsonMatch[0] : content
      analysisResult = JSON.parse(jsonString)
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', content)
      throw new Error('Error al procesar la respuesta de IA')
    }

    // Validar que la estructura sea correcta
    if (!analysisResult.items || !Array.isArray(analysisResult.items)) {
      throw new Error('Respuesta de IA inválida')
    }

    // Calcular totales si no están presentes
    if (!analysisResult.totalCalories) {
      analysisResult.totalCalories = analysisResult.items.reduce((sum, item) => sum + (item.calories || 0), 0)
    }
    if (!analysisResult.protein) {
      analysisResult.protein = analysisResult.items.reduce((sum, item) => sum + (item.protein || 0), 0)
    }
    if (!analysisResult.carbs) {
      analysisResult.carbs = analysisResult.items.reduce((sum, item) => sum + (item.carbs || 0), 0)
    }
    if (!analysisResult.fat) {
      analysisResult.fat = analysisResult.items.reduce((sum, item) => sum + (item.fat || 0), 0)
    }

    // Redondear valores
    analysisResult.totalCalories = Math.round(analysisResult.totalCalories)
    analysisResult.protein = Math.round(analysisResult.protein)
    analysisResult.carbs = Math.round(analysisResult.carbs)
    analysisResult.fat = Math.round(analysisResult.fat)

    analysisResult.items = analysisResult.items.map(item => ({
      ...item,
      calories: Math.round(item.calories || 0),
      protein: Math.round(item.protein || 0),
      carbs: Math.round(item.carbs || 0),
      fat: Math.round(item.fat || 0),
      confidence: Math.round((item.confidence || 0.8) * 100) / 100
    }))

    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error en AI food detection:', error)
    
    return new Response(
      JSON.stringify({ 
        error: true,
        message: error.message || 'Error al procesar la imagen con IA',
        name: 'Error de procesamiento',
        items: [],
        totalCalories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})