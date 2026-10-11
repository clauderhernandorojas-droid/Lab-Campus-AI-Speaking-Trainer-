import { useState, useCallback } from 'react';
import {
  submitAudioForEvaluation,
  EvaluateSubmissionResponse,
} from '../api/submissions.api';

export interface UseSubmissionReturn {
  isSubmitting: boolean;
  submitError: string | null;
  result: EvaluateSubmissionResponse | null;
  submitAudio: (
    audioBlob: Blob,
    promptText: string,
    targetGrammar: string,
    promptId?: string,
    currentStreak?: number,
    token?: string | null
  ) => Promise<EvaluateSubmissionResponse | null>;
  resetSubmission: () => void;
}

export function useSubmission(): UseSubmissionReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<EvaluateSubmissionResponse | null>(null);

  const submitAudio = useCallback(
    async (
      audioBlob: Blob,
      promptText: string,
      targetGrammar: string,
      promptId?: string,
      currentStreak = 1,
      token?: string | null
    ) => {
      setIsSubmitting(true);
      setSubmitError(null);

      try {
        const response = await submitAudioForEvaluation({
          audioBlob,
          promptText,
          targetGrammar,
          promptId,
          currentStreak,
          token,
        });
        setResult(response);
        return response;
      } catch (err: any) {
        console.error('Submission error:', err);
        setSubmitError(
          err.message ||
            'Error al enviar el audio. Tu archivo sigue guardado, intenta nuevamente.'
        );
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  const resetSubmission = useCallback(() => {
    setResult(null);
    setSubmitError(null);
    setIsSubmitting(false);
  }, []);

  return {
    isSubmitting,
    submitError,
    result,
    submitAudio,
    resetSubmission,
  };
}
