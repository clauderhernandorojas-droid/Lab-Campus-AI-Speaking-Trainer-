import { GoogleGenAI } from '@google/genai';
import {
  AIEvaluationResult,
  AIEvaluationResultSchema,
} from '@repo/shared';

export interface EvaluateAudioInput {
  audioBuffer: Buffer;
  mimeType: string;
  promptText: string;
  targetGrammar: string;
}

/**
 * Normaliza tipos MIME de navegadores móviles para compatibilidad con Gemini
 */
function normalizeAudioMimeType(rawMime: string): string {
  const mime = rawMime.split(';')[0].trim().toLowerCase();
  switch (mime) {
    case 'audio/webm':
    case 'video/webm':
      return 'audio/webm';
    case 'audio/mp4':
    case 'video/mp4':
    case 'audio/m4a':
    case 'audio/x-m4a':
      return 'audio/mp4';
    case 'audio/ogg':
    case 'audio/opus':
      return 'audio/ogg';
    case 'audio/wav':
    case 'audio/x-wav':
      return 'audio/wav';
    case 'audio/aac':
      return 'audio/aac';
    default:
      return 'audio/webm';
  }
}

/**
 * AIEvaluatorService
 * Capa de servicio pura y agnóstica de Express.
 * Recibe el buffer de audio, la consigna y la gramática objetivo,
 * interactúa con Gemini multimodal y retorna el resultado validado con Zod.
 */
export class AIEvaluatorService {
  private client: GoogleGenAI | null = null;
  private modelName: string;

  constructor(apiKey?: string, modelName = 'gemini-2.5-flash') {
    const key = apiKey || process.env.GEMINI_API_KEY;
    this.modelName = process.env.GEMINI_MODEL || modelName;

    if (key) {
      this.client = new GoogleGenAI({ apiKey: key });
    }
  }

  /**
   * Procesa el audio del estudiante y genera retroalimentación pedagógica estricta.
   */
  async evaluateAudio(input: EvaluateAudioInput): Promise<AIEvaluationResult> {
    const { audioBuffer, rawMime, promptText, targetGrammar } = {
      ...input,
      rawMime: input.mimeType,
    };

    const cleanMime = normalizeAudioMimeType(rawMime);

    // Si no hay API key configurada, retornar feedback de desarrollo avisando en consola
    if (!this.client || !process.env.GEMINI_API_KEY) {
      console.warn(
        '⚠️ GEMINI_API_KEY no detectada. Retornando respuesta mock estructurada para desarrollo.'
      );
      return this.getMockEvaluation(promptText, targetGrammar);
    }

    try {
      const base64Audio = audioBuffer.toString('base64');

      const systemInstruction = `You are a supportive, expert native English speaking coach and linguist.
Your goal is to evaluate an English language learner's spoken response to a daily speaking prompt.

Evaluation criteria:
1. Transcript: Transcribe accurately and verbatim what the student spoke.
2. Grammar & Vocabulary: Identify real grammatical or lexical mistakes, especially checking if the student attempted or succeeded in using the target grammar.
3. Sentence-by-sentence corrections: Provide the exact original error fragment, natural correction, pedagogical explanation, and error type ('grammar' | 'vocabulary' | 'pronunciation' | 'phrasing').
4. Key Vocabulary: Extract 2-4 high-value words/collocations relevant to the response, each with a clear definition and an illustrative example sentence for spaced-repetition flashcards.
5. Overall Score: An integer from 0 to 100 based on communicative effectiveness, accuracy, and fluency.
6. Fluency Summary: A concise 2-3 sentence assessment of their pace, rhythm, and goal fulfillment.

Output MUST be strictly valid JSON matching this schema:
{
  "transcript": string,
  "overall_score": number (0-100),
  "strengths": string[],
  "corrections": [
    {
      "original": string,
      "corrected": string,
      "explanation": string,
      "error_type": "grammar" | "vocabulary" | "pronunciation" | "phrasing"
    }
  ],
  "key_vocabulary": [
    {
      "word": string,
      "definition": string,
      "example": string
    }
  ],
  "fluency_summary": string
}`;

      const userPrompt = `DAILY SPEAKING PROMPT:
"${promptText}"

TARGET GRAMMAR / FOCUS:
"${targetGrammar}"

Listen to the student's attached audio recording, transcribe it, evaluate it, and return the structured JSON feedback.`;

      const response = await this.client.models.generateContent({
        model: this.modelName,
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  data: base64Audio,
                  mimeType: cleanMime,
                },
              },
              {
                text: userPrompt,
              },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
          systemInstruction,
          temperature: 0.2,
        },
      });

      const responseText = response.text?.trim();
      if (!responseText) {
        throw new Error('Empty response received from Gemini API');
      }

      // Parsear JSON
      const parsedJson = JSON.parse(responseText);

      // Validación estricta con el esquema Zod compartido
      const validatedFeedback = AIEvaluationResultSchema.parse(parsedJson);
      return validatedFeedback;
    } catch (error: any) {
      console.error('Error en AIEvaluatorService.evaluateAudio:', error);

      // Si falla la llamada externa (ej. cuota excedida en pruebas), retornar fallback seguro con log
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Fallback a mock debido a error en llamada a API de Gemini.');
        return this.getMockEvaluation(promptText, targetGrammar);
      }

      throw new Error(`AI Evaluation failed: ${error.message}`);
    }
  }

  /**
   * Mock estructurado para pruebas locales sin consumir cuota o sin API key
   */
  private getMockEvaluation(promptText: string, targetGrammar: string): AIEvaluationResult {
    return AIEvaluationResultSchema.parse({
      transcript:
        'When I was a child, I was go to the seaside every holiday with my grandparents. We used to swim in the cold water and build huge sandcastles.',
      overall_score: 84,
      strengths: [
        'Clear communicative intent and good storytelling rhythm.',
        'Proper usage of "used to" to describe past repeated habits.',
      ],
      corrections: [
        {
          original: 'I was go to the seaside',
          corrected: 'I went to the seaside / I used to go to the seaside',
          explanation:
            'Use past simple "I went" or "I used to go" for repeated actions in the past. Avoid "was + base verb".',
          error_type: 'grammar',
        },
      ],
      key_vocabulary: [
        {
          word: 'seaside',
          definition: 'A beach or coastal resort area.',
          example: 'We spent our summer holidays at the seaside.',
        },
        {
          word: 'sandcastle',
          definition: 'A small model of a castle made out of wet sand on a beach.',
          example: 'The children built a magnificent sandcastle before the tide came in.',
        },
      ],
      fluency_summary: `The student successfully answered the prompt "${promptText.slice(0, 35)}..." with clear pronunciation and good pace. Minor correction applied to past habitual grammar ("${targetGrammar}").`,
    });
  }
}

export const aiEvaluatorService = new AIEvaluatorService();
