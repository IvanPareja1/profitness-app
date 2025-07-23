
'use client';

import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface FoodEntry {
  id: string;
  name: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  timestamp: string;
}

export interface DailyNutritionData {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  foods: FoodEntry[];
}

export function useNutritionData() {
  const [mounted, setMounted] = useState(false);
  const [dailyData, setDailyData] = useLocalStorage<DailyNutritionData>('dailyNutritionData', {
    date: '',
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0,
    foods: []
  });

  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const saveToHistory = (date: string, data: DailyNutritionData) => {
    try {
      const historicalData = localStorage.getItem('nutritionHistory');
      let history = [];
      if (historicalData) {
        try {
          history = JSON.parse(historicalData);
        } catch (e) {
          history = [];
        }
      }

      // Verificar si ya existe un registro para esta fecha
      const existingIndex = history.findIndex((entry: any) => entry.date === date);
      const historyEntry = {
        date: date,
        totalCalories: data.totalCalories,
        totalProtein: data.totalProtein,
        totalCarbs: data.totalCarbs,
        totalFats: data.totalFats,
        foods: data.foods
      };

      if (existingIndex >= 0) {
        // Actualizar registro existente
        history[existingIndex] = historyEntry;
      } else {
        // Agregar nuevo registro
        history.push(historyEntry);
      }

      // Mantener solo los últimos 30 días
      if (history.length > 30) {
        history = history.slice(-30);
      }

      localStorage.setItem('nutritionHistory', JSON.stringify(history));
      console.log('Datos guardados en historial para:', date);
    } catch (error) {
      console.error('Error guardando historial:', error);
    }
  };

  const resetDailyData = (date: string) => {
    console.log('Reiniciando datos nutricionales a cero para:', date);

    const newData: DailyNutritionData = {
      date,
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFats: 0,
      foods: []
    };

    setDailyData(newData);
  };

  const checkDailyReset = () => {
    const today = getCurrentDate();
    const lastDate = dailyData.date;

    console.log('Verificando reset diario - Hoy:', today, 'Última fecha:', lastDate);

    // Si no hay fecha o la fecha es diferente, resetear
    if (!lastDate || lastDate !== today) {
      console.log('Reiniciando datos nutricionales - Nueva fecha:', today);

      // Guardar datos históricos solo si hay datos del día anterior
      if (lastDate && (dailyData.totalCalories > 0 || dailyData.foods.length > 0)) {
        saveToHistory(lastDate, dailyData);
      }

      // Resetear datos diarios completamente
      resetDailyData(today);
    }
  };

  // Función para cambiar fecha manualmente
  const changeDate = (newDate: string) => {
    console.log('Cambiando fecha manualmente a:', newDate);
    
    // Guardar datos actuales si hay datos
    if (dailyData.date && (dailyData.totalCalories > 0 || dailyData.foods.length > 0)) {
      saveToHistory(dailyData.date, dailyData);
    }

    // Buscar datos históricos para la nueva fecha
    const historicalData = localStorage.getItem('nutritionHistory');
    let history = [];
    if (historicalData) {
      try {
        history = JSON.parse(historicalData);
      } catch (e) {
        history = [];
      }
    }

    const existingData = history.find((entry: any) => entry.date === newDate);
    
    if (existingData) {
      // Cargar datos existentes para esta fecha
      console.log('Cargando datos existentes para:', newDate);
      setDailyData(existingData);
    } else {
      // Crear datos nuevos para esta fecha
      console.log('Creando datos nuevos para:', newDate);
      resetDailyData(newDate);
    }
  };

  const addFood = (food: Omit<FoodEntry, 'id' | 'timestamp'>) => {
    const newFood: FoodEntry = {
      ...food,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };

    setDailyData(prev => ({
      ...prev,
      totalCalories: prev.totalCalories + food.calories,
      totalProtein: prev.totalProtein + food.protein,
      totalCarbs: prev.totalCarbs + food.carbs,
      totalFats: prev.totalFats + food.fats,
      foods: [...prev.foods, newFood]
    }));
  };

  const removeFood = (foodId: string) => {
    setDailyData(prev => {
      const foodToRemove = prev.foods.find(f => f.id === foodId);
      if (!foodToRemove) return prev;

      return {
        ...prev,
        totalCalories: prev.totalCalories - foodToRemove.calories,
        totalProtein: prev.totalProtein - foodToRemove.protein,
        totalCarbs: prev.totalCarbs - foodToRemove.carbs,
        totalFats: prev.totalFats - foodToRemove.fats,
        foods: prev.foods.filter(f => f.id !== foodId)
      };
    });
  };

  const getMealBreakdown = () => {
    const meals = {
      breakfast: { name: 'Desayuno', calories: 0, protein: 0, carbs: 0, fats: 0, foods: [] as string[] },
      lunch: { name: 'Almuerzo', calories: 0, protein: 0, carbs: 0, fats: 0, foods: [] as string[] },
      dinner: { name: 'Cena', calories: 0, protein: 0, carbs: 0, fats: 0, foods: [] as string[] },
      snack: { name: 'Merienda', calories: 0, protein: 0, carbs: 0, fats: 0, foods: [] as string[] }
    };

    dailyData.foods.forEach(food => {
      const meal = meals[food.mealType];
      if (meal) {
        meal.calories += food.calories;
        meal.protein += food.protein;
        meal.carbs += food.carbs;
        meal.fats += food.fats;
        meal.foods.push(food.name);
      }
    });

    return [meals.breakfast, meals.lunch, meals.dinner, meals.snack];
  };

  const getRecentMeals = () => {
    return dailyData.foods
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 3)
      .map(food => ({
        ...food,
        time: new Date(food.timestamp).toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit'
        })
      }));
  };

  // Forzar reset inmediato para fechas diferentes
  const forceReset = () => {
    const today = getCurrentDate();
    if (dailyData.date !== today) {
      console.log('Forzando reset para fecha actual:', today);
      checkDailyReset();
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      // Verificar reset inmediatamente al cargar
      const today = getCurrentDate();
      console.log('Verificando al cargar - Fecha actual:', today, 'Fecha guardada:', dailyData.date);
      
      if (!dailyData.date || dailyData.date !== today) {
        console.log('Ejecutando reset automático');
        checkDailyReset();
      }
    }
  }, [mounted, dailyData.date]);

  // Verificar reset cada 30 segundos para detectar cambios de día más rápido
  useEffect(() => {
    if (!mounted) return;

    const interval = setInterval(() => {
      checkDailyReset();
    }, 30000); // Cada 30 segundos

    return () => clearInterval(interval);
  }, [mounted, dailyData.date, dailyData.totalCalories, dailyData.foods.length]);

  return {
    mounted,
    dailyData,
    addFood,
    removeFood,
    getMealBreakdown,
    getRecentMeals,
    changeDate,
    forceReset,
    totalCalories: dailyData.totalCalories,
    totalProtein: dailyData.totalProtein,
    totalCarbs: dailyData.totalCarbs,
    totalFats: dailyData.totalFats
  };
}
