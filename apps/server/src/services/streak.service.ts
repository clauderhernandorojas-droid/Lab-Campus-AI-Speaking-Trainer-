import { supabaseAdmin } from '../config/supabase.js';

export class StreakService {
  /**
   * Calcula y actualiza la racha del estudiante en la base de datos de manera atómica.
   */
  async updateStudentStreak(studentId: string): Promise<number> {
    if (!supabaseAdmin) {
      return 1;
    }

    try {
      const todayStr = new Date().toISOString().split('T')[0];

      // Consultar estado actual del perfil
      const { data: profile, error: fetchError } = await supabaseAdmin
        .from('profiles')
        .select('streak_count, last_practice_date')
        .eq('id', studentId)
        .single();

      if (fetchError || !profile) {
        console.warn('No se pudo obtener el perfil para racha:', fetchError?.message);
        return 1;
      }

      let newStreak = 1;
      const lastDate = profile.last_practice_date;

      if (lastDate === todayStr) {
        // Ya practicó hoy, no incrementa pero mantiene la racha
        return profile.streak_count || 1;
      }

      if (lastDate) {
        const lastDateObj = new Date(lastDate);
        const todayObj = new Date(todayStr);
        const diffDays = Math.floor(
          (todayObj.getTime() - lastDateObj.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === 1) {
          // Practicó ayer: incrementa racha
          newStreak = (profile.streak_count || 0) + 1;
        } else {
          // Se rompió la racha
          newStreak = 1;
        }
      }

      // Actualizar en base de datos
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          streak_count: newStreak,
          last_practice_date: todayStr,
          updated_at: new Date().toISOString(),
        })
        .eq('id', studentId);

      if (updateError) {
        console.error('Error al actualizar racha en profiles:', updateError.message);
      }

      return newStreak;
    } catch (err) {
      console.error('Error in StreakService.updateStudentStreak:', err);
      return 1;
    }
  }
}

export const streakService = new StreakService();
