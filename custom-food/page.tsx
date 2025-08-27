'use client';

import { useState } from 'react';
import Link from 'next/link';
import { callEdgeFunction, getCurrentUser } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface CustomFood {
  name: string;
  brand: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  serving_size: string;
  serving_unit: string;
  category: string;
}

export default function CustomFoodPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState<CustomFood>({
    name: '',
    brand: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    serving_size: '100',
    serving_unit: 'g',
    category: 'otros'
  });

  const categories = [
    { id: 'frutas', name: 'Frutas', icon: 'ri-apple-line' },
    { id: 'verduras', name: 'Verduras', icon: 'ri-leaf-line' },
    { id: 'proteinas', name: 'Proteínas', icon: 'ri-restaurant-line' },
    { id: 'cereales', name: 'Cereales', icon: 'ri-seedling-line' },
    { id: 'lacteos', name: 'Lácteos', icon: 'ri-cup-line' },
    { id: 'grasas', name: 'Grasas', icon: 'ri-drop-line' },
    { id: 'bebidas', name: 'Bebidas', icon: 'ri-glass-line' },
    { id: 'snacks', name: 'Snacks', icon: 'ri-cake-line' },
    { id: 'condimentos', name: 'Condimentos', icon: 'ri-flask-line' },
    { id: 'otros', name: 'Otros', icon: 'ri-more-line' }
  ];

  const units = [
    { id: 'g', name: 'gramos' },
    { id: 'ml', name: 'mililitros' },
    { id: 'taza', name: 'taza' },
    { id: 'cucharada', name: 'cucharada' },
    { id: 'cucharadita', name: 'cucharadita' },
    { id: 'pieza', name: 'pieza/unidad' },
    { id: 'rebanada', name: 'rebanada' },
    { id: 'porcion', name: 'porción' }
  ];

  const handleInputChange = (field: keyof CustomFood, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      alert('Por favor ingresa el nombre del alimento');
      return false;
    }
    
    if (formData.calories < 0 || formData.protein < 0 || formData.carbs < 0 || formData.fat < 0) {
      alert('Los valores nutricionales no pueden ser negativos');
      return false;
    }

    if (!formData.serving_size || parseFloat(formData.serving_size) <= 0) {
      alert('Por favor ingresa un tamaño de porción válido');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const user = await getCurrentUser();
      if (!user) {
        router.push('/auth');
        return;
      }

      // Guardar alimento personalizado
      await callEdgeFunction('nutrition-tracker', {
        action: 'add_custom_food',
        userId: user.id,
        customFood: {
          ...formData,
          calories: Number(formData.calories),
          protein: Number(formData.protein),
          carbs: Number(formData.carbs),
          fat: Number(formData.fat),
          fiber: Number(formData.fiber),
          sugar: Number(formData.sugar),
          sodium: Number(formData.sodium),
          serving_size: parseFloat(formData.serving_size)
        }
      });

      setShowSuccess(true);
      
      // Limpiar formulario
      setFormData({
        name: '',
        brand: '',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
        serving_size: '100',
        serving_unit: 'g',
        category: 'otros'
      });

      // Ocultar mensaje después de 3 segundos
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);

    } catch (error) {
      console.error('Error saving custom food:', error);
      alert('Error al guardar el alimento personalizado. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Mensaje de éxito */}
      {showSuccess && (
        <div className="fixed top-20 left-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2">
          <i className="ri-check-line text-lg"></i>
          <span>¡Alimento personalizado creado exitosamente!</span>
        </div>
      )}

      <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Link href="/food-search" className="w-8 h-8 flex items-center justify-center">
              <i className="ri-arrow-left-line text-gray-600 text-xl"></i>
            </Link>
            <h1 className="text-xl font-semibold text-gray-800">Crear Alimento</h1>
          </div>
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <i className="ri-add-line text-purple-500 text-lg"></i>
          </div>
        </div>
      </div>

      <div className="pt-20 pb-20 px-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <i className="ri-information-line text-purple-500"></i>
              <span>Información Básica</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Alimento *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ej: Pasta casera, Smoothie de frutas..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marca (Opcional)
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  placeholder="Ej: Casero, Marca comercial..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleInputChange('category', category.id)}
                      className={`flex items-center space-x-2 p-3 rounded-xl border transition-all ${
                        formData.category === category.id
                          ? 'bg-purple-100 border-purple-300 text-purple-700'
                          : 'bg-gray-50 border-gray-200 text-gray-600'
                      }`}
                    >
                      <i className={`${category.icon} text-sm`}></i>
                      <span className="text-sm font-medium">{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tamaño de Porción */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <i className="ri-scales-line text-purple-500"></i>
              <span>Tamaño de Porción</span>
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={formData.serving_size}
                  onChange={(e) => handleInputChange('serving_size', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unidad
                </label>
                <select
                  value={formData.serving_unit}
                  onChange={(e) => handleInputChange('serving_unit', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-xl">
              <p className="text-sm text-purple-700">
                <i className="ri-information-line mr-1"></i>
                Los valores nutricionales se calcularán por {formData.serving_size} {units.find(u => u.id === formData.serving_unit)?.name}
              </p>
            </div>
          </div>

          {/* Macronutrientes */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <i className="ri-pie-chart-line text-purple-500"></i>
              <span>Macronutrientes *</span>
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Calorías (kcal)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.calories}
                  onChange={(e) => handleInputChange('calories', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proteínas (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.protein}
                  onChange={(e) => handleInputChange('protein', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Carbohidratos (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.carbs}
                  onChange={(e) => handleInputChange('carbs', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grasas (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.fat}
                  onChange={(e) => handleInputChange('fat', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
              <div className="grid grid-cols-4 gap-3 text-center">
                <div>
                  <div className="text-lg font-bold text-orange-600">{formData.calories}</div>
                  <div className="text-xs text-gray-500">kcal</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-blue-600">{formData.protein}g</div>
                  <div className="text-xs text-gray-500">Proteína</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-600">{formData.carbs}g</div>
                  <div className="text-xs text-gray-500">Carbohidratos</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-yellow-600">{formData.fat}g</div>
                  <div className="text-xs text-gray-500">Grasas</div>
                </div>
              </div>
            </div>
          </div>

          {/* Micronutrientes */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <i className="ri-microscope-line text-purple-500"></i>
              <span>Micronutrientes (Opcional)</span>
            </h3>

            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fibra (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.fiber}
                    onChange={(e) => handleInputChange('fiber', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Azúcar (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.sugar}
                    onChange={(e) => handleInputChange('sugar', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sodio (mg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.sodium}
                    onChange={(e) => handleInputChange('sodium', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex space-x-3">
            <Link
              href="/food-search"
              className="flex-1 border border-gray-300 text-gray-700 py-4 rounded-xl font-medium text-center"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-medium disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <i className="ri-save-line"></i>
                  <span>Crear Alimento</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Consejos */}
        <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
            <i className="ri-lightbulb-line text-yellow-500"></i>
            <span>Consejos Útiles</span>
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p className="flex items-start space-x-2">
              <i className="ri-arrow-right-s-line text-purple-500 mt-0.5 flex-shrink-0"></i>
              <span>Puedes encontrar información nutricional en el empaque del producto</span>
            </p>
            <p className="flex items-start space-x-2">
              <i className="ri-arrow-right-s-line text-purple-500 mt-0.5 flex-shrink-0"></i>
              <span>Para recetas caseras, suma los ingredientes individuales</span>
            </p>
            <p className="flex items-start space-x-2">
              <i className="ri-arrow-right-s-line text-purple-500 mt-0.5 flex-shrink-0"></i>
              <span>Los alimentos personalizados aparecerán en tus búsquedas futuras</span>
            </p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="grid grid-cols-5 py-2">
          <Link href="/" className="flex flex-col items-center justify-center py-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-home-line text-gray-400 text-lg"></i>
            </div>
            <span className="text-xs text-gray-400 mt-1">Inicio</span>
          </Link>
          
          <Link href="/nutrition" className="flex flex-col items-center justify-center py-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-restaurant-fill text-green-500 text-lg"></i>
            </div>
            <span className="text-xs text-green-500 mt-1">Comida</span>
          </Link>
          
          <Link href="/scan" className="flex flex-col items-center justify-center py-2">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <i className="ri-qr-scan-2-line text-white text-lg"></i>
            </div>
          </Link>
          
          <Link href="/reports" className="flex flex-col items-center justify-center py-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-bar-chart-line text-gray-400 text-lg"></i>
            </div>
            <span className="text-xs text-gray-400 mt-1">Reportes</span>
          </Link>
          
          <Link href="/profile" className="flex flex-col items-center justify-center py-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-user-line text-gray-400 text-lg"></i>
            </div>
            <span className="text-xs text-gray-400 mt-1">Perfil</span>
          </Link>
        </div>
      </div>
    </div>
  );
}