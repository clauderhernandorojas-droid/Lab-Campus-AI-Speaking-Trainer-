import { useRef, useState, useEffect, type FC } from 'react';
import {
  Mic,
  Square,
  Pause,
  Play,
  RotateCcw,
  Send,
  Loader2,
  AlertCircle,
  Volume2,
} from 'lucide-react';

export interface AudioRecorderProps {
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  maxDurationSeconds?: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  recorderError: string | null;
  isSubmitting: boolean;
  submitError: string | null;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onReset: () => void;
  onSubmit: () => void;
}

export const AudioRecorder: FC<AudioRecorderProps> = ({
  isRecording,
  isPaused,
  recordingTime,
  maxDurationSeconds = 60,
  audioBlob: _audioBlob,
  audioUrl,
  recorderError,
  isSubmitting,
  submitError,
  onStart,
  onPause,
  onResume,
  onStop,
  onReset,
  onSubmit,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Formato mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const remainingSeconds = Math.max(0, maxDurationSeconds - recordingTime);
  const progressPercent = (recordingTime / maxDurationSeconds) * 100;

  // Manejo de reproducción de audio
  const togglePlayAudio = () => {
    if (!audioPlayerRef.current) return;
    if (isPlayingAudio) {
      audioPlayerRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  useEffect(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.onended = () => setIsPlayingAudio(false);
      audioPlayerRef.current.onpause = () => setIsPlayingAudio(false);
    }
  }, [audioUrl]);

  return (
    <div className="w-full flex flex-col items-center space-y-4">
      {/* Alerta de error del micrófono */}
      {recorderError && (
        <div className="w-full p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-2.5 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
          <p className="leading-relaxed">{recorderError}</p>
        </div>
      )}

      {/* Alerta de error de envío por red (NO borra el audio) */}
      {submitError && (
        <div className="w-full p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-2.5 text-xs text-amber-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-400 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold mb-1">No se pudo enviar el audio</p>
            <p className="leading-relaxed text-amber-200/90">{submitError}</p>
          </div>
        </div>
      )}

      {/* ESTADO 1: Grabando o Pausado */}
      {isRecording && (
        <div className="w-full flex flex-col items-center space-y-4 py-2">
          {/* Barra de progreso de tiempo límite */}
          <div className="w-full space-y-1.5">
            <div className="flex justify-between text-xs font-semibold px-1">
              <span className="text-slate-300 flex items-center space-x-1.5">
                <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-rose-500 animate-ping'}`} />
                <span>{isPaused ? 'Pausado' : 'Grabando...'}</span>
              </span>
              <span className="text-indigo-300 font-mono">
                {formatTime(recordingTime)} / {formatTime(maxDurationSeconds)}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-rose-500 transition-all duration-300 ease-linear rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-right text-slate-400 font-mono">
              Quedan {remainingSeconds}s
            </p>
          </div>

          {/* Botones de control durante grabación */}
          <div className="flex items-center justify-center space-x-6 pt-2">
            {/* Pausar / Reanudar */}
            <button
              type="button"
              onClick={isPaused ? onResume : onPause}
              className="p-3.5 rounded-full bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 active:scale-95 transition-all shadow-md"
              title={isPaused ? 'Reanudar grabación' : 'Pausar grabación'}
            >
              {isPaused ? <Play className="w-5 h-5 text-indigo-400" /> : <Pause className="w-5 h-5" />}
            </button>

            {/* Detener grabación */}
            <button
              type="button"
              onClick={onStop}
              className="p-4 rounded-full bg-rose-600 hover:bg-rose-500 text-white active:scale-95 transition-all shadow-lg shadow-rose-600/30 flex items-center justify-center"
              title="Detener y revisar"
            >
              <Square className="w-6 h-6 fill-white" />
            </button>
          </div>
        </div>
      )}

      {/* ESTADO 2: Audio grabado listo para revisión */}
      {!isRecording && audioUrl && (
        <div className="w-full space-y-4">
          <audio ref={audioPlayerRef} src={audioUrl} className="hidden" preload="auto" />

          {/* Reproductor de audio visual minimalista */}
          <div className="p-4 rounded-2xl bg-surface border border-slate-800 shadow-md flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={togglePlayAudio}
                className="w-12 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 transition-all"
                title={isPlayingAudio ? 'Pausar reproducción' : 'Escuchar mi grabación'}
              >
                {isPlayingAudio ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                )}
              </button>
              <div>
                <p className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Tu respuesta grabada</span>
                </p>
                <p className="text-[11px] text-slate-400 font-mono">
                  Duración: {formatTime(recordingTime)}
                </p>
              </div>
            </div>

            {/* Botón para descartar y grabar de nuevo */}
            <button
              type="button"
              onClick={onReset}
              disabled={isSubmitting}
              className="p-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 active:scale-95 transition-all disabled:opacity-50"
              title="Grabar de nuevo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Botón de Enviar o Reintentar */}
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-[0.98] text-white font-semibold text-sm shadow-xl shadow-indigo-600/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Analizando con IA...</span>
              </>
            ) : submitError ? (
              <>
                <RotateCcw className="w-4 h-4 text-white" />
                <span>Reintentar entrega</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-white" />
                <span>Entregar para evaluación</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* ESTADO 3: Estado inicial (esperando pulsar grabar) */}
      {!isRecording && !audioUrl && (
        <div className="flex flex-col items-center space-y-3 py-2">
          <button
            type="button"
            onClick={onStart}
            disabled={isSubmitting}
            className="group relative w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 hover:shadow-indigo-500/40 active:scale-95 transition-all"
            aria-label="Iniciar grabación de speaking"
          >
            <span className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping group-hover:bg-indigo-500/30" />
            <Mic className="w-8 h-8 text-white relative z-10" />
          </button>
          <p className="text-xs text-slate-400 font-medium">
            Toca el micrófono para comenzar (60s máx.)
          </p>
        </div>
      )}
    </div>
  );
};
