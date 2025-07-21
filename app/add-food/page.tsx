
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useNutritionData } from '../../hooks/useNutritionData';

// Tipo para los valores nutricionales
type NutritionInfo = {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

// Tipo para los alimentos
type Food = {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  serving?: string;
};

// Base de datos de alimentos con sus valores nutricionales por 100g
const foodDatabase: Record<string, NutritionInfo> = {
  // Carnes y pescados
  'pollo': { calories: 165, protein: 31, carbs: 0, fats: 3.6 },
  'pechuga de pollo': { calories: 165, protein: 31, carbs: 0, fats: 3.6 },
  'pollo a la plancha': { calories: 165, protein: 31, carbs: 0, fats: 3.6 },
  'salmón': { calories: 208, protein: 20, carbs: 0, fats: 13 },
  'atún': { calories: 144, protein: 30, carbs: 0, fats: 1 },
  'carne de res': { calories: 250, protein: 26, carbs: 0, fats: 15 },
  'cerdo': { calories: 242, protein: 27, carbs: 0, fats: 14 },
  'pescado': { calories: 150, protein: 25, carbs: 0, fats: 5 },

  // Huevos y lácteos
  'huevo': { calories: 155, protein: 13, carbs: 1.1, fats: 11 },
  'huevos': { calories: 155, protein: 13, carbs: 1.1, fats: 11 },
  'leche': { calories: 42, protein: 3.4, carbs: 5, fats: 1 },
  'yogurt': { calories: 59, protein: 10, carbs: 3.6, fats: 0.4 },
  'queso': { calories: 113, protein: 25, carbs: 4, fats: 0.3 },
  'mantequilla': { calories: 717, protein: 0.9, carbs: 0.1, fats: 81 },

  // Cereales y granos
  'arroz': { calories: 130, protein: 2.7, carbs: 28, fats: 0.3 },
  'arroz blanco': { calories: 130, protein: 2.7, carbs: 28, fats: 0.3 },
  'arroz integral': { calories: 111, protein: 2.6, carbs: 23, fats: 0.9 },
  'avena': { calories: 68, protein: 2.4, carbs: 12, fats: 1.4 },
  'quinoa': { calories: 120, protein: 4.4, carbs: 22, fats: 1.9 },
  'pan': { calories: 265, protein: 9, carbs: 49, fats: 3.2 },
  'pasta': { calories: 131, protein: 5, carbs: 25, fats: 1.1 },
  'trigo': { calories: 340, protein: 13, carbs: 72, fats: 2.5 },

  // Frutas
  'plátano': { calories: 89, protein: 1.1, carbs: 23, fats: 0.3 },
  'banana': { calories: 89, protein: 1.1, carbs: 23, fats: 0.3 },
  'manzana': { calories: 52, protein: 0.3, carbs: 14, fats: 0.2 },
  'naranja': { calories: 47, protein: 0.9, carbs: 12, fats: 0.1 },
  'fresa': { calories: 32, protein: 0.7, carbs: 8, fats: 0.3 },
  'fresas': { calories: 32, protein: 0.7, carbs: 8, fats: 0.3 },
  'uva': { calories: 62, protein: 0.6, carbs: 16, fats: 0.2 },
  'uvas': { calories: 62, protein: 0.6, carbs: 16, fats: 0.2 },
  'pera': { calories: 57, protein: 0.4, carbs: 15, fats: 0.1 },
  'durazno': { calories: 39, protein: 0.9, carbs: 10, fats: 0.3 },
  'sandía': { calories: 30, protein: 0.6, carbs: 8, fats: 0.2 },

  // Verduras
  'brócoli': { calories: 34, protein: 2.8, carbs: 7, fats: 0.4 },
  'espinaca': { calories: 23, protein: 2.9, carbs: 3.6, fats: 0.4 },
  'zanahoria': { calories: 41, protein: 0.9, carbs: 10, fats: 0.2 },
  'tomate': { calories: 18, protein: 0.9, carbs: 3.9, fats: 0.2 },
  'lechuga': { calories: 15, protein: 1.4, carbs: 2.9, fats: 0.2 },
  'cebolla': { calories: 40, protein: 1.1, carbs: 9.3, fats: 0.1 },
  'papa': { calories: 77, protein: 2, carbs: 17, fats: 0.1 },
  'papas': { calories: 77, protein: 2, carbs: 17, fats: 0.1 },
  'patata': { calories: 77, protein: 2, carbs: 17, fats: 0.1 },

  // Frutos secos y aceites
  'aguacate': { calories: 160, protein: 2, carbs: 9, fats: 15 },
  'almendra': { calories: 579, protein: 21, carbs: 22, fats: 50 },
  'almendras': { calories: 579, protein: 21, carbs: 22, fats: 50 },
  'nuez': { calories: 654, protein: 15, carbs: 14, fats: 65 },
  'nueces': { calories: 654, protein: 15, carbs: 14, fats: 65 },
  'aceite de oliva': { calories: 884, protein: 0, carbs: 0, fats: 100 },
  'aceite': { calories: 884, protein: 0, carbs: 0, fats: 100 },

  // Legumbres
  'frijoles': { calories: 127, protein: 9, carbs: 23, fats: 0.5 },
  'lentejas': { calories: 116, protein: 9, carbs: 20, fats: 0.4 },
  'garbanzos': { calories: 164, protein: 8, carbs: 27, fats: 2.6 },
  'soja': { calories: 173, protein: 18, carbs: 9, fats: 9 }
};

export default function AddFood() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMeal, setSelectedMeal] = useState('breakfast');
  const [showCreateFood, setShowCreateFood] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [newFood, setNewFood] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    serving: '',
    quantity: ''
  });

  // Usar el hook de nutrición
  const { addFood } = useNutritionData();

  // Función para buscar alimento en la base de datos
  const findFoodInDatabase = (foodName: string): NutritionInfo | null => {
    const normalizedName = foodName.toLowerCase().trim();

    // Busqueda exacta
    if (foodDatabase[normalizedName]) {
      return foodDatabase[normalizedName];
    }

    // Busqueda parcial
    for (const [key, value] of Object.entries(foodDatabase)) {
      if (key.includes(normalizedName) || normalizedName.includes(key)) {
        return value;
      }
    }

    return null;
  };

  // Función para calcular macronutrientes basado en cantidad
  const calculateMacros = (baseNutrition: NutritionInfo, quantity: string, unit: string): NutritionInfo | null => {
    if (!baseNutrition || !quantity) return null;

    let multiplier = 1;
    const qty = parseFloat(quantity);

    if (!qty || qty <= 0) return null;

    // Convertir diferentes unidades a gramos (base de datos está en por 100g)
    switch (unit.toLowerCase()) {
      case 'g':
      case 'gramos':
        multiplier = qty / 100;
        break;
      case 'kg':
      case 'kilos':
        multiplier = qty * 10;
        break;
      case 'taza':
      case 'tazas':
        multiplier = qty * 2; // Aproximadamente 200g por taza
        break;
      case 'cucharada':
      case 'cucharadas':
        multiplier = qty * 0.15; // Aproximadamente 15g por cucharada
        break;
      case 'unidad':
      case 'unidades':
      case 'pieza':
      case 'piezas':
        // Estimaciones promedio por unidad
        const foodName = newFood.name.toLowerCase();
        if (foodName.includes('huevo')) {
          multiplier = qty * 0.5; // 50g por huevo
        } else if (foodName.includes('plátano') || foodName.includes('banana')) {
          multiplier = qty * 1.2; // 120g por plátano
        } else if (foodName.includes('manzana')) {
          multiplier = qty * 1.8; // 180g por manzana
        } else {
          multiplier = qty * 1; // Por defecto 100g por unidad
        }
        break;
      default:
        multiplier = qty / 100; // Por defecto asumir gramos
    }

    return {
      calories: Math.round(baseNutrition.calories * multiplier),
      protein: Math.round(baseNutrition.protein * multiplier * 10) / 10,
      carbs: Math.round(baseNutrition.carbs * multiplier * 10) / 10,
      fats: Math.round(baseNutrition.fats * multiplier * 10) / 10
    }
  };

  // Efecto para auto-completar macronutrientes
  useEffect(() => {
    if (newFood.name && newFood.quantity) {
      const foundFood = findFoodInDatabase(newFood.name);
      if (foundFood) {
        // Extraer cantidad y unidad del campo quantity
        const servingParts = newFood.quantity.split(' ');
        const quantity = servingParts[0];
        const unit = servingParts.slice(1).join(' ') || 'g';

        const calculatedMacros = calculateMacros(foundFood, quantity, unit);
        if (calculatedMacros) {
          setNewFood(prev => ({
            ...prev,
            calories: calculatedMacros.calories.toString(),
            protein: calculatedMacros.protein.toString(),
            carbs: calculatedMacros.carbs.toString(),
            fats: calculatedMacros.fats.toString()
          }));
        }
      }
    }
  }, [newFood.name, newFood.quantity]);

  const [recentFoods, setRecentFoods] = useState<Food[]>([
    { name: 'Pollo a la plancha', calories: 165, protein: 31, carbs: 0, fats: 3.6 },
    { name: 'Arroz blanco', calories: 130, protein: 2.7, carbs: 28, fats: 0.3 },
    { name: 'Aguacate', calories: 160, protein: 2, carbs: 9, fats: 15 },
    { name: 'Plátano', calories: 89, protein: 1.1, carbs: 23, fats: 0.3 }
  ]);

  const popularFoods: Food[] = [
    { name: 'Huevos revueltos', calories: 155, protein: 13, carbs: 1.1, fats: 11 },
    { name: 'Avena', calories: 68, protein: 2.4, carbs: 12, fats: 1.4 },
    { name: 'Pechuga de pollo', calories: 231, protein: 43.5, carbs: 0, fats: 5 },
    { name: 'Salmón', calories: 208, protein: 20, carbs: 0, fats: 13 }
  ];

  const mealTypes = [
    { id: 'breakfast', name: 'Desayuno', icon: 'ri-sun-line' },
    { id: 'lunch', name: 'Almuerzo', icon: 'ri-sun-fill' },
    { id: 'dinner', name: 'Cena', icon: 'ri-moon-line' },
    { id: 'snack', name: 'Snack', icon: 'ri-apple-line' }
  ];

  const handleCreateFood = (): void => {
    if (newFood.name && newFood.calories) {
      const foodToAdd: Food = {
        name: newFood.name,
        calories: parseFloat(newFood.calories) || 0,
        protein: parseFloat(newFood.protein) || 0,
        carbs: parseFloat(newFood.carbs) || 0,
        fats: parseFloat(newFood.fats) || 0,
        serving: newFood.serving || newFood.quantity || '1 porción'
      };

      // Agregar a la lista de alimentos recientes
      setRecentFoods(prev => [foodToAdd, ...prev]);

      // Agregar a los datos nutricionales diarios
      addFood({
        name: foodToAdd.name,
        mealType: selectedMeal as 'breakfast' | 'lunch' | 'dinner' | 'snack',
        calories: foodToAdd.calories,
        protein: foodToAdd.protein,
        carbs: foodToAdd.carbs,
        fats: foodToAdd.fats
      });

      // Limpiar el formulario
      setNewFood({
        name: '',
        calories: '',
        protein: '',
        carbs: '',
        fats: '',
        serving: '',
        quantity: ''
      });

      setShowCreateFood(false);

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const addFoodToMeal = (food: Food): void => {
    console.log(`Agregando ${food.name} a ${selectedMeal}`);

    // Agregar el alimento a los datos nutricionales
    addFood({
      name: food.name,
      mealType: selectedMeal as 'breakfast' | 'lunch' | 'dinner' | 'snack',
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fats: food.fats
    });

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleInputChange = (field: string, value: string): void => {
    setNewFood(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)'
    }}>
      {showSuccess && (
        <div style={{
          position: 'fixed',
          top: '80px',
          left: '16px',
          right: '16px',
          backgroundColor: '#10b981',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center'
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '12px'
          }}>
            <i className="ri-check-line" style={{ fontSize: '18px' }}></i>
          </div>
          <span style={{ fontSize: '14px', fontWeight: '500' }}>¡Alimento agregado exitosamente!</span>
        </div>
      )}

      <header style={{
        position: 'fixed',
        top: 0,
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #e5e7eb',
        zIndex: 50
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px'
        }}>
          <Link href="/" style={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none'
          }}>
            <i className="ri-arrow-left-line" style={{ color: '#6b7280', fontSize: '20px' }}></i>
          </Link>
          <h1 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            margin: 0
          }}>Agregar Comida</h1>
          <Link href="/scan-barcode" style={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none'
          }}>
            <i className="ri-qr-scan-line" style={{ color: '#3b82f6', fontSize: '20px' }}></i>
          </Link>
        </div>
      </header>

      <main style={{
        paddingTop: '64px',
        paddingBottom: '80px',
        padding: '64px 16px 80px 16px'
      }}>
        <div style={{ marginTop: '24px', marginBottom: '24px' }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              paddingLeft: '12px',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none'
            }}>
              <i className="ri-search-line" style={{ color: '#9ca3af', fontSize: '18px' }}></i>
            </div>
            <input
              type="text"
              placeholder="Buscar alimentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '40px',
                paddingRight: '16px',
                paddingTop: '12px',
                paddingBottom: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                outline: 'none',
                backgroundColor: 'white',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                fontSize: '14px'
              }}
              onFocus={(e) => {
                (e.target as HTMLInputElement).style.borderColor = '#3b82f6';
                (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                (e.target as HTMLInputElement).style.borderColor = '#e5e7eb';
                (e.target as HTMLInputElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '12px',
            margin: '0 0 12px 0'
          }}>Seleccionar comida</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px'
          }}>
            {mealTypes.map((meal) => (
              <button
                key={meal.id}
                onClick={() => setSelectedMeal(meal.id)}
                className="!rounded-button"
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                  border: 'none',
                  cursor: 'pointer',
                  background: selectedMeal === meal.id
                    ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
                    : 'white',
                  color: selectedMeal === meal.id ? 'white' : '#6b7280',
                  boxShadow: selectedMeal === meal.id
                    ? '0 10px 25px rgba(59, 130, 246, 0.3)'
                    : '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 4px auto'
                }}>
                  <i className={meal.icon} style={{ fontSize: '18px' }}></i>
                </div>
                <span style={{ fontSize: '12px', fontWeight: '500' }}>{meal.name}</span>
              </button>
            ))
            }
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <Link href="/scan-barcode" style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            textDecoration: 'none',
            color: 'inherit'
          }} className="!rounded-button">
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#f3e8ff',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px'
            }}>
              <i className="ri-qr-scan-line" style={{ color: '#8b5cf6', fontSize: '20px' }}></i>
            </div>
            <h4 style={{
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '4px',
              margin: '0 0 4px 0'
            }}>Escanear</h4>
            <p style={{
              fontSize: '12px',
              color: '#6b7280',
              margin: 0
            }}>
              Código de barras
            </p>
          </Link>
          <button
            onClick={() => setShowCreateFood(true)}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left'
            }}
            className="!rounded-button"
          >
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#dcfce7',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px'
            }}>
              <i className="ri-add-circle-line" style={{ color: '#16a34a', fontSize: '20px' }}></i>
            </div>
            <h4 style={{
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '4px',
              margin: '0 0 4px 0'
            }}>Crear</h4>
            <p style={{
              fontSize: '12px',
              color: '#6b7280',
              margin: 0
            }}>
              Alimento personalizado
            </p>
          </button>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '12px',
            margin: '0 0 12px 0'
          }}>Recientes</h3>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            {recentFoods.map((food, index) => (
              <button
                key={index}
                onClick={() => addFoodToMeal(food)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  borderBottom: index < recentFoods.length - 1 ? '1px solid #f3f4f6' : 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'}
              >
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <h4 style={{
                    fontWeight: '500',
                    color: '#1f2937',
                    margin: '0 0 4px 0'
                  }}>{food.name}</h4>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    {food.calories} kcal • P: {food.protein}g • C: {food.carbs}g • G: {food.fats}g
                  </p>
                </div>
                <div style={{
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="ri-add-line" style={{ color: '#3b82f6', fontSize: '20px' }}></i>
                </div>
              </button>
            ))
            }
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '12px',
            margin: '0 0 12px 0'
          }}>Populares</h3>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            {popularFoods.map((food, index) => (
              <button
                key={index}
                onClick={() => addFoodToMeal(food)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  borderBottom: index < popularFoods.length - 1 ? '1px solid #f3f4f6' : 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'}
              >
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <h4 style={{
                    fontWeight: '500',
                    color: '#1f2937',
                    margin: '0 0 4px 0'
                  }}>{food.name}</h4>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    {food.calories} kcal • P: {food.protein}g • C: {food.carbs}g • G: {food.fats}g
                  </p>
                </div>
                <div style={{
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="ri-add-line" style={{ color: '#3b82f6', fontSize: '20px' }}></i>
                </div>
              </button>
            ))
            }
          </div>
        </div>
      </main>

      {showCreateFood && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '400px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0
              }}>Crear Alimento</h3>
              <button
                onClick={() => setShowCreateFood(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer'
                }}
              >
                <i className="ri-close-line" style={{ color: '#6b7280', fontSize: '18px' }}></i>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Nombre del alimento *
                </label>
                <input
                  type="text"
                  value={newFood.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ej: Pollo, Arroz, Manzana"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    outline: 'none',
                    fontSize: '14px'
                  }}
                  onFocus={(e) => {
                    (e.target as HTMLInputElement).style.borderColor = '#3b82f6';
                    (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    (e.target as HTMLInputElement).style.borderColor = '#e5e7eb';
                    (e.target as HTMLInputElement).style.boxShadow = 'none';
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Cantidad *
                </label>
                <input
                  type="text"
                  value={newFood.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  placeholder="Ej: 100 g, 1 taza, 2 unidades"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    outline: 'none',
                    fontSize: '14px'
                  }}
                  onFocus={(e) => {
                    (e.target as HTMLInputElement).style.borderColor = '#3b82f6';
                    (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    (e.target as HTMLInputElement).style.borderColor = '#e5e7eb';
                    (e.target as HTMLInputElement).style.boxShadow = 'none';
                  }}
                />
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  marginTop: '4px',
                  margin: '4px 0 0 0'
                }}>
                  Los valores se calcularán automáticamente si el alimento está en nuestra base de datos
                </p>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Porción (opcional)
                </label>
                <input
                  type="text"
                  value={newFood.serving}
                  onChange={(e) => handleInputChange('serving', e.target.value)}
                  placeholder="Ej: 1 taza, 1 porción"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    outline: 'none',
                    fontSize: '14px'
                  }}
                  onFocus={(e) => {
                    (e.target as HTMLInputElement).style.borderColor = '#3b82f6';
                    (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    (e.target as HTMLInputElement).style.borderColor = '#e5e7eb';
                    (e.target as HTMLInputElement).style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Calorías *
                  </label>
                  <input
                    type="number"
                    value={newFood.calories}
                    onChange={(e) => handleInputChange('calories', e.target.value)}
                    placeholder="0"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      outline: 'none',
                      fontSize: '14px',
                      backgroundColor: newFood.calories && findFoodInDatabase(newFood.name) ? '#f9fafb' : 'white'
                    }}
                    onFocus={(e) => {
                      (e.target as HTMLInputElement).style.borderColor = '#3b82f6';
                      (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      (e.target as HTMLInputElement).style.borderColor = '#e5e7eb';
                      (e.target as HTMLInputElement).style.boxShadow = 'none';
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Proteínas (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newFood.protein}
                    onChange={(e) => handleInputChange('protein', e.target.value)}
                    placeholder="0"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      outline: 'none',
                      fontSize: '14px',
                      backgroundColor: newFood.protein && findFoodInDatabase(newFood.name) ? '#f9fafb' : 'white'
                    }}
                    onFocus={(e) => {
                      (e.target as HTMLInputElement).style.borderColor = '#3b82f6';
                      (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      (e.target as HTMLInputElement).style.borderColor = '#e5e7eb';
                      (e.target as HTMLInputElement).style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Carbohidratos (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newFood.carbs}
                    onChange={(e) => handleInputChange('carbs', e.target.value)}
                    placeholder="0"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      outline: 'none',
                      fontSize: '14px',
                      backgroundColor: newFood.carbs && findFoodInDatabase(newFood.name) ? '#f9fafb' : 'white'
                    }}
                    onFocus={(e) => {
                      (e.target as HTMLInputElement).style.borderColor = '#3b82f6';
                      (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      (e.target as HTMLInputElement).style.borderColor = '#e5e7eb';
                      (e.target as HTMLInputElement).style.boxShadow = 'none';
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Grasas (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newFood.fats}
                    onChange={(e) => handleInputChange('fats', e.target.value)}
                    placeholder="0"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      outline: 'none',
                      fontSize: '14px',
                      backgroundColor: newFood.fats && findFoodInDatabase(newFood.name) ? '#f9fafb' : 'white'
                    }}
                    onFocus={(e) => {
                      (e.target as HTMLInputElement).style.borderColor = '#3b82f6';
                      (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      (e.target as HTMLInputElement).style.borderColor = '#e5e7eb';
                      (e.target as HTMLInputElement).style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              marginTop: '24px'
            }}>
              <button
                onClick={() => setShowCreateFood(false)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '12px',
                  color: '#374151',
                  fontWeight: '500',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                className="!rounded-button"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateFood}
                disabled={!newFood.name || !newFood.calories}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  color: 'white',
                  fontWeight: '500',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: newFood.name && newFood.calories ? 'pointer' : 'not-allowed',
                  opacity: newFood.name && newFood.calories ? 1 : 0.5,
                  fontSize: '14px'
                }}
                className="!rounded-button"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
