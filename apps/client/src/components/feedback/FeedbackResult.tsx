import type { FC } from 'react';
import {
  SpeakingFeedback,
  SentenceCorrection,
  KeyVocabularyItem,
} from '@repo/shared';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  RotateCcw,
  Volume2,
  Layers,
} from 'lucide-react';

export interface FeedbackResultProps {
  transcript: string;
  feedback: SpeakingFeedback;
  streakCount: number;
  onPracticeAgain: () => void;
}

export const FeedbackResult: FC<FeedbackResultProps> = ({
  transcript,
  feedback,
  streakCount,
  onPracticeAgain,
}) => {
  const { overall_score, strengths, corrections, key_vocabulary, fluency_summary } = feedback;

  // Color de puntuación dinámico
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (score >= 60) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  };

  const getBadgeTypeColor = (type: SentenceCorrection['error_type']) => {
    switch (type) {
      case 'grammar':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'vocabulary':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'pronunciation':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'phrasing':
      default:
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
    }
  };

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-6">
      {/* Header con Puntuación y Racha */}
      <div className="p-6 rounded-3xl bg-gradient-to-b from-surface-elevated/90 to-surface/90 border border-slate-700/60 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Evaluación Completa</span>
            </span>
            <h2 className="text-xl font-bold text-white">Resultados de tu Speaking</h2>
            <p className="text-xs text-slate-400">
              ¡Reto del día completado! Racha: <strong className="text-amber-400">{streakCount} días</strong> 🔥
            </p>
          </div>

          {/* Círculo de Score */}
          <div
            className={`w-20 h-20 rounded-2xl border-2 flex flex-col items-center justify-center font-bold shadow-lg ${getScoreColor(
              overall_score
            )}`}
          >
            <span className="text-2xl leading-none font-extrabold">{overall_score}</span>
            <span className="text-[10px] uppercase tracking-wider opacity-80 mt-0.5">/ 100</span>
          </div>
        </div>

        {/* Transcripción Detectada */}
        <div className="mt-5 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Transcripción de tu voz:</span>
          </div>
          <p className="text-xs text-slate-200 italic leading-relaxed">
            "{transcript}"
          </p>
        </div>
      </div>

      {/* Fortalezas */}
      {strengths.length > 0 && (
        <section className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5 px-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Puntos Fuertes</span>
          </h3>
          <div className="space-y-2">
            {strengths.map((strength, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-slate-200 flex items-start space-x-2.5 leading-relaxed"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                <span>{strength}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Correcciones frase por frase */}
      <section className="space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5 px-1">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Correcciones y Sugerencias ({corrections.length})</span>
        </h3>
        {corrections.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 text-center">
            ¡Excelente precisión! No se detectaron errores significativos.
          </div>
        ) : (
          <div className="space-y-3">
            {corrections.map((corr, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-surface border border-slate-800/80 space-y-2.5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getBadgeTypeColor(
                      corr.error_type
                    )}`}
                  >
                    {corr.error_type}
                  </span>
                </div>

                {/* Original vs Corregido */}
                <div className="space-y-1.5 text-xs">
                  <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 line-through">
                    {corr.original}
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-semibold">
                    {corr.corrected}
                  </div>
                </div>

                {/* Explicación pedagógica */}
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
                  💡 {corr.explanation}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Vocabulario Clave para Flashcards */}
      {key_vocabulary.length > 0 && (
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Vocabulario Clave</span>
            </h3>
            <span className="text-[10px] text-indigo-400 flex items-center space-x-1 font-semibold">
              <Layers className="w-3 h-3" />
              <span>Flashcards</span>
            </span>
          </div>

          <div className="grid gap-2.5">
            {key_vocabulary.map((vocab: KeyVocabularyItem, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-surface border border-slate-800/80 space-y-1 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-indigo-300">{vocab.word}</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{vocab.definition}</p>
                <p className="text-xs text-slate-400 italic bg-slate-900/40 p-2 rounded-lg border border-slate-800/60 mt-1">
                  "{vocab.example}"
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Resumen de Fluidez */}
      {fluency_summary && (
        <section className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-1.5">
          <h4 className="text-xs font-bold text-slate-300">Resumen de Fluidez y Ritmo</h4>
          <p className="text-xs text-slate-400 leading-relaxed">{fluency_summary}</p>
        </section>
      )}

      {/* Botón de Práctica Nuevamente */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onPracticeAgain}
          className="w-full py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-white font-semibold text-sm border border-slate-700 shadow-md flex items-center justify-center space-x-2 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Practicar de nuevo</span>
        </button>
      </div>
    </div>
  );
};
