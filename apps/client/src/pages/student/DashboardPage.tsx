import { useState, useEffect, type FC } from 'react';
import { DailyPrompt } from '@repo/shared';
import {
  BookOpen,
  Clock,
  Flame,
  Mic,
  Sparkles,
  LogOut,
  User as UserIcon,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { useSubmission } from '../../hooks/useSubmission';
import { AudioRecorder } from '../../components/audio/AudioRecorder';
import { FeedbackResult } from '../../components/feedback/FeedbackResult';
import { fetchTodayPrompt } from '../../api/teacher.api';

const DEFAULT_PROMPT: DailyPrompt = {
  id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  title: 'My Favorite Childhood Memory',
  prompt_text:
    'Describe a special memory from your childhood. Mention where you were, who you were with, and what made it so memorable.',
  target_grammar: 'Past Simple & "Used to"',
  time_limit_seconds: 60,
  active_date: new Date().toISOString().split('T')[0],
};

export interface DashboardPageProps {
  onSwitchToTeacherView?: () => void;
}

export const DashboardPage: FC<DashboardPageProps> = ({ onSwitchToTeacherView }) => {
  const { user, profile, token, signOut, refreshProfile } = useAuth();
  const [localStreak, setLocalStreak] = useState<number | null>(null);
  const [activePrompt, setActivePrompt] = useState<DailyPrompt>(DEFAULT_PROMPT);

  const displayStreak = localStreak ?? profile?.streak_count ?? 1;

  // Cargar el reto activo desde la API
  useEffect(() => {
    fetchTodayPrompt()
      .then((p) => setActivePrompt(p))
      .catch(() => setActivePrompt(DEFAULT_PROMPT));
  }, []);

  // Hook desacoplado de grabación
  const {
    isRecording,
    isPaused,
    recordingTime,
    audioBlob,
    audioUrl,
    error: recorderError,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    resetRecording,
  } = useAudioRecorder({ maxDurationSeconds: activePrompt.time_limit_seconds });

  // Hook desacoplado de llamada a API
  const {
    isSubmitting,
    submitError,
    result,
    submitAudio,
    resetSubmission,
  } = useSubmission();

  const handleSubmit = async () => {
    if (!audioBlob) return;
    const res = await submitAudio(
      audioBlob,
      activePrompt.prompt_text,
      activePrompt.target_grammar,
      activePrompt.id,
      displayStreak,
      token
    );

    if (res?.streak_count) {
      setLocalStreak(res.streak_count);
      refreshProfile();
    }
  };

  const handlePracticeAgain = () => {
    resetRecording();
    resetSubmission();
  };

  const isStaff = profile?.role === 'teacher' || profile?.role === 'admin';

  return (
    <div className="flex flex-col min-h-screen bg-background text-slate-100 max-w-md mx-auto relative shadow-2xl border-x border-slate-800/40">
      {/* Top Header */}
      <header className="sticky top-0 z-20 backdrop-blur-md bg-background/85 border-b border-slate-800/60 px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Mic className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-white leading-none">
              SpeakingAI
            </h1>
            <p className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">
              {user?.email || 'Estudiante'}
            </p>
          </div>
        </div>

        {/* Acciones de cabecera */}
        <div className="flex items-center space-x-2">
          {/* Botón para alternar a panel de profesor si aplica */}
          {isStaff && onSwitchToTeacherView && (
            <button
              type="button"
              onClick={onSwitchToTeacherView}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center space-x-1 hover:bg-purple-500/30 transition-colors"
            >
              <ShieldAlert className="w-3 h-3" />
              <span>Panel</span>
            </button>
          )}

          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Flame className="w-4 h-4 fill-amber-400" />
            <span className="text-xs font-bold tracking-wide">{displayStreak} DÍAS</span>
          </div>

          <button
            type="button"
            onClick={signOut}
            className="p-1.5 rounded-full text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-5 space-y-6">
        {/* VISTA 1: Resultados del Feedback devueltos por la IA */}
        {result ? (
          <FeedbackResult
            transcript={result.transcript}
            feedback={result.feedback}
            streakCount={result.streak_count || displayStreak}
            onPracticeAgain={handlePracticeAgain}
          />
        ) : (
          /* VISTA 2: Reto diario + Grabador de audio */
          <div className="space-y-6">
            {/* Tarjeta del Reto Activo */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-surface-elevated/80 to-surface/90 border border-slate-700/50 p-6 shadow-xl">
              <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between mb-3.5">
                <span className="text-[11px] font-bold tracking-wide uppercase px-3 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center space-x-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Reto de Hoy</span>
                </span>
                <span className="text-xs text-slate-400 font-medium flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{activePrompt.time_limit_seconds}s máx</span>
                </span>
              </div>

              <h2 className="text-xl font-bold text-white mb-2.5 leading-snug">
                {activePrompt.title}
              </h2>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {activePrompt.prompt_text}
              </p>

              {/* Objetivo Gramatical */}
              <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-indigo-300">
                <BookOpen className="w-4 h-4 flex-shrink-0 text-indigo-400" />
                <span>
                  Objetivo: <strong className="text-white">{activePrompt.target_grammar}</strong>
                </span>
              </div>
            </div>

            {/* Grabador de Audio */}
            <div className="p-6 rounded-3xl bg-surface/70 border border-slate-800/80 shadow-lg">
              <AudioRecorder
                isRecording={isRecording}
                isPaused={isPaused}
                recordingTime={recordingTime}
                maxDurationSeconds={activePrompt.time_limit_seconds}
                audioBlob={audioBlob}
                audioUrl={audioUrl}
                recorderError={recorderError}
                isSubmitting={isSubmitting}
                submitError={submitError}
                onStart={startRecording}
                onPause={pauseRecording}
                onResume={resumeRecording}
                onStop={stopRecording}
                onReset={resetRecording}
                onSubmit={handleSubmit}
              />
            </div>

            {/* Rol de usuario / Identificador */}
            <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center space-x-1.5">
                <UserIcon className="w-3.5 h-3.5 text-indigo-400" />
                <span>
                  Rol:{' '}
                  <strong className="text-slate-200 capitalize">
                    {profile?.role || 'student'}
                  </strong>
                </span>
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                ID: {user?.id.slice(0, 8)}...
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
