import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Exam, StudentExamSession, ViolationLog, ViolationType, User } from '../../types';
import { SecurityService } from '../../services/security';
import { storage } from '../../services/storage';
import { ViolationAlertModal } from './ViolationAlertModal';
import { SuspensionScreen } from './SuspensionScreen';
import { SubmitConfirmModal } from './SubmitConfirmModal';
import { 
  Clock, 
  Maximize, 
  ShieldCheck, 
  CheckCircle, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  Send, 
  HelpCircle,
  Menu,
  X,
  Type,
  Lock,
  Wifi,
  CloudCheck
} from 'lucide-react';

interface ExamEngineProps {
  exam: Exam;
  student: User;
  onFinishExam: (session: StudentExamSession) => void;
}

export const ExamEngine: React.FC<ExamEngineProps> = ({
  exam,
  student,
  onFinishExam,
}) => {
  // Session initialization / restoration from storage
  const [session, setSession] = useState<StudentExamSession>(() => {
    const existing = storage.getStudentSession(exam.id, student.id);
    if (existing && existing.status !== 'submitted') {
      return existing;
    }

    const now = new Date();
    const deadline = new Date(now.getTime() + exam.settings.durationMinutes * 60 * 1000);

    const newSession: StudentExamSession = {
      id: `sess-${Date.now()}-${student.id.substring(0, 5)}`,
      examId: exam.id,
      studentId: student.id,
      studentName: student.name,
      studentNisn: student.nisn || '0000000000',
      className: student.className || 'Kelas IX',
      tokenUsed: exam.token,
      startedAt: now.toISOString(),
      deadlineAt: deadline.toISOString(),
      status: 'in_progress',
      answers: {},
      violationsCount: 0,
      violationLogs: [],
    };

    return storage.saveSession(newSession);
  });

  // Active question index
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Questions array (shuffled if configured)
  const [questions, setQuestions] = useState(exam.questions);

  // Autosave indicator state
  const [lastSavedTime, setLastSavedTime] = useState<string>('Baru saja');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Timer state (seconds remaining)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    const deadline = new Date(session.deadlineAt).getTime();
    const now = Date.now();
    const diff = Math.max(0, Math.floor((deadline - now) / 1000));
    return diff > 0 ? diff : exam.settings.durationMinutes * 60;
  });

  // Security & violation states
  const [currentViolation, setCurrentViolation] = useState<ViolationLog | null>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false);
  const [isSuspended, setIsSuspended] = useState<boolean>(session.status === 'suspended');

  // Confirmation modal state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);

  // Font size scaling: 'sm' | 'base' | 'lg'
  const [fontSizeScale, setFontSizeScale] = useState<'sm' | 'base' | 'lg'>('base');

  // Mobile sidebar palette toggle
  const [isPaletteOpenMobile, setIsPaletteOpenMobile] = useState<boolean>(false);

  // Ref to track if exam is active to prevent redundant violation triggers during submit
  const isExamActiveRef = useRef(true);
  const isHandlingViolationRef = useRef(false);

  // Request fullscreen on mount
  useEffect(() => {
    SecurityService.requestFullscreen().catch(() => {});
  }, []);

  // Sync session state to storage helper
  const persistSession = useCallback((updated: StudentExamSession) => {
    setIsSaving(true);
    storage.saveSession(updated);
    setSession(updated);
    setLastSavedTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    setTimeout(() => setIsSaving(false), 300);
  }, []);

  // Record a violation handler
  const triggerViolation = useCallback((type: ViolationType, detail?: string) => {
    if (!isExamActiveRef.current || isHandlingViolationRef.current || isSuspended) {
      return;
    }

    isHandlingViolationRef.current = true;

    setSession(prev => {
      const nextCount = prev.violationsCount + 1;
      const log = SecurityService.createViolationLog(type, nextCount, detail);
      const updatedLogs = [log, ...prev.violationLogs];

      const maxLimit = exam.settings.maxViolations || 3;
      const willSuspend = nextCount >= maxLimit;

      const updatedSession: StudentExamSession = {
        ...prev,
        violationsCount: nextCount,
        violationLogs: updatedLogs,
        status: willSuspend ? 'suspended' : 'in_progress',
      };

      storage.saveSession(updatedSession);

      if (willSuspend) {
        setIsSuspended(true);
        setIsAlertModalOpen(false);
      } else {
        setCurrentViolation(log);
        setIsAlertModalOpen(true);
      }

      return updatedSession;
    });

    // Reset flag after delay
    setTimeout(() => {
      isHandlingViolationRef.current = false;
    }, 1500);
  }, [exam.settings.maxViolations, isSuspended]);

  // FULL PROCTORING EVENT LISTENERS: Page Visibility, Window Blur, Fullscreen, Shortcuts
  useEffect(() => {
    // 1. Page Visibility API
    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerViolation('tab_switch', 'Halaman diminimalkan atau siswa beralih ke tab browser lain.');
      }
    };

    // 2. Fullscreen change
    const handleFullscreenChange = () => {
      if (!SecurityService.isFullscreen()) {
        triggerViolation('exit_fullscreen', 'Layar penuh dibatalkan oleh pengguna.');
      }
    };

    // 3. Window blur / focus
    const handleWindowBlur = () => {
      triggerViolation('window_blur', 'Kursor/fokus meninggalkan jendela browser (Alt+Tab atau aplikasi latar belakang).');
    };

    // 4. Keyboard Shortcuts Prevention (F12, Ctrl+C, Ctrl+V, Ctrl+U, PrintScreen, etc.)
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12 or DevTools inspection
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j'))) {
        e.preventDefault();
        triggerViolation('forbidden_key', 'Percobaan membuka alat pengembang (DevTools/F12).');
        return;
      }

      // Copy / Paste / Cut prevention
      if (e.ctrlKey && (e.key === 'c' || e.key === 'C' || e.key === 'v' || e.key === 'V' || e.key === 'u' || e.key === 'U' || e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        triggerViolation('forbidden_key', `Percobaan kombinasi tombol Ctrl+${e.key.toUpperCase()} dicegah.`);
        return;
      }

      // PrintScreen
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        triggerViolation('forbidden_key', 'Percobaan tangkapan layar (PrintScreen) dicegah.');
        return;
      }
    };

    // 5. Context menu (Right Click) prevention
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [triggerViolation]);

  // COUNTDOWN TIMER EFFECT
  useEffect(() => {
    if (isSuspended) return; // Pause timer or keep ticking

    const interval = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSuspended]);

  // AUTO-SUBMIT WHEN TIME EXPIRES
  const handleTimeExpired = () => {
    isExamActiveRef.current = false;
    SecurityService.exitFullscreen();

    const finalizedSession: StudentExamSession = {
      ...session,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
    };

    const calculated = storage.calculateSessionScore(finalizedSession, exam);
    finalizedSession.calculatedScore = calculated.totalScore;
    finalizedSession.isPassed = calculated.isPassed;

    storage.saveSession(finalizedSession);
    onFinishExam(finalizedSession);
  };

  // MANUAL FINAL SUBMIT
  const handleFinalSubmit = () => {
    isExamActiveRef.current = false;
    SecurityService.exitFullscreen();

    const finalizedSession: StudentExamSession = {
      ...session,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
    };

    const calculated = storage.calculateSessionScore(finalizedSession, exam);
    finalizedSession.calculatedScore = calculated.totalScore;
    finalizedSession.isPassed = calculated.isPassed;

    storage.saveSession(finalizedSession);
    onFinishExam(finalizedSession);
  };

  // Resume after violation alert modal
  const handleResumeFromAlert = async () => {
    setIsAlertModalOpen(false);
    await SecurityService.requestFullscreen().catch(() => {});
  };

  // Resume after supervisor unlocked suspension
  const handleUnlockedFromSuspension = async () => {
    setIsSuspended(false);
    const fresh = storage.getSession(session.id);
    if (fresh) {
      setSession(fresh);
    }
    await SecurityService.requestFullscreen().catch(() => {});
  };

  // Question Answer Change Handler (AUTOSAVE TRIGGER)
  const handleAnswerChange = (qId: string, answerValue: string | boolean) => {
    const existingAns = session.answers[qId];
    const updatedAnswers = {
      ...session.answers,
      [qId]: {
        questionId: qId,
        answer: answerValue,
        flagged: existingAns?.flagged ?? false,
        answeredAt: new Date().toISOString(),
      },
    };

    const updatedSession: StudentExamSession = {
      ...session,
      answers: updatedAnswers,
    };

    persistSession(updatedSession);
  };

  // Toggle Ragu-ragu (Flagged)
  const handleToggleFlag = (qId: string) => {
    const existingAns = session.answers[qId] || {
      questionId: qId,
      answer: '',
      flagged: false,
      answeredAt: new Date().toISOString(),
    };

    const updatedAnswers = {
      ...session.answers,
      [qId]: {
        ...existingAns,
        flagged: !existingAns.flagged,
      },
    };

    const updatedSession: StudentExamSession = {
      ...session,
      answers: updatedAnswers,
    };

    persistSession(updatedSession);
  };

  // Helper stats for palette & submit
  const currentQ = questions[currentIndex];
  const currentAnswer = currentQ ? session.answers[currentQ.id] : undefined;

  const answeredCount = Object.values(session.answers).filter(a => a.answer !== '' && a.answer !== undefined).length;
  const flaggedCount = Object.values(session.answers).filter(a => a.flagged).length;
  const unansweredCount = questions.length - answeredCount;

  // Format MM:SS
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTimer = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isTimerCritical = secondsRemaining < 300; // < 5 mins

  // Font size classes
  const textSizeClass =
    fontSizeScale === 'sm' ? 'text-xs' : fontSizeScale === 'lg' ? 'text-base' : 'text-sm';
  const headingSizeClass =
    fontSizeScale === 'sm' ? 'text-sm' : fontSizeScale === 'lg' ? 'text-lg' : 'text-base';

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col exam-select-none">
      {/* EXAM KIOSK TOP NAVIGATION BAR */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
          {/* Left info: Student & Subject */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              CBT
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 leading-tight truncate max-w-[150px] sm:max-w-xs">
                {exam.title}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <span className="font-medium text-slate-700">{student.name}</span>
                <span className="hidden sm:inline">· {student.nisn}</span>
              </div>
            </div>
          </div>

          {/* Center: Autosave Status */}
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
            <span className={`w-2 h-2 rounded-full ${isSaving ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
            <span>{isSaving ? 'Menyimpan...' : `Tersimpan otomatis (${lastSavedTime})`}</span>
          </div>

          {/* Right: Controls & Timer */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Font Zoom Controls */}
            <div className="hidden sm:flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setFontSizeScale('sm')}
                className={`px-2 py-1 rounded font-semibold transition-all ${
                  fontSizeScale === 'sm' ? 'bg-white shadow-xs text-blue-700' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Ukuran Huruf Kecil"
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => setFontSizeScale('base')}
                className={`px-2 py-1 rounded font-semibold transition-all ${
                  fontSizeScale === 'base' ? 'bg-white shadow-xs text-blue-700' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Ukuran Huruf Standar"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setFontSizeScale('lg')}
                className={`px-2 py-1 rounded font-semibold transition-all ${
                  fontSizeScale === 'lg' ? 'bg-white shadow-xs text-blue-700' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Ukuran Huruf Besar"
              >
                A+
              </button>
            </div>

            {/* Re-enter Fullscreen Button */}
            <button
              type="button"
              onClick={() => SecurityService.requestFullscreen().catch(() => {})}
              title="Periksa Layar Penuh"
              className="p-2 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded-lg border border-slate-200 hidden sm:block"
            >
              <Maximize className="w-4 h-4" />
            </button>

            {/* Server Timer Countdown */}
            <div
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 font-mono font-bold text-xs sm:text-sm tracking-wider transition-all ${
                isTimerCritical
                  ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                  : 'bg-blue-50 text-blue-800 border-blue-200'
              }`}
            >
              <Clock className={`w-4 h-4 ${isTimerCritical ? 'text-rose-600' : 'text-blue-600'}`} />
              <span className="tabular-nums">{formattedTimer}</span>
            </div>

            {/* Mobile palette drawer button */}
            <button
              type="button"
              onClick={() => setIsPaletteOpenMobile(!isPaletteOpenMobile)}
              className="lg:hidden p-2 text-slate-700 bg-slate-100 rounded-lg border border-slate-200"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN EXAM WORKSPACE: Question Area (Left) + Palette (Right) */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* QUESTION DISPLAY AREA (Left 8 Cols) */}
        <main className="lg:col-span-8 flex flex-col space-y-4">
          {currentQ ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs flex-1 flex flex-col justify-between">
              {/* Question Header Card */}
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 gap-2 mb-5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                      {currentQ.number || currentIndex + 1}
                    </span>
                    <div>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                        {currentQ.type === 'pg' && 'Pilihan Ganda'}
                        {currentQ.type === 'isian' && 'Isian Singkat'}
                        {currentQ.type === 'benar_salah' && 'Benar / Salah'}
                        {currentQ.type === 'uraian' && 'Uraian / Essay'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Bobot: {currentQ.points} Poin
                      </span>
                    </div>
                  </div>

                  {/* Flag / Ragu-ragu toggle */}
                  <button
                    type="button"
                    onClick={() => handleToggleFlag(currentQ.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                      currentAnswer?.flagged
                        ? 'bg-amber-100 border-amber-300 text-amber-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                    }`}
                  >
                    <Flag className={`w-3.5 h-3.5 ${currentAnswer?.flagged ? 'fill-amber-600 text-amber-600' : ''}`} />
                    <span>{currentAnswer?.flagged ? 'Ragu-Ragu (Ditandai)' : 'Tandai Ragu-Ragu'}</span>
                  </button>
                </div>

                {/* Question Body Text */}
                <div className={`${headingSizeClass} font-medium text-slate-900 leading-relaxed mb-6 font-sans`}>
                  {currentQ.text}
                </div>

                {/* ANSWER INPUTS BASED ON QUESTION TYPE */}
                {/* 1. PILIHAN GANDA (PG) */}
                {currentQ.type === 'pg' && currentQ.options && (
                  <div className="space-y-3">
                    {currentQ.options.map((opt) => {
                      const isSelected = currentAnswer?.answer === opt.id;
                      return (
                        <label
                          key={opt.id}
                          onClick={() => handleAnswerChange(currentQ.id, opt.id)}
                          className={`flex items-start gap-3.5 p-3.5 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50/80 border-blue-500 shadow-xs ring-1 ring-blue-400 text-blue-950'
                              : 'bg-white border-slate-200 hover:bg-slate-50/80 text-slate-800'
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 transition-all ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {opt.id}
                          </div>
                          <span className={`${textSizeClass} leading-relaxed pt-0.5`}>
                            {opt.text}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* 2. ISIAN SINGKAT */}
                {currentQ.type === 'isian' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-600">
                      Tuliskan Jawaban Singkat Anda:
                    </label>
                    <input
                      type="text"
                      value={typeof currentAnswer?.answer === 'string' ? currentAnswer.answer : ''}
                      onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                      placeholder="Ketik jawaban di sini..."
                      className={`w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono text-slate-900 ${textSizeClass}`}
                    />
                    <p className="text-[11px] text-slate-400">
                      *Gunakan huruf kecil atau besar tanpa tanda baca yang tidak perlu.
                    </p>
                  </div>
                )}

                {/* 3. BENAR / SALAH */}
                {currentQ.type === 'benar_salah' && (
                  <div className="space-y-3 pt-2">
                    <label className="block text-xs font-semibold text-slate-600">
                      Tentukan Pernyataan Tersebut:
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => handleAnswerChange(currentQ.id, true)}
                        className={`p-4 rounded-xl font-bold text-sm border transition-all cursor-pointer ${
                          currentAnswer?.answer === true
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        BENAR (TRUE)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAnswerChange(currentQ.id, false)}
                        className={`p-4 rounded-xl font-bold text-sm border transition-all cursor-pointer ${
                          currentAnswer?.answer === false
                            ? 'bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-300'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        SALAH (FALSE)
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. URAIAN / ESSAY */}
                {currentQ.type === 'uraian' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-600">
                      Lembar Jawaban Uraian Anda:
                    </label>
                    <textarea
                      rows={6}
                      value={typeof currentAnswer?.answer === 'string' ? currentAnswer.answer : ''}
                      onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                      placeholder="Uraikan jawaban dan argumen Anda secara terstruktur dan jelas..."
                      className={`w-full p-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 leading-relaxed font-sans ${textSizeClass}`}
                    />
                    <p className="text-[11px] text-slate-400">
                      *Jawaban Anda akan dikoreksi dan dinilai secara komprehensif oleh guru pengampu.
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Nav: Previous & Next Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-8 gap-3">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                  className={`px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-colors ${
                    currentIndex === 0
                      ? 'text-slate-300 bg-slate-50 cursor-not-allowed'
                      : 'text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Sebelumnya</span>
                </button>

                {currentIndex < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                    className="px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-sm shadow-blue-500/20 cursor-pointer transition-colors"
                  >
                    <span>Berikutnya</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsConfirmModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    <span>Selesai & Kumpulkan</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400">Soal tidak ditemukan.</div>
          )}
        </main>

        {/* QUESTION PALETTE GRID SIDEBAR (Right 4 Cols) */}
        <aside
          className={`lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between ${
            isPaletteOpenMobile
              ? 'fixed inset-x-3 bottom-3 top-20 z-40 overflow-y-auto block'
              : 'hidden lg:flex'
          }`}
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Kisi Nomor Soal
              </div>
              <div className="text-xs text-slate-500 font-mono">
                {answeredCount}/{questions.length} Terjawab
              </div>
            </div>

            {/* Status Legend */}
            <div className="grid grid-cols-3 gap-2 text-[11px] mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-blue-600 shrink-0" />
                <span className="text-slate-600">Dijawab</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-amber-400 shrink-0" />
                <span className="text-slate-600">Ragu-ragu</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-slate-100 border border-slate-300 shrink-0" />
                <span className="text-slate-600">Belum</span>
              </div>
            </div>

            {/* Number buttons grid */}
            <div className="grid grid-cols-5 sm:grid-cols-5 gap-2 max-h-[380px] overflow-y-auto pr-1">
              {questions.map((q, idx) => {
                const ans = session.answers[q.id];
                const isAnswered = ans && ans.answer !== '' && ans.answer !== undefined;
                const isFlagged = ans?.flagged;
                const isCurrent = idx === currentIndex;

                let btnStyle = 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200';
                if (isFlagged) {
                  btnStyle = 'bg-amber-400 text-amber-950 font-bold border-amber-500';
                } else if (isAnswered) {
                  btnStyle = 'bg-blue-600 text-white font-bold border-blue-600';
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      setCurrentIndex(idx);
                      setIsPaletteOpenMobile(false);
                    }}
                    className={`h-10 rounded-xl text-xs font-mono transition-all flex items-center justify-center relative cursor-pointer ${btnStyle} ${
                      isCurrent ? 'ring-2 ring-offset-2 ring-blue-500 font-black' : ''
                    }`}
                  >
                    {q.number || idx + 1}
                    {isFlagged && (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600 absolute top-1 right-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Final Submit Trigger */}
          <div className="pt-4 border-t border-slate-100 mt-6 space-y-2">
            <button
              type="button"
              onClick={() => setIsConfirmModalOpen(true)}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span>Kumpulkan Ujian Sekarang</span>
            </button>
            <p className="text-[10px] text-slate-400 text-center">
              Seluruh jawaban tersimpan otomatis di server.
            </p>
          </div>
        </aside>
      </div>

      {/* VIOLATION WARNING ALERT MODAL */}
      {isAlertModalOpen && currentViolation && (
        <ViolationAlertModal
          currentViolation={currentViolation}
          violationCount={session.violationsCount}
          maxViolations={exam.settings.maxViolations || 3}
          countdownSec={exam.settings.warningGracePeriodSec || 10}
          onResume={handleResumeFromAlert}
        />
      )}

      {/* SUSPENSION LOCK SCREEN */}
      {isSuspended && (
        <SuspensionScreen
          session={session}
          exam={exam}
          onUnlocked={handleUnlockedFromSuspension}
        />
      )}

      {/* SUBMISSION CONFIRMATION MODAL */}
      {isConfirmModalOpen && (
        <SubmitConfirmModal
          totalQuestions={questions.length}
          answeredCount={answeredCount}
          flaggedCount={flaggedCount}
          unansweredCount={unansweredCount}
          onConfirmSubmit={handleFinalSubmit}
          onClose={() => setIsConfirmModalOpen(false)}
        />
      )}
    </div>
  );
};
