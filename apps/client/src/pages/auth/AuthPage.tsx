import { useState, type FC, type FormEvent } from 'react';
import {
  Mic,
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const AuthPage: FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { signIn, signUp, enterDemoMode } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      if (isLogin) {
        const res = await signIn(email, password);
        if (res.error) setAuthError(res.error);
      } else {
        const res = await signUp(email, password);
        if (res.error) {
          setAuthError(res.error);
        } else {
          setSuccessMsg('¡Cuenta creada con éxito! Ya puedes iniciar sesión.');
          setIsLogin(true);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-slate-100 max-w-md mx-auto relative shadow-2xl border-x border-slate-800/40 p-6 justify-center">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center space-y-3 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/30">
          <Mic className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            SpeakingAI
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Entrenamiento diario de speaking en inglés con IA
          </p>
        </div>
      </div>

      {/* Auth Card */}
      <div className="p-6 rounded-3xl bg-surface/90 border border-slate-800 shadow-xl space-y-5">
        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setAuthError(null);
            }}
            className={`py-2 rounded-lg transition-all ${
              isLogin
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setAuthError(null);
            }}
            className={`py-2 rounded-lg transition-all ${
              !isLogin
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Registrarse
          </button>
        </div>

        {/* Notificaciones de error o éxito */}
        {authError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
            {successMsg}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center space-x-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>Correo Electrónico</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center space-x-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Contraseña</span>
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-[0.98] text-white font-semibold text-sm shadow-xl shadow-indigo-600/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <>
                <span>{isLogin ? 'Ingresar a practicar' : 'Crear mi cuenta'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Acceso Rápido / Demo Instantáneo (Sin red) */}
        <div className="pt-3 border-t border-slate-800/80 space-y-2">
          <p className="text-[11px] text-center text-slate-400 font-medium">
            Acceso instantáneo para evaluación local:
          </p>

          <button
            type="button"
            onClick={() => enterDemoMode('student')}
            className="w-full py-2.5 px-3 rounded-xl bg-indigo-600/15 hover:bg-indigo-600/25 text-xs text-indigo-300 font-semibold border border-indigo-500/30 flex items-center justify-center space-x-2 transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Entrar en modo Demo (Estudiante)</span>
          </button>

          <button
            type="button"
            onClick={() => enterDemoMode('teacher')}
            className="w-full py-2.5 px-3 rounded-xl bg-purple-600/15 hover:bg-purple-600/25 text-xs text-purple-300 font-semibold border border-purple-500/30 flex items-center justify-center space-x-2 transition-all active:scale-95"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
            <span>Entrar en modo Demo (Profesor / Admin)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
