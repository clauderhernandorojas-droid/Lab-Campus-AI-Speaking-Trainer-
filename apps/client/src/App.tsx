import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { AuthPage } from './pages/auth/AuthPage';
import { DashboardPage } from './pages/student/DashboardPage';
import { TeacherDashboardPage } from './pages/teacher/TeacherDashboardPage';
import { PromptEditorPage } from './pages/teacher/PromptEditorPage';

type ViewState = 'student' | 'teacher' | 'prompt_editor';

export default function App() {
  const { user, profile, loading } = useAuth();
  const [currentView, setCurrentView] = useState<ViewState>('student');

  const isStaff = profile?.role === 'teacher' || profile?.role === 'admin';

  // Si el usuario es profesor o admin, abrir por defecto el panel de profesor
  useEffect(() => {
    if (isStaff) {
      setCurrentView('teacher');
    } else {
      setCurrentView('student');
    }
  }, [isStaff]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-slate-100 max-w-md mx-auto">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
        <p className="text-xs text-slate-400 font-medium">Cargando SpeakingAI...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  // Flujo del Profesor / Admin
  if (isStaff) {
    if (currentView === 'prompt_editor') {
      return (
        <PromptEditorPage
          onBack={() => setCurrentView('teacher')}
          onSaved={() => setCurrentView('teacher')}
        />
      );
    }

    if (currentView === 'teacher') {
      return (
        <TeacherDashboardPage
          onOpenPromptEditor={() => setCurrentView('prompt_editor')}
          onSwitchToStudentView={() => setCurrentView('student')}
        />
      );
    }
  }

  // Flujo del Estudiante (y vista previa del profesor)
  return (
    <DashboardPage
      onSwitchToTeacherView={isStaff ? () => setCurrentView('teacher') : undefined}
    />
  );
}
