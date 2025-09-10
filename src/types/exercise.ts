export interface CompletedExercise {
  id: string;
  name: string;
  duration: number;
  calories: number;
  date: Date;
  userId?: string;
  exerciseType?: string;
  intensity?: number;
}

export interface Exercise {
  id: string;
  name: string;
  type: string;
  duration: number;
  weight?: number;
  reps?: number;
  sets?: number;
  calories_burned: number;
  notes?: string;
  created_at: string;
}

export interface ExerciseTotals {
  totalExercises: number;
  totalDuration: number;
  totalCalories: number;
  totalSets: number;
  totalReps: number;
}

export interface ExerciseTemplate {
  name: string;
  type: string;
  category: string;
  calories_per_min: number;
}