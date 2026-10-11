import {
  SpeakingFeedback,
  SubmissionResultResponse,
} from '@repo/shared';
import { supabaseAdmin } from '../config/supabase.js';
import { storageService } from './storage.service.js';
import { aiEvaluatorService } from './ai-evaluator.service.js';
import { streakService } from './streak.service.js';

export interface ProcessSubmissionInput {
  audioBuffer: Buffer;
  mimeType: string;
  studentId: string;
  promptId: string;
  promptText: string;
  targetGrammar: string;
}

export class SubmissionService {
  /**
   * Orquesta el flujo completo de entrega:
   * 1. Sube audio a Supabase Storage
   * 2. Evalúa con Gemini multimodal
   * 3. Persiste la entrega en la tabla 'submissions'
   * 4. Actualiza la racha del estudiante
   */
  async processSubmission(
    input: ProcessSubmissionInput
  ): Promise<SubmissionResultResponse> {
    const {
      audioBuffer,
      mimeType,
      studentId,
      promptId,
      promptText,
      targetGrammar,
    } = input;

    const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';

    // 1. Subida a Supabase Storage
    const audioUrl = await storageService.uploadAudio(
      audioBuffer,
      studentId,
      extension,
      mimeType
    );

    // 2. Evaluación con IA (Gemini)
    const evaluation = await aiEvaluatorService.evaluateAudio({
      audioBuffer,
      mimeType,
      promptText,
      targetGrammar,
    });

    const { transcript, ...feedbackOnly } = evaluation;
    const feedback: SpeakingFeedback = feedbackOnly;

    // 3. Persistencia en la tabla 'submissions'
    let submissionId = `sub_${Date.now()}`;

    if (supabaseAdmin) {
      const { data, error: insertError } = await supabaseAdmin
        .from('submissions')
        .upsert(
          {
            prompt_id: promptId,
            student_id: studentId,
            audio_url: audioUrl,
            transcript,
            feedback,
          },
          { onConflict: 'prompt_id,student_id' }
        )
        .select('id')
        .single();

      if (insertError) {
        console.error('Error al guardar submission en Supabase:', insertError.message);
      } else if (data) {
        submissionId = data.id;
      }
    }

    // 4. Actualización de racha
    const newStreak = await streakService.updateStudentStreak(studentId);

    return {
      submission_id: submissionId,
      audio_url: audioUrl,
      transcript,
      feedback,
      streak_count: newStreak,
    };
  }
}

export const submissionService = new SubmissionService();
