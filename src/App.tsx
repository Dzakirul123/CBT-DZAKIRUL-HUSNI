import React, { useState, useEffect } from 'react';
import { User, Exam, StudentExamSession } from './types';
import { storage } from './services/storage';
import { Header } from './components/common/Header';
import { AuthView } from './components/auth/AuthView';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { ExamInstructionView } from './components/student/ExamInstructionView';
import { ExamEngine } from './components/student/ExamEngine';
import { ExamCompletedView } from './components/student/ExamCompletedView';

type StudentFlowStage = 'instructions' | 'exam' | 'completed';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => storage.getCurrentUser());
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [studentStage, setStudentStage] = useState<StudentFlowStage>('instructions');
  const [completedSession, setCompletedSession] = useState<StudentExamSession | null>(null);

  // Available active exams for students
  const [availableExams, setAvailableExams] = useState<Exam[]>(() => storage.getExams());

  // Handle Login
  const handleLogin = (user: User, token?: string) => {
    storage.setCurrentUser(user);
    setCurrentUser(user);

    if (user.role === 'siswa') {
      if (token) {
        const found = storage.getExamByToken(token);
        if (found) {
          setActiveExam(found);

          // Check if student already completed this exam
          const existing = storage.getStudentSession(found.id, user.id);
          if (existing && existing.status === 'submitted') {
            setCompletedSession(existing);
            setStudentStage('completed');
          } else {
            setStudentStage('instructions');
          }
        }
      }
    }
  };

  // Handle Logout
  const handleLogout = () => {
    storage.setCurrentUser(null);
    setCurrentUser(null);
    setActiveExam(null);
    setCompletedSession(null);
    setStudentStage('instructions');
  };

  // Student starts the test
  const handleStartExam = () => {
    setStudentStage('exam');
  };

  // Student finishes exam
  const handleFinishExam = (session: StudentExamSession) => {
    setCompletedSession(session);
    setStudentStage('completed');
  };

  // Quick switch to test student mode from teacher dashboard
  const handleTestAsStudentFromTeacher = (token: string) => {
    const studentUser: User = {
      id: 'student-test',
      name: 'Ahmad Fauzi (Siswa Uji Coba)',
      username: 'ahmad_test',
      role: 'siswa',
      nisn: '0121234567',
      className: 'Kelas VI-A',
      schoolName: currentUser?.schoolName || 'MI Negeri 1 Paser',
    };

    handleLogin(studentUser, token);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Header Bar (hidden in active exam mode) */}
      <Header
        user={currentUser}
        onLogout={handleLogout}
        activeExam={activeExam}
        isExamMode={currentUser?.role === 'siswa' && studentStage === 'exam'}
      />

      {/* Main View Router */}
      <div className="flex-1 flex flex-col">
        {!currentUser ? (
          /* 1. AUTH / LOGIN VIEW */
          <AuthView onLogin={handleLogin} availableExams={availableExams} />
        ) : currentUser.role === 'guru' ? (
          /* 2. TEACHER / PROCTOR DASHBOARD */
          <TeacherDashboard
            currentUser={currentUser}
            onLogout={handleLogout}
            onTakeAsStudent={handleTestAsStudentFromTeacher}
          />
        ) : (
          /* 3. STUDENT WORKFLOW */
          activeExam ? (
            studentStage === 'instructions' ? (
              <ExamInstructionView
                exam={activeExam}
                student={currentUser}
                onStartExam={handleStartExam}
                onCancel={handleLogout}
              />
            ) : studentStage === 'exam' ? (
              <ExamEngine
                exam={activeExam}
                student={currentUser}
                onFinishExam={handleFinishExam}
              />
            ) : (
              completedSession && (
                <ExamCompletedView
                  session={completedSession}
                  exam={activeExam}
                  onReturnToHome={handleLogout}
                />
              )
            )
          ) : (
            /* Fallback if no exam selected */
            <div className="min-h-[80vh] flex items-center justify-center p-6 text-center">
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-md w-full">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Token Belum Dipilih</h3>
                <p className="text-xs text-slate-600 mb-6">
                  Silakan masukkan kode token ujian pada halaman login untuk memulai pengerjaan soal.
                </p>
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl"
                >
                  Kembali ke Halaman Masuk
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
