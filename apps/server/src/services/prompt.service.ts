import { DailyPrompt, CreateDailyPromptInput } from '@repo/shared';
import { supabaseAdmin } from '../config/supabase.js';

const DEFAULT_PROMPT: DailyPrompt = {
  id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  title: 'My Favorite Childhood Memory',
  prompt_text:
    'Describe a special memory from your childhood. Mention where you were, who you were with, and what made it so memorable.',
  target_grammar: 'Past Simple & "Used to"',
  time_limit_seconds: 60,
  active_date: new Date().toISOString().split('T')[0],
};

export class PromptService {
  /**
   * Obtiene el reto del día actual. Si no existe, retorna el más reciente o el predeterminado.
   */
  async getTodayPrompt(): Promise<DailyPrompt> {
    const todayStr = new Date().toISOString().split('T')[0];

    if (!supabaseAdmin) {
      return { ...DEFAULT_PROMPT, active_date: todayStr };
    }

    try {
      // Buscar reto con la fecha de hoy
      const { data, error } = await supabaseAdmin
        .from('daily_prompts')
        .select('*')
        .eq('active_date', todayStr)
        .maybeSingle();

      if (!error && data) {
        return data as DailyPrompt;
      }

      // Si no hay reto para hoy, traer el último creado
      const { data: latest, error: latestError } = await supabaseAdmin
        .from('daily_prompts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!latestError && latest) {
        return latest as DailyPrompt;
      }

      return { ...DEFAULT_PROMPT, active_date: todayStr };
    } catch (err: any) {
      console.error('Error in PromptService.getTodayPrompt:', err.message);
      return { ...DEFAULT_PROMPT, active_date: todayStr };
    }
  }

  /**
   * Crea o actualiza el reto diario para una fecha específica.
   */
  async createOrUpdatePrompt(
    input: CreateDailyPromptInput,
    userId?: string
  ): Promise<DailyPrompt> {
    if (!supabaseAdmin) {
      return {
        id: `prompt_${Date.now()}`,
        ...input,
        created_by: userId || null,
        created_at: new Date().toISOString(),
      };
    }

    const { data, error } = await supabaseAdmin
      .from('daily_prompts')
      .upsert(
        {
          title: input.title,
          prompt_text: input.prompt_text,
          target_grammar: input.target_grammar,
          time_limit_seconds: input.time_limit_seconds || 60,
          active_date: input.active_date,
          created_by: userId || null,
        },
        { onConflict: 'active_date' }
      )
      .select('*')
      .single();

    if (error) {
      console.error('Error al guardar prompt en Supabase:', error.message);
      throw new Error(`Failed to save daily prompt: ${error.message}`);
    }

    return data as DailyPrompt;
  }
}

export const promptService = new PromptService();
