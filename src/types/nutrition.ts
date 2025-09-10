export interface Meal {
  id: string;
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  quantity: number;
  unit: string;
  meal_type: string;
  created_at: string;
  confidence_score?: number;
  ingredients?: string;
}

export interface FoodItem {
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  per: string;
}

export interface DayTotals {
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
}