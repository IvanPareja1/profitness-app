
'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function FoodSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([
    'Pollo a la plancha',
    'Ensalada César',
    'Avena con frutas',
    'Salmón',
    'Quinoa'
  ]);

  const popularFoods = [
    { id: 1, name: 'Pechuga de pollo', calories: 165, protein: 31, carbs: 0, fats: 3.6, category: 'Proteínas' },
    { id: 2, name: 'Arroz integral', calories: 112, protein: 2.3, carbs: 23, fats: 0.9, category: 'Carbohidratos' },
    { id: 3, name: 'Brócoli', calories: 34, protein: 2.8, carbs: 7, fats: 0.4, category: 'Verduras' },
    { id: 4, name: 'Almendras', calories: 579, protein: 21.2, carbs: 21.6, fats: 49.9, category: 'Frutos secos' },
    { id: 5, name: 'Yogurt griego', calories: 100, protein: 10, carbs: 6, fats: 0.4, category: 'Lácteos' },
    { id: 6, name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fats: 0.3, category: 'Frutas' },
    { id: 7, name: 'Salmón', calories: 208, protein: 22, carbs: 0, fats: 12, category: 'Pescados' },
    { id: 8, name: 'Huevo', calories: 155, protein: 13, carbs: 1.1, fats: 11, category: 'Proteínas' }
  ];

  const categories = [
    { name: 'Proteínas', icon: 'ri-restaurant-line', color: 'bg-red-100 text-red-600' },
    { name: 'Carbohidratos', icon: 'ri-cake-line', color: 'bg-orange-100 text-orange-600' },
    { name: 'Frutas', icon: 'ri-apple-line', color: 'bg-green-100 text-green-600' },
    { name: 'Verduras', icon: 'ri-leaf-line', color: 'bg-emerald-100 text-emerald-600' },
    { name: 'Lácteos', icon: 'ri-goblet-line', color: 'bg-blue-100 text-blue-600' },
    { name: 'Frutos secos', icon: 'ri-seedling-line', color: 'bg-amber-100 text-amber-600' }
  ];

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    
    // Simular búsqueda
    setTimeout(() => {
      const results = popularFoods.filter(food =>
        food.name.toLowerCase().includes(query.toLowerCase()) ||
        food.category.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
      setIsLoading(false);
    }, 500);

    // Agregar a búsquedas recientes
    if (query.trim() && !recentSearches.includes(query)) {
      setRecentSearches(prev => [query, ...prev.slice(0, 4)]);
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 px-4 py-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <Link href="/food" className="w-8 h-8 flex items-center justify-center">
            <i className="ri-arrow-left-line text-gray-600 text-lg"></i>
          </Link>
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
              }}
              className="w-full px-4 py-2 pl-10 pr-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Buscar alimentos..."
              autoFocus
            />
            <i className="ri-search-line text-gray-400 text-lg absolute left-3 top-1/2 transform -translate-y-1/2"></i>
            {searchQuery && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <i className="ri-close-line text-gray-400 text-lg"></i>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-20 pb-24 px-4">
        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        )}

        {/* Search Results */}
        {searchQuery && searchResults.length > 0 && !isLoading && (
          <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Resultados para "{searchQuery}" ({searchResults.length})
            </h3>
            <div className="space-y-3">
              {searchResults.map((food) => (
                <Link 
                  key={food.id}
                  href="/food/add"
                  className="block p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <i className="ri-restaurant-line text-green-600 text-sm"></i>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{food.name}</p>
                        <p className="text-sm text-gray-600">{food.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-orange-600">{food.calories}</p>
                      <p className="text-xs text-gray-500">kcal/100g</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <p className="text-red-600 font-bold">{food.protein}g</p>
                      <p className="text-gray-500">Proteína</p>
                    </div>
                    <div>
                      <p className="text-green-600 font-bold">{food.carbs}g</p>
                      <p className="text-gray-500">Carbohidratos</p>
                    </div>
                    <div>
                      <p className="text-yellow-600 font-bold">{food.fats}g</p>
                      <p className="text-gray-500">Grasas</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {searchQuery && searchResults.length === 0 && !isLoading && (
          <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="ri-search-line text-gray-400 text-2xl"></i>
              </div>
              <p className="text-gray-500 text-sm mb-2">No se encontraron resultados para "{searchQuery}"</p>
              <Link 
                href="/food/add"
                className="inline-block mt-2 text-green-600 text-sm font-medium"
              >
                Agregar alimento personalizado
              </Link>
            </div>
          </div>
        )}

        {/* Recent Searches */}
        {!searchQuery && recentSearches.length > 0 && (
          <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Búsquedas Recientes</h3>
              <button 
                onClick={clearRecentSearches}
                className="text-sm text-gray-500"
              >
                Limpiar
              </button>
            </div>
            <div className="space-y-2">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchQuery(search);
                    handleSearch(search);
                  }}
                  className="flex items-center w-full p-3 text-left rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <i className="ri-history-line text-gray-400 text-sm mr-3"></i>
                  <span className="text-gray-700">{search}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
        {!searchQuery && (
          <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Categorías</h3>
            <div className="grid grid-cols-3 gap-3">
              {categories.map((category, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchQuery(category.name);
                    handleSearch(category.name);
                  }}
                  className="flex flex-col items-center p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-12 h-12 ${category.color} rounded-2xl flex items-center justify-center mb-2`}>
                    <i className={`${category.icon} text-lg`}></i>
                  </div>
                  <p className="text-xs font-medium text-gray-800 text-center">{category.name}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Popular Foods */}
        {!searchQuery && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Alimentos Populares</h3>
            <div className="space-y-3">
              {popularFoods.slice(0, 6).map((food) => (
                <Link 
                  key={food.id}
                  href="/food/add"
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <i className="ri-restaurant-line text-green-600 text-sm"></i>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{food.name}</p>
                      <p className="text-xs text-gray-500">{food.category} • {food.calories} kcal</p>
                    </div>
                  </div>
                  <i className="ri-arrow-right-s-line text-gray-400"></i>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 w-full bg-white border-t border-gray-100 px-0 py-0">
          <div className="grid grid-cols-5 h-16">
            <Link href="/" className="flex flex-col items-center justify-center">
              <i className="ri-home-line text-gray-400 text-lg"></i>
              <span className="text-xs text-gray-400 mt-1">Inicio</span>
            </Link>
            <Link href="/food" className="flex flex-col items-center justify-center bg-green-50">
              <i className="ri-restaurant-fill text-green-600 text-lg"></i>
              <span className="text-xs text-green-600 mt-1">Comida</span>
            </Link>
            <Link href="/workout" className="flex flex-col items-center justify-center">
              <i className="ri-run-line text-gray-400 text-lg"></i>
              <span className="text-xs text-gray-400 mt-1">Ejercicio</span>
            </Link>
            <Link href="/progress" className="flex flex-col items-center justify-center">
              <i className="ri-bar-chart-line text-gray-400 text-lg"></i>
              <span className="text-xs text-gray-400 mt-1">Progreso</span>
            </Link>
            <Link href="/profile" className="flex flex-col items-center justify-center">
              <i className="ri-user-line text-gray-400 text-lg"></i>
              <span className="text-xs text-gray-400 mt-1">Perfil</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
