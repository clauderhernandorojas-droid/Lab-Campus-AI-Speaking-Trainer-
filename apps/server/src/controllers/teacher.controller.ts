import { Request, Response } from 'express';
import { teacherService } from '../services/teacher.service.js';

export class TeacherController {
  async getSubmissions(req: Request, res: Response): Promise<void> {
    try {
      const date = req.query.date as string | undefined;
      const submissions = await teacherService.getStudentSubmissions(date);
      res.status(200).json({ success: true, data: submissions });
    } catch (err: any) {
      console.error('Error in TeacherController.getSubmissions:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

export const teacherController = new TeacherController();
