import { Request, Response } from 'express';
import { CreateDailyPromptDTO } from '@repo/shared';
import { promptService } from '../services/prompt.service.js';

export class PromptController {
  async getToday(_req: Request, res: Response): Promise<void> {
    try {
      const prompt = await promptService.getTodayPrompt();
      res.status(200).json({ success: true, data: prompt });
    } catch (err: any) {
      console.error('Error in PromptController.getToday:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  async savePrompt(req: Request, res: Response): Promise<void> {
    try {
      const parsedBody = CreateDailyPromptDTO.parse(req.body);
      const prompt = await promptService.createOrUpdatePrompt(
        parsedBody,
        req.user?.id
      );
      res.status(200).json({ success: true, data: prompt });
    } catch (err: any) {
      console.error('Error in PromptController.savePrompt:', err);
      res.status(400).json({ success: false, error: err.message });
    }
  }
}

export const promptController = new PromptController();
