import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import submissionRoutes from './routes/submission.routes.js';
import promptRoutes from './routes/prompt.routes.js';
import teacherRoutes from './routes/teacher.routes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middlewares globales
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'IA Speaking Trainer API' });
});

// Rutas de la API
app.use('/api/submissions', submissionRoutes);
app.use('/api/prompts', promptRoutes);
app.use('/api/teacher', teacherRoutes);

// Middleware de manejo de errores (captura errores de Multer y de payload)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({ success: false, error: 'Audio file too large. Max size is 15MB.' });
      return;
    }
    res.status(400).json({ success: false, error: `Upload error: ${err.message}` });
    return;
  }

  if (err) {
    console.error('Unhandled Server Error:', err);
    res.status(err.status || 500).json({
      success: false,
      error: err.message || 'Internal server error',
    });
    return;
  }
});

// Iniciar servidor con timeout extendido para conexiones móviles lentas (120s)
const server = app.listen(port, () => {
  console.log(`🚀 Speaking Trainer Server running on http://localhost:${port}`);
});

server.setTimeout(120000); // 2 minutos timeout
