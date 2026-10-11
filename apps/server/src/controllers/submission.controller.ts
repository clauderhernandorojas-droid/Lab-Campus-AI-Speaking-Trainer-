import { Request, Response } from 'express';
import { submissionService } from '../services/submission.service.js';

export class SubmissionController {
  /**
   * Endpoint directo para evaluar y persistir el audio subido por el estudiante.
   */
  async evaluateAudio(req: Request, res: Response): Promise<void> {
    try {
      const audioFile = req.file;

      if (!audioFile) {
        res.status(400).json({
          success: false,
          error: 'Audio file is required for evaluation',
        });
        return;
      }

      const promptText = (req.body.promptText as string) || 'Describe your daily routine';
      const targetGrammar = (req.body.targetGrammar as string) || 'Present Simple & Frequency Adverbs';
      const promptId =
        (req.body.promptId as string) || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
      const studentId = req.user?.id || '00000000-0000-0000-0000-000000000001';

      // Delegar en el servicio de entregas (Storage + AI + DB + Racha)
      const result = await submissionService.processSubmission({
        audioBuffer: audioFile.buffer,
        mimeType: audioFile.mimetype,
        studentId,
        promptId,
        promptText,
        targetGrammar,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('Error in SubmissionController.evaluateAudio:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'An error occurred while evaluating audio',
      });
    }
  }
}

export const submissionController = new SubmissionController();
