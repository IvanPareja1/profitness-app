import { supabase } from './supabase';

export class SyncService {
  static async syncUserData(userId: string) {
    try {
      // Sincronizar perfil
      const profile = localStorage.getItem('userProfile');
      if (profile) {
        await supabase
          .from('user_profiles')
          .upsert({
            user_id: userId,
            ...JSON.parse(profile),
            updated_at: new Date().toISOString()
          });
      }

      // Sincronizar datos de nutrición
      const nutritionKeys = Object.keys(localStorage).filter(key => key.startsWith('nutrition_'));
      for (const key of nutritionKeys) {
        const date = key.replace('nutrition_', '');
        const data = localStorage.getItem(key);
        
        if (data) {
          await supabase
            .from('nutrition_data')
            .upsert({
              user_id: userId,
              date: date,
              ...JSON.parse(data),
              updated_at: new Date().toISOString()
            });
        }
      }

      // Sincronizar configuraciones
      const settingsKeys = ['restDaySettings', 'hydrationReminder', 'healthData'];
      for (const key of settingsKeys) {
        const data = localStorage.getItem(key);
        
        if (data) {
          await supabase
            .from('user_settings')
            .upsert({
              user_id: userId,
              setting_type: key,
              setting_value: JSON.parse(data),
              updated_at: new Date().toISOString()
            });
        }
      }

      console.log('Datos sincronizados exitosamente');
    } catch (error) {
      console.error('Error sincronizando datos:', error);
    }
  }

  static async restoreUserData(userId: string) {
    try {
      // Restaurar perfil
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('google_id', 
 userId)
        .single();

      if (profile) {
        localStorage.setItem('userProfile', JSON.stringify(profile));
      }

      // Restaurar datos de nutrición (últimos 30 días)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: nutritionData } = await supabase
        .from('nutrition_data')
        .select('*')
        .eq('google_id', 
 userId)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (nutritionData) {
        nutritionData.forEach(item => {
          localStorage.setItem(`nutrition_${item.date}`, JSON.stringify(item));
        });
      }

      // Restaurar configuraciones
      const { data: settings } = await supabase
        .from('user_settings')
        .select('*')
        .eq('google_id', userId);


      if (settings) {
        settings.forEach(setting => {
          localStorage.setItem(setting.setting_type, JSON.stringify(setting.setting_value));
        });
      }

      console.log('Datos restaurados exitosamente');
      return true;
    } catch (error) {
      console.error('Error restaurando datos:', error);
      return false;
    }
  }
}