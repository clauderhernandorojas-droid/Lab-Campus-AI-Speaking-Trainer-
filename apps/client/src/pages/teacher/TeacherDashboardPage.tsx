import { useState, useEffect, useRef, type FC } from 'react';
import { TeacherStudentSubmissionItem } from '@repo/shared';
import {
  Users,
  CheckCircle2,
  Clock,
  Play,
  Pause,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Edit3,
  RotateCw,
  Flame,
  Volume2,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { fetchTeacherSubmissions } from '../../api/teacher.api';

export interface TeacherDashboardPageProps {
  onOpenPromptEditor: () => void;
  onSwitchToStudentView: () => void;
}

export const TeacherDashboardPage: FC<TeacherDashboardPageProps> = ({
  onOpenPromptEditor,
  onSwitchToStudentView,
}) => {
  const { token, user } = useAuth();
  const [submissions, setSubmissions] = useState<TeacherStudentSubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

  // Reproductor de audio del profesor
  const [activeAudioUrl, setActiveAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const loadSubmissions = () => {
    setLoading(true);
    fetchTeacherSubmissions(undefined, token)
      .then((data) => setSubmissions(data))
      .catch((err) => console.error('Error fetching submissions:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSubmissions();
  }, [token]);

  const toggleAudio = (url?: string) => {
    if (!url) return;
    if (activeAudioUrl === url && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      setActiveAudioUrl(url);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.onpause = () => setIsPlaying(false);
    }
  }, []);

  const totalStudents = submissions.length;
  const submittedCount = submissions.filter((s) => s.submitted).length;
  const pendingCount = totalStudents - submittedCount;

  return (
    <div className="flex flex-col min-h-screen bg-background text-slate-100 max-w-md mx-auto relative shadow-2xl border-x border-slate-800/40 p-5 space-y-5">
      <audio ref={audioRef} className="hidden" />

      {/* Top Header */}
      <header className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
              Profesor / Admin
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-white mt-1">Panel de Control</h1>
          <p className="text-[11px] text-slate-400">{user?.email}</p>
        </div>

        <button
          type="button"
          onClick={onSwitchToStudentView}
          className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 transition-colors"
        >
          Vista Alumno
        </button>
      </header>

      {/* Tarjeta de Acciones Rápidas */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 flex items-center justify-between shadow-lg">
        <div>
          <p className="text-xs font-bold text-white flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Reto de Speaking Diario</span>
          </p>
          <p className="text-[11px] text-slate-300 mt-0.5">
            Configura la consigna y objetivo gramatical
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenPromptEditor}
          className="py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-indigo-600/30 transition-all active:scale-95"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Editar Reto</span>
        </button>
      </div>

      {/* Métricas del Día */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-surface border border-slate-800 flex flex-col items-center justify-center text-center">
          <Users className="w-4 h-4 text-indigo-400 mb-1" />
          <span className="text-lg font-bold text-white leading-none">{totalStudents}</span>
          <span className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">Alumnos</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-surface border border-slate-800 flex flex-col items-center justify-center text-center">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 mb-1" />
          <span className="text-lg font-bold text-emerald-400 leading-none">{submittedCount}</span>
          <span className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">Entregados</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-surface border border-slate-800 flex flex-col items-center justify-center text-center">
          <Clock className="w-4 h-4 text-amber-400 mb-1" />
          <span className="text-lg font-bold text-amber-400 leading-none">{pendingCount}</span>
          <span className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">Pendientes</span>
        </div>
      </div>

      {/* Lista de Estudiantes */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
            <UserCheck className="w-4 h-4 text-indigo-400" />
            <span>Monitoreo de Entregas Hoy</span>
          </h2>
          <button
            type="button"
            onClick={loadSubmissions}
            className="text-[11px] text-slate-400 hover:text-white flex items-center space-x-1"
          >
            <RotateCw className="w-3 h-3" />
            <span>Actualizar</span>
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Cargando entregas...</div>
        ) : (
          <div className="space-y-3">
            {submissions.map((student) => {
              const isExpanded = expandedStudentId === student.student_id;
              const isPlayingThis =
                activeAudioUrl === student.audio_url && isPlaying;

              return (
                <div
                  key={student.student_id}
                  className="rounded-2xl bg-surface border border-slate-800 overflow-hidden shadow-sm"
                >
                  {/* Fila principal del estudiante */}
                  <div className="p-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white">
                          {student.student_email}
                        </span>
                        <span className="flex items-center space-x-0.5 text-[11px] text-amber-400 font-semibold">
                          <Flame className="w-3 h-3 fill-amber-400" />
                          <span>{student.streak_count}</span>
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {student.submitted ? (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Entregado
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                            Pendiente
                          </span>
                        )}

                        {student.feedback && (
                          <span className="text-[11px] font-bold text-indigo-300">
                            Nota: {student.feedback.overall_score}/100
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Acciones de audio y expandir */}
                    <div className="flex items-center space-x-2">
                      {student.submitted && student.audio_url && (
                        <button
                          type="button"
                          onClick={() => toggleAudio(student.audio_url)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                            isPlayingThis
                              ? 'bg-rose-600 text-white shadow-md'
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                          }`}
                          title={isPlayingThis ? 'Pausar audio' : 'Escuchar respuesta del alumno'}
                        >
                          {isPlayingThis ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4 fill-white ml-0.5" />
                          )}
                        </button>
                      )}

                      {student.submitted && student.feedback && (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedStudentId(
                              isExpanded ? null : student.student_id
                            )
                          }
                          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Ver desglose del feedback"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Panel expandible con el feedback de la IA */}
                  {isExpanded && student.feedback && (
                    <div className="px-4 pb-4 pt-2 border-t border-slate-800/80 bg-slate-900/40 space-y-3 text-xs animate-fadeIn">
                      {student.transcript && (
                        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center space-x-1">
                            <Volume2 className="w-3 h-3 text-indigo-400" />
                            <span>Transcripción del audio:</span>
                          </p>
                          <p className="italic text-slate-200">"{student.transcript}"</p>
                        </div>
                      )}

                      {/* Correcciones del alumno */}
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          Correcciones ({student.feedback.corrections.length}):
                        </p>
                        {student.feedback.corrections.map((c, i) => (
                          <div
                            key={i}
                            className="p-2 rounded-lg bg-surface border border-slate-800 space-y-1"
                          >
                            <p className="text-rose-400 line-through text-[11px]">
                              {c.original}
                            </p>
                            <p className="text-emerald-400 font-semibold text-[11px]">
                              {c.corrected}
                            </p>
                            <p className="text-slate-400 text-[10px]">
                              💡 {c.explanation}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Vocabulario clave */}
                      {student.feedback.key_vocabulary.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">
                            Vocabulario Clave Extraído:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {student.feedback.key_vocabulary.map((v, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[10px] font-medium"
                              >
                                {v.word}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
