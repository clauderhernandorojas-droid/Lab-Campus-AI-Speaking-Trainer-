import { TeacherStudentSubmissionItem } from '@repo/shared';
import { supabaseAdmin } from '../config/supabase.js';

export class TeacherService {
  /**
   * Obtiene la lista de estudiantes con su estado de entrega del día,
   * audio y feedback generado por la IA.
   */
  async getStudentSubmissions(
    date?: string
  ): Promise<TeacherStudentSubmissionItem[]> {
    const targetDate = date || new Date().toISOString().split('T')[0];

    if (!supabaseAdmin) {
      return this.getMockTeacherSubmissions();
    }

    try {
      // 1. Obtener el prompt del día
      const { data: prompt } = await supabaseAdmin
        .from('daily_prompts')
        .select('id')
        .eq('active_date', targetDate)
        .maybeSingle();

      // 2. Obtener lista de estudiantes
      const { data: students, error: studentError } = await supabaseAdmin
        .from('profiles')
        .select('id, streak_count, created_at')
        .eq('role', 'student');

      if (studentError || !students) {
        console.warn('Error al obtener perfiles de estudiantes:', studentError?.message);
        return this.getMockTeacherSubmissions();
      }

      // 3. Obtener entregas para este prompt si existe
      let submissionsMap = new Map<string, any>();
      if (prompt) {
        const { data: subs } = await supabaseAdmin
          .from('submissions')
          .select('*')
          .eq('prompt_id', prompt.id);

        if (subs) {
          subs.forEach((s) => submissionsMap.set(s.student_id, s));
        }
      }

      // 4. Mapear y combinar
      return students.map((std, idx) => {
        const sub = submissionsMap.get(std.id);
        return {
          student_id: std.id,
          student_email: `student${idx + 1}@example.com`,
          submitted: Boolean(sub),
          submission_id: sub?.id,
          audio_url: sub?.audio_url,
          transcript: sub?.transcript,
          feedback: sub?.feedback,
          submitted_at: sub?.created_at,
          streak_count: std.streak_count || 0,
        };
      });
    } catch (err: any) {
      console.error('Error in TeacherService.getStudentSubmissions:', err.message);
      return this.getMockTeacherSubmissions();
    }
  }

  /**
   * Mock estructurado para pruebas pedagógicas y demostración inmediata
   */
  private getMockTeacherSubmissions(): TeacherStudentSubmissionItem[] {
    return [
      {
        student_id: '00000000-0000-0000-0000-000000000001',
        student_email: 'alex.rivera@example.com',
        submitted: true,
        submission_id: 'sub-001',
        audio_url:
          'https://actions.google.com/sounds/v1/speech/person_talking_english.ogg',
        transcript:
          'When I was a child, I was go to the seaside every holiday with my grandparents. We used to swim in the cold water and build huge sandcastles.',
        feedback: {
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
              example:
                'The children built a magnificent sandcastle before the tide came in.',
            },
          ],
          fluency_summary:
            'Good communicative pace with minimal pauses. Handled past narrative accurately.',
        },
        submitted_at: new Date().toISOString(),
        streak_count: 4,
      },
      {
        student_id: '00000000-0000-0000-0000-000000000002',
        student_email: 'maria.garcia@example.com',
        submitted: false,
        streak_count: 2,
      },
      {
        student_id: '00000000-0000-0000-0000-000000000003',
        student_email: 'david.chen@example.com',
        submitted: false,
        streak_count: 0,
      },
    ];
  }
}

export const teacherService = new TeacherService();
