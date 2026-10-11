import { Router } from 'express';
import { teacherController } from '../controllers/teacher.controller.js';
import { authenticateUser } from '../middlewares/auth.middleware.js';
import { requireTeacherOrAdmin } from '../middlewares/role.middleware.js';

const router = Router();

// Endpoint de monitoreo: lista de estudiantes con estado y feedback del día
router.get(
  '/submissions',
  authenticateUser,
  requireTeacherOrAdmin,
  teacherController.getSubmissions.bind(teacherController)
);

export default router;
