import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase.js';

export async function requireTeacherOrAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ success: false, error: 'Unauthorized: Authentication required' });
    return;
  }

  // Si Supabase está configurado, verificar rol en la tabla 'profiles'
  if (supabaseAdmin) {
    try {
      const { data: profile, error } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (!error && profile && ['teacher', 'admin'].includes(profile.role)) {
        return next();
      }

      // Si no tiene rol en Supabase, denegar acceso
      res.status(403).json({
        success: false,
        error: 'Forbidden: Requires teacher or admin role',
      });
      return;
    } catch (err: any) {
      console.error('Error verifying role in middleware:', err.message);
      res.status(500).json({ success: false, error: 'Internal role verification error' });
      return;
    }
  }

  // En modo desarrollo local / demo sin Supabase conectado, permitir acceso para pruebas
  next();
}
