import { Router, Request } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { submissionController } from '../controllers/submission.controller.js';
import { authenticateUser } from '../middlewares/auth.middleware.js';

// MimeTypes válidos provenientes de navegadores móviles y de escritorio
const ALLOWED_AUDIO_MIMES = new Set([
  'audio/webm',
  'video/webm',
  'audio/mp4',
  'video/mp4',
  'audio/ogg',
  'audio/opus',
  'audio/m4a',
  'audio/x-m4a',
  'audio/wav',
  'audio/x-wav',
  'audio/aac',
]);

const audioFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const normalizedMime = file.mimetype.split(';')[0].trim().toLowerCase();
  if (ALLOWED_AUDIO_MIMES.has(normalizedMime) || normalizedMime.startsWith('audio/')) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Unsupported audio format: ${file.mimetype}. Expected webm, mp4, ogg, m4a, or wav.`
      )
    );
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB límite para conexiones móviles
  },
  fileFilter: audioFileFilter,
});

const router = Router();

/**
 * POST /api/submissions/evaluate
 * Endpoint directo para evaluar y persistir el audio subido
 */
router.post(
  '/evaluate',
  upload.single('audio'),
  authenticateUser,
  submissionController.evaluateAudio.bind(submissionController)
);

export default router;
