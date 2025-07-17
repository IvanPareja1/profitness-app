
'use client';

import { useLocalStorage } from './useLocalStorage';
import { useUserProfile } from './useUserProfile';
import { useEffect } from 'react';

export interface WeightEntry {
  date: string;
  weight: number;
  change: number;
}

export function useWeightData() {
  const { userProfile, updateProfile } = useUserProfile();

  // Datos iniciales por defecto - fechas más recientes para mejor testing
  const getDefaultWeightData = (): WeightEntry[] => {
    const today = new Date();
    const data: WeightEntry[] = [];
    
    // Generar datos para los últimos 8 registros
    for (let i = 7; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - (i * 7)); // Cada semana
      
      const baseWeight = 78.5;
      const weightLoss = i * 0.4; // Pérdida gradual
      const weight = baseWeight - weightLoss;
      const change = i === 7 ? 0 : -0.4; // Primer registro sin cambio
      
      data.push({
        date: date.toISOString().split('T')[0],
        weight: parseFloat(weight.toFixed(1)),
        change: change
      });
    }
    
    return data;
  };

  const [weightData, setWeightData, mounted] = useLocalStorage<WeightEntry[]>('weightHistory', getDefaultWeightData());

  // Debug: Mostrar datos cargados
  useEffect(() => {
    if (mounted) {
      console.log('WeightData loaded:', weightData);
      console.log('Current environment:', typeof window !== 'undefined' ? 'Browser' : 'Server');
    }
  }, [mounted, weightData]);

  // Función para agregar nuevo peso
  const addWeightEntry = (weight: number) => {
    if (!mounted) {
      console.warn('Attempted to add weight before component mounted');
      return false;
    }

    const today = new Date().toISOString().split('T')[0];
    const lastWeight = getCurrentWeight();
    const change = weight - lastWeight;

    const newEntry: WeightEntry = {
      date: today,
      weight: weight,
      change: parseFloat(change.toFixed(1))
    };

    console.log('Adding new weight entry:', newEntry);

    // Verificar si ya existe una entrada para hoy
    const existingTodayIndex = weightData.findIndex(entry => entry.date === today);

    let updatedData;
    if (existingTodayIndex >= 0) {
      // Actualizar entrada existente
      updatedData = [...weightData];
      updatedData[existingTodayIndex] = newEntry;
      console.log('Updated existing entry for today');
    } else {
      // Agregar nueva entrada
      updatedData = [...weightData, newEntry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      console.log('Added new entry');
    }

    setWeightData(updatedData);

    // Actualizar peso actual en el perfil del usuario
    updateProfile({ currentWeight: weight });

    return true;
  };

  const updateWeightEntry = (index: number, newWeight: number) => {
    if (!mounted) return false;

    try {
      const newWeightData = [...weightData];
      const oldWeight = newWeightData[index].weight;
      
      newWeightData[index] = {
        ...newWeightData[index],
        weight: newWeight
      };

      console.log(`Updating weight entry ${index}: ${oldWeight} -> ${newWeight}`);

      // Recalcular cambios
      for (let i = 0; i < newWeightData.length; i++) {
        if (i === 0) {
          newWeightData[i].change = 0;
        } else {
          newWeightData[i].change = parseFloat((newWeightData[i].weight - newWeightData[i-1].weight).toFixed(1));
        }
      }

      setWeightData(newWeightData);
      return true;
    } catch (error) {
      console.error('Error updating weight entry:', error);
      return false;
    }
  };

  const deleteWeightEntry = (index: number) => {
    if (!mounted) return false;

    try {
      console.log(`Deleting weight entry at index ${index}`);
      const newWeightData = weightData.filter((_, i) => i !== index);

      // Recalcular cambios después de eliminar
      for (let i = 0; i < newWeightData.length; i++) {
        if (i === 0) {
          newWeightData[i].change = 0;
        } else {
          newWeightData[i].change = parseFloat((newWeightData[i].weight - newWeightData[i-1].weight).toFixed(1));
        }
      }

      setWeightData(newWeightData);
      return true;
    } catch (error) {
      console.error('Error deleting weight entry:', error);
      return false;
    }
  };

  // Obtener peso actual (más reciente)
  const getCurrentWeight = () => {
    if (weightData.length === 0) {
      console.log('No weight data, using profile weight:', userProfile.currentWeight);
      return userProfile.currentWeight;
    }
    const sortedData = [...weightData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const currentWeight = sortedData[0].weight;
    console.log('Current weight from data:', currentWeight);
    return currentWeight;
  };

  // Obtener peso inicial (más antiguo)
  const getInitialWeight = () => {
    if (weightData.length === 0) return userProfile.currentWeight;
    const sortedData = [...weightData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return sortedData[0].weight;
  };

  // Calcular pérdida total
  const getTotalWeightLoss = () => {
    const initial = getInitialWeight();
    const current = getCurrentWeight();
    const loss = parseFloat((initial - current).toFixed(1));
    console.log(`Total weight loss: ${initial} - ${current} = ${loss}`);
    return loss;
  };

  // Calcular promedio semanal
  const getAverageWeeklyLoss = () => {
    if (weightData.length < 2) return 0;

    const sortedData = [...weightData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const firstDate = new Date(sortedData[0].date);
    const lastDate = new Date(sortedData[sortedData.length - 1].date);
    const daysDiff = (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24);
    const weeksDiff = daysDiff / 7;

    if (weeksDiff === 0) return 0;

    const totalLoss = getTotalWeightLoss();
    return parseFloat((totalLoss / weeksDiff).toFixed(1));
  };

  // Calcular cambio semanal
  const getWeeklyChange = () => {
    const currentWeight = getCurrentWeight();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Buscar el peso más cercano a hace una semana
    const weekAgoWeight = weightData
      .filter(entry => new Date(entry.date) <= oneWeekAgo)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    if (!weekAgoWeight) return 0;

    return parseFloat((weekAgoWeight.weight - currentWeight).toFixed(1));
  };

  // Calcular rango de la gráfica basado en el peso actual del usuario
  const getWeightRange = () => {
    const currentWeight = getCurrentWeight();
    const rangePercentage = 0.05; // 5%
    const range = currentWeight * rangePercentage;

    // Obtener el peso mínimo y máximo del historial
    const weights = weightData.map(d => d.weight);
    const minHistoricWeight = Math.min(...weights);
    const maxHistoricWeight = Math.max(...weights);

    // Calcular rango centrado en el peso actual
    let minRange = currentWeight - range;
    let maxRange = currentWeight + range;

    // Ajustar el rango para incluir todos los datos históricos si es necesario
    if (minHistoricWeight < minRange) {
      const difference = minRange - minHistoricWeight;
      minRange = minHistoricWeight - 0.5; // Un poco de margen
      maxRange = maxRange + difference; // Compensar expandiendo hacia arriba
    }

    if (maxHistoricWeight > maxRange) {
      const difference = maxHistoricWeight - maxRange;
      maxRange = maxHistoricWeight + 0.5; // Un poco de margen
      minRange = minRange - difference; // Compensar expandiendo hacia abajo
    }

    return { min: minRange, max: maxRange };
  };

  return {
    weightData,
    mounted,
    addWeightEntry,
    updateWeightEntry,
    deleteWeightEntry,
    getCurrentWeight,
    getInitialWeight,
    getTotalWeightLoss,
    getAverageWeeklyLoss,
    getWeeklyChange,
    getWeightRange
  };
}