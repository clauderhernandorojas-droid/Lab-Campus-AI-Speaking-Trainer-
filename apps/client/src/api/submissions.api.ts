import { SpeakingFeedback } from '@repo/shared';

export interface EvaluateSubmissionParams {
  audioBlob: Blob;
  promptText: string;
  targetGrammar: string;
  promptId?: string;
  currentStreak?: number;
  token?: string | null;
}

export interface EvaluateSubmissionResponse {
  submission_id?: string;
  audio_url?: string;
  transcript: string;
  feedback: SpeakingFeedback;
  streak_count: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export async function submitAudioForEvaluation(
  params: EvaluateSubmissionParams
): Promise<EvaluateSubmissionResponse> {
  const {
    audioBlob,
    promptText,
    targetGrammar,
    promptId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    currentStreak = 1,
    token,
  } = params;

  const formData = new FormData();

  // Asignar extensión adecuada según MIME del blob
  const extension = audioBlob.type.includes('mp4') ? 'mp4' : 'webm';
  formData.append('audio', audioBlob, `recording.${extension}`);
  formData.append('promptId', promptId);
  formData.append('promptText', promptText);
  formData.append('targetGrammar', targetGrammar);
  formData.append('currentStreak', String(currentStreak));

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/submissions/evaluate`, {
    method: 'POST',
    body: formData,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.error || `Error en la evaluación: ${response.statusText} (${response.status})`
    );
  }

  const json = await response.json();
  if (!json.success || !json.data) {
    throw new Error('Respuesta inválida del servidor');
  }

  return json.data as EvaluateSubmissionResponse;
}
