// Calculadora de necesidades nutricionales basada en el perfil del usuario

export interface UserProfile {
  age: string;
  weight: string;
  height: string;
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active';
  workActivity: 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active';
  goal: 'lose' | 'maintain' | 'gain';
}

export interface NutritionTargets {
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFats: number;
  targetWater: number;
  targetFiber: number;
}

export interface ActivityMultipliers {
  sedentary: number;
  light: number;
  moderate: number;
  active: number;
  'very-active': number;
}

export class NutritionCalculator {
  // Multiplicadores de actividad física (Factor de Actividad Total)
  private static activityMultipliers: ActivityMultipliers = {
    sedentary: 1.2,      // Sin ejercicio, trabajo de oficina
    light: 1.375,        // Ejercicio ligero 1-3 días/semana
    moderate: 1.55,      // Ejercicio moderado 3-5 días/semana
    active: 1.725,       // Ejercicio intenso 6-7 días/semana
    'very-active': 1.9   // Ejercicio muy intenso, trabajo físico
  };

  // Multiplicadores adicionales para actividad laboral
  private static workActivityMultipliers: ActivityMultipliers = {
    sedentary: 1.0,      // Trabajo de oficina, sentado la mayor parte del día
    light: 1.1,          // Trabajo con algo de caminata, maestro
    moderate: 1.2,       // Trabajo que requiere caminar mucho, enfermero
    active: 1.3,         // Trabajo físico moderado, mecánico
    'very-active': 1.4   // Trabajo físico intenso, construcción
  };

  // Multiplicadores para objetivos
  private static goalMultipliers = {
    lose: 0.8,           // Déficit calórico del 20%
    maintain: 1.0,       // Mantenimiento
    gain: 1.2            // Superávit calórico del 20%
  };

  /**
   * Calcula el Metabolismo Basal (BMR) usando la fórmula de Mifflin-St Jeor
   */
  static calculateBMR(profile: UserProfile): number {
    const weight = parseFloat(profile.weight);
    const height = parseFloat(profile.height);
    const age = parseInt(profile.age);

    if (!weight || !height || !age) return 0;

    // Fórmula de Mifflin-St Jeor
    // Hombres: BMR = 10 × peso(kg) + 6.25 × altura(cm) - 5 × edad(años) + 5
    // Mujeres: BMR = 10 × peso(kg) + 6.25 × altura(cm) - 5 × edad(años) - 161

    const baseBMR = 10 * weight + 6.25 * height - 5 * age;
    
    // Asumimos género masculino por defecto si no se especifica
    const genderAdjustment = profile.gender === 'female' ? -161 : 5;
    
    return Math.round(baseBMR + genderAdjustment);
  }

  /**
   * Calcula las calorías diarias totales considerando actividad física y laboral
   */
  static calculateTotalCalories(profile: UserProfile): number {
    const bmr = this.calculateBMR(profile);
    
    // Multiplicador de actividad física
    const activityMultiplier = this.activityMultipliers[profile.activityLevel] || 1.2;
    
    // Multiplicador adicional por actividad laboral
    const workMultiplier = this.workActivityMultipliers[profile.workActivity] || 1.0;
    
    // Multiplicador por objetivo
    const goalMultiplier = this.goalMultipliers[profile.goal] || 1.0;
    
    // Cálculo final
    const totalCalories = bmr * activityMultiplier * workMultiplier * goalMultiplier;
    
    return Math.round(totalCalories);
  }

  /**
   * Calcula los macronutrientes basados en las calorías totales
   */
  static calculateMacronutrients(totalCalories: number, profile: UserProfile): {
    protein: number;
    carbs: number;
    fats: number;
  } {
    const weight = parseFloat(profile.weight);
    
    // Distribución de macronutrientes según objetivo
    let proteinRatio: number;
    let fatRatio: number;
    let carbRatio: number;

    switch (profile.goal) {
      case 'lose':
        // Pérdida de peso: Mayor proteína para preservar masa muscular
        proteinRatio = 0.30;  // 30% proteína
        fatRatio = 0.25;      // 25% grasa
        carbRatio = 0.45;     // 45% carbohidratos
        break;
      case 'gain':
        // Ganancia de peso: Más carbohidratos para energía
        proteinRatio = 0.25;  // 25% proteína
        fatRatio = 0.25;      // 25% grasa
        carbRatio = 0.50;     // 50% carbohidratos
        break;
      default: // maintain
        // Mantenimiento: Distribución equilibrada
        proteinRatio = 0.25;  // 25% proteína
        fatRatio = 0.30;      // 30% grasa
        carbRatio = 0.45;     // 45% carbohidratos
        break;
    }

    // Ajuste por nivel de actividad - más proteína para personas más activas
    if (profile.activityLevel === 'active' || profile.activityLevel === 'very-active') {
      proteinRatio += 0.05;
      carbRatio -= 0.05;
    }

    // Cálculo de gramos de macronutrientes
    const proteinCalories = totalCalories * proteinRatio;
    const fatCalories = totalCalories * fatRatio;
    const carbCalories = totalCalories * carbRatio;

    return {
      protein: Math.round(proteinCalories / 4),  // 4 cal/g
      carbs: Math.round(carbCalories / 4),       // 4 cal/g
      fats: Math.round(fatCalories / 9)          // 9 cal/g
    };
  }

  /**
   * Calcula las necesidades de agua basadas en peso, actividad y clima
   */
  static calculateWaterNeeds(profile: UserProfile): number {
    const weight = parseFloat(profile.weight);
    if (!weight) return 2500;

    // Base: 35ml por kg de peso corporal
    let waterNeeds = weight * 35;

    // Ajuste por actividad física
    const activityAdjustment = {
      sedentary: 0,
      light: 300,
      moderate: 500,
      active: 700,
      'very-active': 1000
    };

    waterNeeds += activityAdjustment[profile.activityLevel] || 0;

    // Ajuste por actividad laboral
    const workAdjustment = {
      sedentary: 0,
      light: 200,
      moderate: 400,
      active: 600,
      'very-active': 800
    };

    waterNeeds += workAdjustment[profile.workActivity] || 0;

    return Math.round(waterNeeds);
  }

  /**
   * Calcula las necesidades de fibra basadas en calorías y edad
   */
  static calculateFiberNeeds(totalCalories: number, profile: UserProfile): number {
    const age = parseInt(profile.age);
    
    // Recomendación general: 14g por cada 1000 calorías
    let fiberNeeds = (totalCalories / 1000) * 14;

    // Ajuste por edad
    if (age > 50) {
      fiberNeeds *= 0.9; // Ligeramente menos para personas mayores
    }

    return Math.round(fiberNeeds);
  }

  /**
   * Calcula todos los objetivos nutricionales
   */
  static calculateNutritionTargets(profile: UserProfile): NutritionTargets {
    const totalCalories = this.calculateTotalCalories(profile);
    const macros = this.calculateMacronutrients(totalCalories, profile);
    const water = this.calculateWaterNeeds(profile);
    const fiber = this.calculateFiberNeeds(totalCalories, profile);

    return {
      targetCalories: totalCalories,
      targetProtein: macros.protein,
      targetCarbs: macros.carbs,
      targetFats: macros.fats,
      targetWater: water,
      targetFiber: fiber
    };
  }

  /**
   * Obtiene una descripción detallada del cálculo
   */
  static getCalculationDetails(profile: UserProfile): {
    bmr: number;
    activityMultiplier: number;
    workMultiplier: number;
    goalMultiplier: number;
    totalCalories: number;
    explanation: string;
  } {
    const bmr = this.calculateBMR(profile);
    const activityMultiplier = this.activityMultipliers[profile.activityLevel] || 1.2;
    const workMultiplier = this.workActivityMultipliers[profile.workActivity] || 1.0;
    const goalMultiplier = this.goalMultipliers[profile.goal] || 1.0;
    const totalCalories = this.calculateTotalCalories(profile);

    const activityLabels = {
      sedentary: 'Sedentario',
      light: 'Ligero',
      moderate: 'Moderado',
      active: 'Activo',
      'very-active': 'Muy Activo'
    };

    const goalLabels = {
      lose: 'Perder peso',
      maintain: 'Mantener peso',
      gain: 'Ganar peso'
    };

    const explanation = `
Metabolismo Basal (BMR): ${bmr} calorías
Actividad física (${activityLabels[profile.activityLevel]}): ×${activityMultiplier}
Actividad laboral (${activityLabels[profile.workActivity]}): ×${workMultiplier}
Objetivo (${goalLabels[profile.goal]}): ×${goalMultiplier}
Total: ${totalCalories} calorías diarias
    `.trim();

    return {
      bmr,
      activityMultiplier,
      workMultiplier,
      goalMultiplier,
      totalCalories,
      explanation
    };
  }
}