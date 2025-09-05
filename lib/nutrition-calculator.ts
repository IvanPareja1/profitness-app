
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

export interface MacroDistribution {
  protein: number;
  carbs: number;
  fats: number;
}

export class NutritionCalculator {
  // Multiplicadores de actividad física usando Harris-Benedict modificado
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

  // Distribuciones de macronutrientes según actividad y objetivo
  private static macroDistributions = {
    // Personas sedentarias (oficina, poco movimiento)
    sedentary: {
      lose: { protein: 0.35, carbs: 0.35, fats: 0.30 },      // Mayor proteína para preservar masa muscular
      maintain: { protein: 0.25, carbs: 0.40, fats: 0.35 },  // Menos carbohidratos por poca actividad
      gain: { protein: 0.25, carbs: 0.45, fats: 0.30 }       // Carbohidratos moderados
    },
    // Actividad ligera (caminar, ejercicio ocasional)
    light: {
      lose: { protein: 0.30, carbs: 0.40, fats: 0.30 },      // Proteína alta, carbohidratos moderados
      maintain: { protein: 0.25, carbs: 0.45, fats: 0.30 },  // Distribución equilibrada
      gain: { protein: 0.25, carbs: 0.50, fats: 0.25 }       // Más carbohidratos para energía
    },
    // Actividad moderada (ejercicio regular)
    moderate: {
      lose: { protein: 0.30, carbs: 0.45, fats: 0.25 },      // Proteína alta, carbohidratos para entrenar
      maintain: { protein: 0.25, carbs: 0.50, fats: 0.25 },  // Carbohidratos para rendimiento
      gain: { protein: 0.25, carbs: 0.55, fats: 0.20 }       // Carbohidratos altos para ganancia
    },
    // Actividad alta (entrenamiento intenso)
    active: {
      lose: { protein: 0.35, carbs: 0.45, fats: 0.20 },      // Proteína muy alta para recuperación
      maintain: { protein: 0.30, carbs: 0.50, fats: 0.20 },  // Proteína alta, carbohidratos para rendimiento
      gain: { protein: 0.25, carbs: 0.60, fats: 0.15 }       // Carbohidratos muy altos para ganancia
    },
    // Actividad muy alta (atletas, trabajo físico intenso)
    'very-active': {
      lose: { protein: 0.40, carbs: 0.45, fats: 0.15 },      // Proteína máxima para recuperación
      maintain: { protein: 0.30, carbs: 0.55, fats: 0.15 },  // Carbohidratos altos para rendimiento
      gain: { protein: 0.25, carbs: 0.65, fats: 0.10 }       // Carbohidratos máximos para ganancia
    }
  };

  /**
   * Calcula el Metabolismo Basal (BMR) usando tanto Harris-Benedict como Mifflin-St Jeor
   */
  static calculateBMR(profile: UserProfile, formula: 'harris-benedict' | 'mifflin' = 'mifflin'): number {
    const weight = parseFloat(profile.weight);
    const height = parseFloat(profile.height);
    const age = parseInt(profile.age);

    if (!weight || !height || !age) return 0;

    let bmr: number;

    if (formula === 'harris-benedict') {
      // Fórmula de Harris-Benedict revisada
      if (profile.gender === 'female') {
        bmr = 655.1 + (9.563 * weight) + (1.850 * height) - (4.676 * age);
      } else {
        bmr = 66.5 + (13.75 * weight) + (5.003 * height) - (6.75 * age);
      }
    } else {
      // Fórmula de Mifflin-St Jeor (más precisa para población moderna)
      const baseBMR = 10 * weight + 6.25 * height - 5 * age;
      const genderAdjustment = profile.gender === 'female' ? -161 : 5;
      bmr = baseBMR + genderAdjustment;
    }
    
    return Math.round(bmr);
  }

  /**
   * Calcula las calorías diarias totales considerando actividad física y laboral
   */
  static calculateTotalCalories(profile: UserProfile): number {
    const bmr = this.calculateBMR(profile, 'mifflin'); // Usamos Mifflin por defecto por ser más precisa
    
    // Multiplicador de actividad física
    const activityMultiplier = this.activityMultipliers[profile.activityLevel] || 1.2;
    
    // Multiplicador adicional por actividad laboral
    const workMultiplier = this.workActivityMultipliers[profile.workActivity] || 1.0;
    
    // Multiplicador por objetivo
    const goalMultiplier = this.goalMultipliers[profile.goal] || 1.0;
    
    // Ajuste adicional por combinación de actividades
    let combinedActivityAdjustment = 1.0;
    
    // Si tanto el trabajo como el ejercicio son muy activos, aplicamos un ajuste menor
    if (profile.workActivity === 'very-active' && profile.activityLevel === 'very-active') {
      combinedActivityAdjustment = 0.95; // Evitar sobreestimación
    }
    // Si el trabajo es sedentario pero el ejercicio es muy activo, ajuste para compensar
    else if (profile.workActivity === 'sedentary' && (profile.activityLevel === 'active' || profile.activityLevel === 'very-active')) {
      combinedActivityAdjustment = 1.05; // Pequeño incremento
    }
    
    // Cálculo final
    const totalCalories = bmr * activityMultiplier * workMultiplier * goalMultiplier * combinedActivityAdjustment;
    
    return Math.round(totalCalories);
  }

  /**
   * Calcula los macronutrientes basados en las calorías totales y el perfil de actividad
   */
  static calculateMacronutrients(totalCalories: number, profile: UserProfile): {
    protein: number;
    carbs: number;
    fats: number;
  } {
    const weight = parseFloat(profile.weight);
    
    // Determinamos el nivel de actividad combinado para seleccionar la distribución adecuada
    let combinedActivityLevel = profile.activityLevel;
    
    // Ajustamos el nivel de actividad considerando la actividad laboral
    if (profile.workActivity === 'very-active' && profile.activityLevel === 'sedentary') {
      combinedActivityLevel = 'moderate';
    } else if (profile.workActivity === 'active' && profile.activityLevel === 'light') {
      combinedActivityLevel = 'moderate';
    } else if (profile.workActivity === 'very-active' && profile.activityLevel === 'active') {
      combinedActivityLevel = 'very-active';
    }
    
    // Obtenemos la distribución base según actividad y objetivo
    const distribution = this.macroDistributions[combinedActivityLevel]?.[profile.goal] || 
                        this.macroDistributions.moderate.maintain;
    
    let { protein: proteinRatio, carbs: carbRatio, fats: fatRatio } = distribution;
    
    // Ajustes finos basados en el peso corporal para proteína
    if (weight > 0) {
      // Proteína mínima: 1.2g por kg para sedentarios, hasta 2.2g por kg para muy activos
      const minProteinPerKg = {
        sedentary: 1.2,
        light: 1.4,
        moderate: 1.6,
        active: 1.8,
        'very-active': 2.0
      };
      
      const minProteinGrams = weight * minProteinPerKg[combinedActivityLevel];
      const minProteinCalories = minProteinGrams * 4;
      const minProteinRatio = minProteinCalories / totalCalories;
      
      // Aseguramos que no bajemos del mínimo de proteína
      if (proteinRatio < minProteinRatio) {
        const difference = minProteinRatio - proteinRatio;
        proteinRatio = minProteinRatio;
        // Reducimos carbohidratos primero, luego grasas
        if (carbRatio > 0.4) {
          carbRatio = Math.max(0.4, carbRatio - difference);
        } else {
          fatRatio = Math.max(0.15, fatRatio - difference);
        }
      }
    }
    
    // Ajustes específicos para personas muy activas
    if (combinedActivityLevel === 'very-active') {
      // Aumentamos carbohidratos para recovery y rendimiento
      if (profile.goal !== 'lose') {
        carbRatio = Math.min(0.65, carbRatio + 0.05);
        fatRatio = Math.max(0.15, fatRatio - 0.05);
      }
    }
    
    // Ajustes para personas sedentarias
    if (combinedActivityLevel === 'sedentary') {
      // Reducimos carbohidratos y aumentamos grasas saludables
      if (profile.goal !== 'gain') {
        carbRatio = Math.max(0.30, carbRatio - 0.05);
        fatRatio = Math.min(0.40, fatRatio + 0.05);
      }
    }
    
    // Normalizamos para asegurar que sume 100%
    const total = proteinRatio + carbRatio + fatRatio;
    proteinRatio /= total;
    carbRatio /= total;
    fatRatio /= total;
    
    // Cálculo final de gramos
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

    // Ajuste por actividad física (más preciso)
    const activityAdjustment = {
      sedentary: 0,
      light: 400,         // Aumentado para mejor hidratación
      moderate: 600,      // Aumentado para ejercicio regular
      active: 800,        // Aumentado para entrenamiento intenso
      'very-active': 1200 // Aumentado para atletas
    };

    waterNeeds += activityAdjustment[profile.activityLevel] || 0;

    // Ajuste por actividad laboral (más preciso)
    const workAdjustment = {
      sedentary: 0,
      light: 300,         // Aumentado para trabajos activos
      moderate: 500,      // Aumentado para trabajos de pie
      active: 700,        // Aumentado para trabajos físicos
      'very-active': 1000 // Aumentado para trabajos muy físicos
    };

    waterNeeds += workAdjustment[profile.workActivity] || 0;

    // Ajuste por objetivo (las personas que quieren perder peso necesitan más agua)
    if (profile.goal === 'lose') {
      waterNeeds += 300;
    }

    return Math.round(waterNeeds);
  }

  /**
   * Calcula las necesidades de fibra basadas en calorías, edad y actividad
   */
  static calculateFiberNeeds(totalCalories: number, profile: UserProfile): number {
    const age = parseInt(profile.age);
    
    // Recomendación mejorada: 14g por cada 1000 calorías, ajustado por actividad
    let fiberNeeds = (totalCalories / 1000) * 14;

    // Ajuste por nivel de actividad (personas más activas necesitan más fibra)
    const activityFiberAdjustment = {
      sedentary: 0,
      light: 2,
      moderate: 4,
      active: 6,
      'very-active': 8
    };

    fiberNeeds += activityFiberAdjustment[profile.activityLevel] || 0;

    // Ajuste por edad
    if (age > 50) {
      fiberNeeds *= 0.9; // Ligeramente menos para personas mayores
    }

    // Ajuste por objetivo
    if (profile.goal === 'lose') {
      fiberNeeds *= 1.2; // Más fibra para saciedad en pérdida de peso
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
   * Obtiene una descripción detallada del cálculo con ambas fórmulas
   */
  static getCalculationDetails(profile: UserProfile): {
    bmr: number;
    bmrHarrisBenedict: number;
    bmrMifflin: number;
    activityMultiplier: number;
    workMultiplier: number;
    goalMultiplier: number;
    totalCalories: number;
    macroDistribution: MacroDistribution;
    explanation: string;
  } {
    const bmrHarrisBenedict = this.calculateBMR(profile, 'harris-benedict');
    const bmrMifflin = this.calculateBMR(profile, 'mifflin');
    const bmr = bmrMifflin; // Usamos Mifflin como principal
    
    const activityMultiplier = this.activityMultipliers[profile.activityLevel] || 1.2;
    const workMultiplier = this.workActivityMultipliers[profile.workActivity] || 1.0;
    const goalMultiplier = this.goalMultipliers[profile.goal] || 1.0;
    const totalCalories = this.calculateTotalCalories(profile);
    
    const macros = this.calculateMacronutrients(totalCalories, profile);
    const macroDistribution = {
      protein: Math.round((macros.protein * 4 / totalCalories) * 100),
      carbs: Math.round((macros.carbs * 4 / totalCalories) * 100),
      fats: Math.round((macros.fats * 9 / totalCalories) * 100)
    };

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
Metabolismo Basal (Mifflin-St Jeor): ${bmrMifflin} calorías
Metabolismo Basal (Harris-Benedict): ${bmrHarrisBenedict} calorías
Actividad física (${activityLabels[profile.activityLevel]}): ×${activityMultiplier}
Actividad laboral (${activityLabels[profile.workActivity]}): ×${workMultiplier}
Objetivo (${goalLabels[profile.goal]}): ×${goalMultiplier}
Total: ${totalCalories} calorías diarias

Distribución de macronutrientes optimizada para ${activityLabels[profile.activityLevel].toLowerCase()}:
• Proteínas: ${macros.protein}g (${macroDistribution.protein}%)
• Carbohidratos: ${macros.carbs}g (${macroDistribution.carbs}%)
• Grasas: ${macros.fats}g (${macroDistribution.fats}%)
    `.trim();

    return {
      bmr,
      bmrHarrisBenedict,
      bmrMifflin,
      activityMultiplier,
      workMultiplier,
      goalMultiplier,
      totalCalories,
      macroDistribution,
      explanation
    };
  }

  /**
   * Obtiene recomendaciones personalizadas según el perfil de actividad
   */
  static getActivityRecommendations(profile: UserProfile): {
    title: string;
    recommendations: string[];
    nutritionTips: string[];
  } {
    const activityLevel = profile.activityLevel;
    const workActivity = profile.workActivity;
    
    const recommendations = {
      sedentary: {
        title: 'Perfil Sedentario',
        recommendations: [
          'Considera aumentar la actividad física gradualmente',
          'Incluye caminatas de 10-15 minutos cada 2 horas',
          'Prioriza ejercicios de fuerza 2-3 veces por semana',
          'Mantén una postura correcta durante el trabajo'
        ],
        nutritionTips: [
          'Reduce carbohidratos simples',
          'Aumenta proteínas para preservar masa muscular',
          'Incluye grasas saludables (aguacate, nueces)',
          'Mantén horarios regulares de comida'
        ]
      },
      light: {
        title: 'Perfil Activo Ligero',
        recommendations: [
          'Mantén consistencia en tu rutina actual',
          'Considera aumentar a 4-5 días de actividad',
          'Incluye ejercicios de resistencia',
          'Varía el tipo de actividades'
        ],
        nutritionTips: [
          'Asegura proteína en cada comida',
          'Incluye carbohidratos antes del ejercicio',
          'Hidrátate adecuadamente',
          'Consume frutas y verduras variadas'
        ]
      },
      moderate: {
        title: 'Perfil Moderadamente Activo',
        recommendations: [
          'Excelente nivel de actividad',
          'Considera periodización en tu entrenamiento',
          'Incluye días de recuperación activa',
          'Monitorea tu progreso regularmente'
        ],
        nutritionTips: [
          'Distribuye carbohidratos alrededor del ejercicio',
          'Asegura 1.6-1.8g de proteína por kg de peso',
          'Incluye snacks post-entrenamiento',
          'Mantén electrolitos balanceados'
        ]
      },
      active: {
        title: 'Perfil Muy Activo',
        recommendations: [
          'Prioriza la recuperación y el descanso',
          'Considera suplementación deportiva',
          'Planifica entrenamientos con periodización',
          'Monitorea signos de sobreentrenamiento'
        ],
        nutritionTips: [
          'Consume 1.8-2.0g de proteína por kg de peso',
          'Incluye carbohidratos complejos en cada comida',
          'Considera timing nutricional pre/post ejercicio',
          'Mantén hidratación constante'
        ]
      },
      'very-active': {
        title: 'Perfil Atlético/Muy Activo',
        recommendations: [
          'Trabajar con profesionales especializados',
          'Monitoreo constante del rendimiento',
          'Recuperación activa y pasiva programada',
          'Evaluaciones médicas regulares'
        ],
        nutritionTips: [
          'Consume 2.0-2.2g de proteína por kg de peso',
          'Carbohidratos: 6-10g por kg de peso',
          'Hidratación: 35-40ml por kg + perdidas por sudor',
          'Considera periodización nutricional'
        ]
      }
    };

    return recommendations[activityLevel] || recommendations.moderate;
  }
}
