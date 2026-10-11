import { useState, useEffect, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { UserProfile } from '@repo/shared';
import { supabase, isSupabaseConfigured } from '../api/supabase';

export interface UseAuthReturn {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  token: string | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  enterDemoMode: (role?: 'student' | 'teacher') => void;
  refreshProfile: () => Promise<void>;
}

const DEMO_STUDENT_PROFILE: UserProfile = {
  id: '00000000-0000-0000-0000-000000000001',
  role: 'student',
  streak_count: 3,
  last_practice_date: new Date().toISOString().split('T')[0],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const DEMO_TEACHER_PROFILE: UserProfile = {
  id: '00000000-0000-0000-0000-000000000099',
  role: 'teacher',
  streak_count: 5,
  last_practice_date: new Date().toISOString().split('T')[0],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export function useAuth(): UseAuthReturn {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Activación síncrona e instantánea del modo Demo sin ninguna llamada a red
  const enterDemoMode = useCallback((role: 'student' | 'teacher' = 'student') => {
    const selectedProfile =
      role === 'teacher' ? DEMO_TEACHER_PROFILE : DEMO_STUDENT_PROFILE;

    const demoUser: User = {
      id: selectedProfile.id,
      email:
        role === 'teacher'
          ? 'profesor.demo@speakingai.com'
          : 'estudiante.demo@speakingai.com',
      app_metadata: {},
      user_metadata: { role },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as User;

    // Guardar en sessionStorage para persistir navegación
    try {
      sessionStorage.setItem('speaking_ai_demo_role', role);
    } catch {
      // Ignorar si sessionStorage no está disponible
    }

    setUser(demoUser);
    setProfile(selectedProfile);
    setSession(null);
    setError(null);
    setLoading(false);
  }, []);

  // Obtener perfil desde la tabla 'profiles' (solo si Supabase está activo)
  const fetchProfile = useCallback(async (userId: string) => {
    if (!isSupabaseConfigured || !supabase) {
      return;
    }

    try {
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!profileError && data) {
        setProfile(data as UserProfile);
      } else {
        setProfile({
          id: userId,
          role: 'student',
          streak_count: 0,
          last_practice_date: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      console.warn('Error fetching Supabase profile:', err.message);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user && isSupabaseConfigured) {
      await fetchProfile(user.id);
    }
  }, [fetchProfile, user]);

  useEffect(() => {
    // 1. Verificar si el usuario ya había activado modo demo en esta sesión
    const savedDemoRole = sessionStorage.getItem('speaking_ai_demo_role');
    if (savedDemoRole === 'teacher' || savedDemoRole === 'student') {
      enterDemoMode(savedDemoRole);
      return;
    }

    // 2. Si Supabase no está configurado, desactivar loader inmediatamente
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    // 3. Inicializar sesión de Supabase con protección contra cuelgues de red (timeout de 2.5s)
    let isCancelled = false;

    const timeoutId = setTimeout(() => {
      if (!isCancelled) {
        setLoading(false);
      }
    }, 2500);

    supabase.auth
      .getSession()
      .then(({ data: { session: initialSession } }) => {
        if (isCancelled) return;
        clearTimeout(timeoutId);
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        if (initialSession?.user) {
          fetchProfile(initialSession.user.id);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Supabase getSession failed, continuing in offline mode:', err);
        clearTimeout(timeoutId);
        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (isCancelled) return;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [enterDemoMode, fetchProfile]);

  const signIn = async (email: string, password: string) => {
    setError(null);

    if (!isSupabaseConfigured || !supabase) {
      // Si no hay Supabase configurado, activar modo demo con el email suministrado
      const customUser: User = {
        id: DEMO_STUDENT_PROFILE.id,
        email,
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as User;

      setUser(customUser);
      setProfile(DEMO_STUDENT_PROFILE);
      return { error: null };
    }

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return { error: signInError.message };
      }

      return { error: null };
    } catch (err: any) {
      const msg = err.message || 'Error de conexión con el servicio de autenticación';
      setError(msg);
      return { error: msg };
    }
  };

  const signUp = async (email: string, password: string) => {
    setError(null);

    if (!isSupabaseConfigured || !supabase) {
      const customUser: User = {
        id: DEMO_STUDENT_PROFILE.id,
        email,
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as User;

      setUser(customUser);
      setProfile(DEMO_STUDENT_PROFILE);
      return { error: null };
    }

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        return { error: signUpError.message };
      }

      return { error: null };
    } catch (err: any) {
      const msg = err.message || 'Error de conexión con el servicio de autenticación';
      setError(msg);
      return { error: msg };
    }
  };

  const signOut = async () => {
    try {
      sessionStorage.removeItem('speaking_ai_demo_role');
    } catch {
      // Ignorar error
    }

    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut().catch(() => {});
    }

    setSession(null);
    setUser(null);
    setProfile(null);
  };

  return {
    session,
    user,
    profile,
    loading,
    error,
    token: session?.access_token || null,
    signIn,
    signUp,
    signOut,
    enterDemoMode,
    refreshProfile,
  };
}
