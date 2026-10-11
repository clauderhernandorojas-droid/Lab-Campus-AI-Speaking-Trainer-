"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmissionSchema = exports.SpeakingFeedbackSchema = exports.SentenceCorrectionSchema = exports.KeyVocabularyItemSchema = exports.CreateDailyPromptDTO = exports.DailyPromptSchema = exports.UserRoleSchema = void 0;
const zod_1 = require("zod");
// ==========================================
// 1. ROLES & PERMISOS
// ==========================================
exports.UserRoleSchema = zod_1.z.enum(['student', 'teacher', 'admin']);
// ==========================================
// 2. DAILY PROMPTS (RETOS DIARIOS)
// ==========================================
exports.DailyPromptSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    title: zod_1.z.string().min(1, 'Title is required'),
    prompt_text: zod_1.z.string().min(1, 'Prompt text is required'),
    target_grammar: zod_1.z.string().min(1, 'Target grammar is required'),
    time_limit_seconds: zod_1.z.number().int().positive().default(60),
    active_date: zod_1.z.string(), // YYYY-MM-DD
    created_by: zod_1.z.string().uuid().nullable().optional(),
    created_at: zod_1.z.string().optional(),
});
exports.CreateDailyPromptDTO = exports.DailyPromptSchema.omit({
    id: true,
    created_at: true,
    created_by: true,
});
// ==========================================
// 3. AI EVALUATION FEEDBACK (ESTRUCTURA ESTRICTA)
// ==========================================
exports.KeyVocabularyItemSchema = zod_1.z.object({
    word: zod_1.z.string().describe('Word, collocation, or phrasal verb'),
    definition: zod_1.z.string().describe('Clear and concise definition'),
    example: zod_1.z.string().describe('Sample sentence contextualized in topic'),
});
exports.SentenceCorrectionSchema = zod_1.z.object({
    original: zod_1.z.string().describe('Original user sentence with error'),
    corrected: zod_1.z.string().describe('Natural, accurate English sentence'),
    explanation: zod_1.z.string().describe('Pedagogical explanation of correction'),
    error_type: zod_1.z.enum(['grammar', 'vocabulary', 'pronunciation', 'phrasing']),
});
exports.SpeakingFeedbackSchema = zod_1.z.object({
    overall_score: zod_1.z.number().int().min(0).max(100),
    strengths: zod_1.z.array(zod_1.z.string()).min(1),
    corrections: zod_1.z.array(exports.SentenceCorrectionSchema),
    key_vocabulary: zod_1.z.array(exports.KeyVocabularyItemSchema),
    fluency_summary: zod_1.z.string(),
});
// ==========================================
// 4. SUBMISSIONS (ENTREGAS)
// ==========================================
exports.SubmissionSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    prompt_id: zod_1.z.string().uuid(),
    student_id: zod_1.z.string().uuid(),
    audio_url: zod_1.z.string().url(),
    transcript: zod_1.z.string().nullable().optional(),
    feedback: exports.SpeakingFeedbackSchema,
    created_at: zod_1.z.string(),
});
