import { Router } from 'express';
import { promptController } from '../controllers/prompt.controller.js';
import { authenticateUser } from '../middlewares/auth.middleware.js';
import { requireTeacherOrAdmin } from '../middlewares/role.middleware.js';

const router = Router();

// Endpoint público/autenticado para consultar el reto activo
router.get('/today', promptController.getToday.bind(promptController));

// Endpoint protegido para crear o editar el reto del día (solo profesores / admins)
router.post(
  '/',
  authenticateUser,
  requireTeacherOrAdmin,
  promptController.savePrompt.bind(promptController)
);

export default router;
