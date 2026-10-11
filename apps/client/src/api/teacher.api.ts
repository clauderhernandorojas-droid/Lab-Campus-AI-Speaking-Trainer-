import {
  DailyPrompt,
  CreateDailyPromptInput,
  TeacherStudentSubmissionItem,
} from '@repo/shared';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export async function fetchTodayPrompt(): Promise<DailyPrompt> {
  const response = await fetch(`${API_BASE_URL}/api/prompts/today`);
  if (!response.ok) {
    throw new Error('Error al obtener el reto de hoy');
  }
  const json = await response.json();
  return json.data as DailyPrompt;
}

export async function saveDailyPrompt(
  prompt: CreateDailyPromptInput,
  token?: string | null
): Promise<DailyPrompt> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/prompts`, {
    method: 'POST',
    headers,
    body: JSON.stringify(prompt),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || 'Error al guardar el reto');
  }

  const json = await response.json();
  return json.data as DailyPrompt;
}

export async function fetchTeacherSubmissions(
  date?: string,
  token?: string | null
): Promise<TeacherStudentSubmissionItem[]> {
  const query = date ? `?date=${encodeURIComponent(date)}` : '';
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/teacher/submissions${query}`, {
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || 'Error al cargar entregas de alumnos');
  }

  const json = await response.json();
  return json.data as TeacherStudentSubmissionItem[];
}
