import { useState, useEffect, type FC, type FormEvent } from 'react';
import { DailyPrompt, CreateDailyPromptInput } from '@repo/shared';
import {
  ArrowLeft,
  Sparkles,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { fetchTodayPrompt, saveDailyPrompt } from '../../api/teacher.api';

export interface PromptEditorPageProps {
  onBack: () => void;
  onSaved?: (prompt: DailyPrompt) => void;
}

export const PromptEditorPage: FC<PromptEditorPageProps> = ({ onBack, onSaved }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<CreateDailyPromptInput>({
    title: '',
    prompt_text: '',
    target_grammar: '',
    time_limit_seconds: 60,
    active_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchTodayPrompt()
      .then((prompt) => {
        setFormData({
          title: prompt.title,
          prompt_text: prompt.prompt_text,
          target_grammar: prompt.target_grammar,
          time_limit_seconds: prompt.time_limit_seconds,
          active_date: prompt.active_date,
        });
      })
      .catch((err) => console.warn('Could not load prompt:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);

    try {
      const saved = await saveDailyPrompt(formData, token);
      setSuccess(true);
      if (onSaved) onSaved(saved);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || 'Error al guardar el reto');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-slate-100 max-w-md mx-auto relative shadow-2xl border-x border-slate-800/40 p-5">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors flex items-center space-x-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-semibold">Volver al panel</span>
        </button>
        <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center space-x-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Editor de Retos</span>
        </span>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-2">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          <p className="text-xs text-slate-400">Cargando datos del reto...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>¡Reto guardado con éxito! Visible para todos los estudiantes.</span>
            </div>
          )}

          {/* Fecha activa */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Fecha del Reto</label>
            <input
              type="date"
              required
              value={formData.active_date}
              onChange={(e) => setFormData({ ...formData, active_date: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Título */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Título del Reto</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ej. Describing your ideal vacation"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Consigna */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Consigna / Pregunta Guía
            </label>
            <textarea
              required
              rows={4}
              value={formData.prompt_text}
              onChange={(e) => setFormData({ ...formData, prompt_text: e.target.value })}
              placeholder="Explica detalladamente qué debe responder el estudiante..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* Objetivo gramatical */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Objetivo Gramatical / Enfoque</span>
            </label>
            <input
              type="text"
              required
              value={formData.target_grammar}
              onChange={(e) => setFormData({ ...formData, target_grammar: e.target.value })}
              placeholder="Ej. Second Conditional / Used to / Present Perfect"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Límite de tiempo */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Límite de Tiempo (Segundos)</span>
            </label>
            <select
              value={formData.time_limit_seconds}
              onChange={(e) =>
                setFormData({ ...formData, time_limit_seconds: Number(e.target.value) })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value={45}>45 segundos</option>
              <option value={60}>60 segundos (Recomendado)</option>
              <option value={90}>90 segundos</option>
              <option value={120}>120 segundos (2 minutos)</option>
            </select>
          </div>

          {/* Botón de guardar */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-[0.98] text-white font-semibold text-sm shadow-xl shadow-indigo-600/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Guardando reto...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-white" />
                  <span>Publicar Reto Diario</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
