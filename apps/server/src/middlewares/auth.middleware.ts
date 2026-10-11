import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase.js';

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function authenticateUser(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (token && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin.auth.getUser(token);
      if (!error && data?.user) {
        req.user = {
          id: data.user.id,
          email: data.user.email,
        };
        return next();
      }
    } catch (err) {
      console.warn('Error validando token en authenticateUser:', err);
    }
  }

  // Fallback para pruebas locales o si se envía studentId en body
  const fallbackId =
    (req.body?.studentId as string) ||
    '00000000-0000-0000-0000-000000000001';

  req.user = {
    id: fallbackId,
    email: 'student@example.com',
  };

  next();
}
