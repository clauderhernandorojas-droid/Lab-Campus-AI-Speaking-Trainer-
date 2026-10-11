import { z } from 'zod';

// ==========================================
// 1. ROLES & PERMISOS
// ==========================================
export const UserRoleSchema = z.enum(['student', 'teacher', 'admin']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export interface UserProfile {
  id: string;
  role: UserRole;
  streak_count: number;
  last_practice_date: string | null;
  created_at: string;
  updated_at: string;
}

// ==========================================
// 2. DAILY PROMPTS (RETOS DIARIOS)
// ==========================================
export const DailyPromptSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  prompt_text: z.string().min(1, 'Prompt text is required'),
  target_grammar: z.string().min(1, 'Target grammar is required'),
  time_limit_seconds: z.number().int().positive().default(60),
  active_date: z.string(), // YYYY-MM-DD
  created_by: z.string().uuid().nullable().optional(),
  created_at: z.string().optional(),
});

export type DailyPrompt = z.infer<typeof DailyPromptSchema>;

export const CreateDailyPromptDTO = DailyPromptSchema.omit({
  id: true,
  created_at: true,
  created_by: true,
});
export type CreateDailyPromptInput = z.infer<typeof CreateDailyPromptDTO>;

// ==========================================
// 3. AI EVALUATION FEEDBACK (ESTRUCTURA ESTRICTA)
// ==========================================
export const KeyVocabularyItemSchema = z.object({
  word: z.string().describe('Word, collocation, or phrasal verb'),
  definition: z.string().describe('Clear and concise definition'),
  example: z.string().describe('Sample sentence contextualized in topic'),
});
export type KeyVocabularyItem = z.infer<typeof KeyVocabularyItemSchema>;

export const SentenceCorrectionSchema = z.object({
  original: z.string().describe('Original user sentence with error'),
  corrected: z.string().describe('Natural, accurate English sentence'),
  explanation: z.string().describe('Pedagogical explanation of correction'),
  error_type: z.enum(['grammar', 'vocabulary', 'pronunciation', 'phrasing']),
});
export type SentenceCorrection = z.infer<typeof SentenceCorrectionSchema>;

export const SpeakingFeedbackSchema = z.object({
  overall_score: z.number().int().min(0).max(100),
  strengths: z.array(z.string()).min(1),
  corrections: z.array(SentenceCorrectionSchema),
  key_vocabulary: z.array(KeyVocabularyItemSchema),
  fluency_summary: z.string(),
});
export type SpeakingFeedback = z.infer<typeof SpeakingFeedbackSchema>;

export const AIEvaluationResultSchema = SpeakingFeedbackSchema.extend({
  transcript: z.string().describe('Full transcription of user speech'),
});
export type AIEvaluationResult = z.infer<typeof AIEvaluationResultSchema>;

// ==========================================
// 4. SUBMISSIONS (ENTREGAS)
// ==========================================
export const SubmissionSchema = z.object({
  id: z.string().uuid(),
  prompt_id: z.string().uuid(),
  student_id: z.string().uuid(),
  audio_url: z.string().url(),
  transcript: z.string().nullable().optional(),
  feedback: SpeakingFeedbackSchema,
  created_at: z.string(),
});
export type Submission = z.infer<typeof SubmissionSchema>;

// Payload enviado desde el frontend al endpoint de evaluación
export interface AudioSubmissionPayload {
  prompt_id: string;
  audioBlob: Blob;
}

// Respuesta devuelta tras procesar y evaluar el audio
export interface SubmissionResultResponse {
  submission_id: string;
  audio_url: string;
  transcript: string;
  feedback: SpeakingFeedback;
  streak_count: number;
}

// ==========================================
// 5. MONITORING / TEACHER DASHBOARD
// ==========================================
export interface TeacherStudentSubmissionItem {
  student_id: string;
  student_email: string;
  submitted: boolean;
  submission_id?: string;
  audio_url?: string;
  transcript?: string;
  feedback?: SpeakingFeedback;
  submitted_at?: string;
  streak_count: number;
}
