import React, { useState } from 'react';
import { User, Exam, StudentExamSession, Question, ExamCategory, EXAM_CATEGORY_LABELS, STANDARD_SUBJECTS } from '../../types';
import { storage } from '../../services/storage';
import { ExamEditorModal } from './ExamEditorModal';
import { QuestionEditorModal } from './QuestionEditorModal';
import { AuditLogView } from './AuditLogView';
import { ResultsView } from './ResultsView';
import { StudentManagerView } from './StudentManagerView';
import { BulkStudentImportModal } from './BulkStudentImportModal';
import { QuestionGeneratorModal } from './QuestionGeneratorModal';
import { 
  Layers, 
  FileQuestion, 
  ShieldAlert, 
  Award, 
  Plus, 
  Copy, 
  Check, 
  Settings, 
  Trash2, 
  Edit, 
  Users, 
  Clock, 
  Key, 
  Lock, 
  Smartphone, 
  Monitor, 
  CheckCircle2,
  ExternalLink,
  BookOpen,
  FileSpreadsheet,
  Sparkles
} from 'lucide-react';

interface TeacherDashboardProps {
  currentUser: User;
  onLogout: () => void;
  onTakeAsStudent?: (token: string) => void;
}

export type DashboardTab = 'exams' | 'questions' | 'students' | 'audit' | 'results' | 'kiosk_settings';

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  currentUser,
  onLogout,
  onTakeAsStudent,
}) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('exams');
  const [exams, setExams] = useState<Exam[]>(() => storage.getExams());
  const [sessions, setSessions] = useState<StudentExamSession[]>(() => storage.getSessions());
  const [students, setStudents] = useState<User[]>(() => storage.getStudents());

  // Exam editor state
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [isExamModalOpen, setIsExamModalOpen] = useState<boolean>(false);

  // Question bank selected exam
  const [selectedExamForQuestions, setSelectedExamForQuestions] = useState<string>(
    exams[0]?.id || ''
  );
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState<boolean>(false);

  // Bulk student import modal quick trigger
  const [isBulkImportOpen, setIsBulkImportOpen] = useState<boolean>(false);

  // Automatic question generator modal state
  const [isGeneratorModalOpen, setIsGeneratorModalOpen] = useState<boolean>(false);

  // Exam category and subject filter state
  const [examCategoryFilter, setExamCategoryFilter] = useState<'all' | ExamCategory>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');

  // Copy feedback
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Refresh helper
  const reloadData = () => {
    setExams(storage.getExams());
    setSessions(storage.getSessions());
    setStudents(storage.getStudents());
  };

  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleSaveExam = (exam: Exam) => {
    storage.saveExam(exam);
    reloadData();
    setIsExamModalOpen(false);
    setEditingExam(null);
  };

  const handleDeleteExam = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus ujian ini? Data soal dan hasil terkait akan dihapus.')) {
      storage.deleteExam(id);
      reloadData();
    }
  };

  const handleSaveQuestion = (question: Question) => {
    const currentExam = exams.find(e => e.id === selectedExamForQuestions);
    if (!currentExam) return;

    let updatedQuestions = [...currentExam.questions];
    const qIndex = updatedQuestions.findIndex(q => q.id === question.id);

    if (qIndex >= 0) {
      updatedQuestions[qIndex] = question;
    } else {
      updatedQuestions.push(question);
    }

    // Re-index question numbers
    updatedQuestions = updatedQuestions.map((q, idx) => ({ ...q, number: idx + 1 }));

    const updatedExam: Exam = {
      ...currentExam,
      questions: updatedQuestions,
    };

    storage.saveExam(updatedExam);
    reloadData();
    setIsQuestionModalOpen(false);
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (questionId: string) => {
    const currentExam = exams.find(e => e.id === selectedExamForQuestions);
    if (!currentExam) return;

    if (confirm('Hapus butir soal ini?')) {
      const updatedQuestions = currentExam.questions
        .filter(q => q.id !== questionId)
        .map((q, idx) => ({ ...q, number: idx + 1 }));

      const updatedExam: Exam = {
        ...currentExam,
        questions: updatedQuestions,
      };

      storage.saveExam(updatedExam);
      reloadData();
    }
  };

  const handleApplyGeneratedQuestions = (
    examId: string,
    newQuestions: Question[],
    mode: 'replace' | 'append'
  ) => {
    const currentExam = exams.find(e => e.id === examId);
    if (!currentExam) return;

    let finalQuestions: Question[] = [];
    if (mode === 'replace') {
      finalQuestions = newQuestions.map((q, idx) => ({ ...q, number: idx + 1 }));
    } else {
      finalQuestions = [...currentExam.questions, ...newQuestions].map((q, idx) => ({
        ...q,
        number: idx + 1,
      }));
    }

    const updatedExam: Exam = {
      ...currentExam,
      questions: finalQuestions,
      settings: {
        ...currentExam.settings,
        questionSelectionCount: finalQuestions.length,
      },
    };

    storage.saveExam(updatedExam);
    reloadData();
    setSelectedExamForQuestions(examId);
    setActiveTab('questions');
  };

  const handleCreateExamWithQuestions = (
    examData: Partial<Exam>,
    newQuestions: Question[]
  ) => {
    const newExamId = `exam-gen-${Date.now()}`;
    const mappedQuestions = newQuestions.map((q, idx) => ({ ...q, number: idx + 1 }));

    const newExam: Exam = {
      id: newExamId,
      title: examData.title || `Asesmen ${examData.subject || 'Madrasah'}`,
      category: examData.category || 'sumatif_akhir_bab',
      subject: examData.subject || 'Matematika',
      gradeLevel: examData.gradeLevel || 'Kelas 6 / Fase C',
      token: examData.token || `CBT-${Math.floor(1000 + Math.random() * 9000)}`,
      description: examData.description || 'Paket soal asesmen otomatis kurikulum merdeka',
      instructions:
        '1. Berdoalah sebelum mulai.\n2. Waktu ujian dihitung mundur otomatis.\n3. Dilarang berpindah tab atau keluar dari layar penuh.\n4. Jawaban tersimpan otomatis.',
      questions: mappedQuestions,
      settings: {
        durationMinutes: 60,
        kkm: 75,
        maxViolations: 3,
        warningGracePeriodSec: 10,
        supervisorPin: '8899',
        shuffleQuestions: false,
        shuffleOptions: false,
        showResultsImmediately: true,
        allowBackNavigation: true,
        scheduleStart: new Date().toISOString(),
        scheduleEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
        questionSelectionCount: mappedQuestions.length,
      },
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    storage.saveExam(newExam);
    reloadData();
    setSelectedExamForQuestions(newExamId);
    setActiveTab('questions');
  };

  const activeExamQuestions = exams.find(e => e.id === selectedExamForQuestions)?.questions || [];
  const currentExamObj = exams.find(e => e.id === selectedExamForQuestions);

  // Global counts
  const totalStudentsTaking = sessions.length;
  const totalViolationsRecorded = sessions.reduce((sum, s) => sum + s.violationsCount, 0);
  const activeExamsCount = exams.filter(e => e.isActive).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner & Quick Metrics */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Dashboard Pusat Pengawas & Proktor Asesmen</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Selamat Datang, {currentUser.name}
          </h1>
          <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-700">{currentUser.schoolName || 'MI Negeri 1 Paser'}</span>
            <span>·</span>
            <span>NIP. {currentUser.nip || '-'}</span>
            <span>·</span>
            <span className="text-blue-700 font-medium">Pembuat & Pengembang Aplikasi</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsGeneratorModalOpen(true)}
            className="px-3.5 py-2.5 text-xs font-bold bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-800 text-white rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
            title="Generate hingga 100 butir soal otomatis dengan kunci A, B, C, D terdistribusi merata"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>✨ Generate Soal Otomatis</span>
          </button>

          <button
            onClick={() => setIsBulkImportOpen(true)}
            className="px-3.5 py-2.5 text-xs font-bold bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-blue-600" />
            <span>+ Impor Siswa Massal</span>
          </button>

          <button
            onClick={() => {
              setEditingExam(null);
              setIsExamModalOpen(true);
            }}
            className="px-4 py-2.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Paket Ujian Baru</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('exams')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'exams'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Manajemen Ujian ({exams.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'questions'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileQuestion className="w-4 h-4" />
          <span>Bank Soal CBT</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'students'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Data Siswa ({students.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'audit'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Monitor & Audit Pelanggaran</span>
          {totalViolationsRecorded > 0 && (
            <span className="ml-1 text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded-full font-mono">
              {totalViolationsRecorded}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('results')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'results'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Hasil & Analisis Nilai</span>
        </button>

        <button
          onClick={() => setActiveTab('kiosk_settings')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'kiosk_settings'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Protokol Keamanan Kiosk</span>
        </button>
      </div>

      {/* TAB 1: EXAM LIST */}
      {activeTab === 'exams' && (
        <div className="space-y-4">
          {/* Filter Bar: Kategori & Mata Pelajaran */}
          <div className="space-y-2">
            {/* Pilihan / Kategori Ujian Filter */}
            <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase px-2 py-1">
                Kategori Ujian:
              </span>
              <button
                onClick={() => setExamCategoryFilter('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  examCategoryFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Semua Kategori ({exams.length})
              </button>
              <button
                onClick={() => setExamCategoryFilter('formatif')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  examCategoryFilter === 'formatif'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Formatif ({exams.filter(e => e.category === 'formatif').length})
              </button>
              <button
                onClick={() => setExamCategoryFilter('sumatif_akhir_bab')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  examCategoryFilter === 'sumatif_akhir_bab'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Sumatif Akhir BAB ({exams.filter(e => e.category === 'sumatif_akhir_bab').length})
              </button>
              <button
                onClick={() => setExamCategoryFilter('sumatif_akhir_semester')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  examCategoryFilter === 'sumatif_akhir_semester'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Sumatif Akhir Semester ({exams.filter(e => e.category === 'sumatif_akhir_semester').length})
              </button>
              <button
                onClick={() => setExamCategoryFilter('sumatif_akhir_tahun')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  examCategoryFilter === 'sumatif_akhir_tahun'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Sumatif Akhir Tahun ({exams.filter(e => e.category === 'sumatif_akhir_tahun').length})
              </button>
            </div>

            {/* Mata Pelajaran Pilihan Filter */}
            <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase px-2 py-1">
                Mata Pelajaran (Fase C):
              </span>
              <button
                onClick={() => setSubjectFilter('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  subjectFilter === 'all'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Semua Mapel
              </button>
              {STANDARD_SUBJECTS.map((sub) => {
                const count = exams.filter(e => e.subject.toLowerCase().includes(sub.toLowerCase())).length;
                return (
                  <button
                    key={sub}
                    onClick={() => setSubjectFilter(sub)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      subjectFilter === sub
                        ? 'bg-slate-800 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {sub} {count > 0 && `(${count})`}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {exams
              .filter(exam => examCategoryFilter === 'all' || exam.category === examCategoryFilter)
              .filter(exam => subjectFilter === 'all' || exam.subject.toLowerCase().includes(subjectFilter.toLowerCase()))
              .map((exam) => (
              <div
                key={exam.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                          {EXAM_CATEGORY_LABELS[exam.category || 'sumatif_akhir_semester']}
                        </span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs font-semibold text-slate-600">{exam.subject}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                        {exam.title}
                      </h3>
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        exam.isActive
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {exam.isActive ? 'AKTIF' : 'NONAKTIF'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mb-4 line-clamp-2">
                    {exam.description || 'Tidak ada deskripsi'}
                  </p>

                  {/* Token Box */}
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl mb-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-blue-900 block">
                        Kode Token Siswa
                      </span>
                      <span className="font-mono text-base font-extrabold text-blue-700 tracking-wider">
                        {exam.token}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopyToken(exam.token)}
                        title="Salin Token"
                        className="px-2.5 py-1.5 bg-white hover:bg-blue-100 text-blue-800 rounded-lg text-xs font-medium border border-blue-200 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {copiedToken === exam.token ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin</span>
                          </>
                        )}
                      </button>

                      {onTakeAsStudent && (
                        <button
                          onClick={() => onTakeAsStudent(exam.token)}
                          title="Uji Langsung Sebagai Siswa"
                          className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Uji</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Quick specs */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs py-2 bg-slate-50 rounded-xl mb-4">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Jumlah Soal</span>
                      <span className="font-bold text-slate-800">{exam.questions.length} Butir</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Durasi</span>
                      <span className="font-bold text-slate-800">{exam.settings.durationMinutes} Menit</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">KKM</span>
                      <span className="font-bold text-blue-700">{exam.settings.kkm}</span>
                    </div>
                  </div>
                </div>

                {/* Card actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedExamForQuestions(exam.id);
                        setIsGeneratorModalOpen(true);
                      }}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 cursor-pointer"
                      title="Generate hingga 100 butir soal otomatis"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Generate Soal</span>
                    </button>
                    <span className="text-slate-300">·</span>
                    <button
                      onClick={() => {
                        setSelectedExamForQuestions(exam.id);
                        setActiveTab('questions');
                      }}
                      className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
                    >
                      <FileQuestion className="w-3.5 h-3.5" />
                      <span>Kelola Soal</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingExam(exam);
                        setIsExamModalOpen(true);
                      }}
                      className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Ubah Pengaturan Ujian"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteExam(exam.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Hapus Ujian"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: QUESTION BANK */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-700 uppercase">
                Pilih Ujian:
              </label>
              <select
                value={selectedExamForQuestions}
                onChange={(e) => setSelectedExamForQuestions(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              >
                {exams.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.title} ({e.questions.length} Butir Soal)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsGeneratorModalOpen(true)}
                className="px-3.5 py-2 text-xs font-bold bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-800 text-white rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                title="Generate otomatis hingga 100 butir soal valid dengan opsi A, B, C, D dan kunci jawaban merata"
              >
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>✨ Generate Soal Otomatis (s/d 100 Soal)</span>
              </button>

              <button
                onClick={() => {
                  setEditingQuestion(null);
                  setIsQuestionModalOpen(true);
                }}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Butir Soal</span>
              </button>
            </div>
          </div>

          {/* Questions list */}
          <div className="space-y-4">
            {activeExamQuestions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
                <FileQuestion className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-800">Belum ada butir soal pada ujian ini.</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Gunakan fitur <b>Generate Soal Otomatis</b> untuk membuat hingga 100 butir soal secara instan dengan tema yang Anda tentukan dan kunci jawaban merata A, B, C, D.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => setIsGeneratorModalOpen(true)}
                    className="px-4 py-2 text-xs font-bold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>✨ Generate Soal Otomatis Sekarang</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingQuestion(null);
                      setIsQuestionModalOpen(true);
                    }}
                    className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Input Soal Manual</span>
                  </button>
                </div>
              </div>
            ) : (
              activeExamQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                        #{q.number || idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-slate-600 uppercase">
                        {q.type === 'pg' && 'Pilihan Ganda (PG)'}
                        {q.type === 'isian' && 'Isian Singkat'}
                        {q.type === 'benar_salah' && 'Benar / Salah'}
                        {q.type === 'uraian' && 'Uraian / Essay'}
                      </span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs font-mono font-medium text-slate-500">
                        Bobot: {q.points} Poin
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingQuestion(q);
                          setIsQuestionModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Soal"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Hapus Soal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="text-sm font-medium text-slate-900 leading-relaxed">
                    {q.text}
                  </div>

                  {/* Option/Answer Details */}
                  {q.type === 'pg' && q.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                      {q.options.map(opt => (
                        <div
                          key={opt.id}
                          className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                            opt.id === q.correctAnswer
                              ? 'bg-blue-50/70 border-blue-300 text-blue-900 font-medium'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded font-bold text-[11px] flex items-center justify-center shrink-0 ${
                            opt.id === q.correctAnswer
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}>
                            {opt.id}
                          </span>
                          <span className="line-clamp-1">{opt.text}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {q.type === 'isian' && (
                    <div className="p-2.5 bg-slate-50 rounded-lg text-xs font-mono text-slate-700 border border-slate-200">
                      Kunci Jawaban: <span className="font-bold text-blue-700">"{String(q.correctAnswer)}"</span>
                    </div>
                  )}

                  {q.type === 'benar_salah' && (
                    <div className="p-2.5 bg-slate-50 rounded-lg text-xs text-slate-700 border border-slate-200">
                      Kunci Jawaban: <span className="font-bold text-blue-700">{q.correctAnswer ? 'BENAR (TRUE)' : 'SALAH (FALSE)'}</span>
                    </div>
                  )}

                  {q.type === 'uraian' && q.rubricGuide && (
                    <div className="p-2.5 bg-amber-50/60 rounded-lg text-xs text-amber-900 border border-amber-200 font-sans">
                      <span className="font-bold block mb-0.5">Rubrik Koreksi:</span>
                      <p className="line-clamp-2">{q.rubricGuide}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB: DATA SISWA */}
      {activeTab === 'students' && (
        <StudentManagerView
          students={students}
          sessions={sessions}
          onRefresh={reloadData}
        />
      )}

      {/* TAB 3: AUDIT LOG */}
      {activeTab === 'audit' && (
        <AuditLogView
          exams={exams}
          sessions={sessions}
          onRefresh={reloadData}
        />
      )}

      {/* TAB 4: RESULTS */}
      {activeTab === 'results' && (
        <ResultsView
          exams={exams}
          sessions={sessions}
          currentUser={currentUser}
          onRefresh={reloadData}
        />
      )}

      {/* TAB 5: KIOSK SETTINGS & TECHNICAL SPECIFICATION */}
      {activeTab === 'kiosk_settings' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 text-blue-700">
              <Lock className="w-5 h-5" />
              <h2 className="text-base font-bold text-slate-900">
                Arsitektur Keamanan Exam Mode & Standar Asesmen Digital
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              SIMAS CBT dirancang dengan perlindungan lapis ganda untuk menjamin integritas pelaksanaan ujian di laboratorium komputer sekolah maupun gawai mandiri siswa.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                  <Monitor className="w-4 h-4 text-blue-600" />
                  <span>1. Deteksi Fullscreen & Jendela</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Memanfaatkan Fullscreen API dan Event Listener <code className="text-blue-600 font-mono">fullscreenchange</code> untuk mendeteksi siswa yang membatalkan layar penuh.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  <span>2. Page Visibility & Focus API</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Mendeteksi saat siswa membuka tab lain (<code className="text-blue-600 font-mono">visibilitychange</code>) atau memindahkan fokus kursor ke aplikasi latar belakang (<code className="text-blue-600 font-mono">window.onblur</code>).
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                  <Key className="w-4 h-4 text-blue-600" />
                  <span>3. Pencegahan Shortcut Keyboard</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Mencegah kombinasi tombol <code className="font-mono">Ctrl+C</code>, <code className="font-mono">Ctrl+V</code>, <code className="font-mono">F12 (DevTools)</code>, <code className="font-mono">Ctrl+U</code>, dan blokir klik kanan mouse.
                </p>
              </div>
            </div>

            {/* Crucial Note as requested */}
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-950 space-y-2">
              <div className="font-bold flex items-center gap-2 text-amber-900">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>CATATAN PENTING KEAMANAN PROKTOR</span>
              </div>
              <p className="leading-relaxed">
                Web browser modern tidak dapat menjamin penguncian perangkat 100% dari sistem operasi dasar (seperti tombol fisik Windows/Command atau split screen OS tanpa permission root).
              </p>
              <p className="font-semibold text-amber-900">
                Rekomendasi Ujian Resmi: Gunakan Kiosk Mode pada Managed Chromebook, Windows Kiosk Mode, atau Safe Exam Browser (SEB) untuk penguncian tingkat perangkat keras secara menyeluruh.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Developer Attribution Footer Card */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800">SIMAS CBT MI Negeri 1 Paser</span>
          <span>·</span>
          <span>Sistem Asesmen Digital & Ujian Mandiri Terstandar</span>
        </div>
        <div className="text-slate-600">
          Pembuat & Pengembang Aplikasi: <span className="font-bold text-blue-700">Dzakirul Husni, S.Pd</span>
        </div>
      </div>

      {/* Modals */}
      {isExamModalOpen && (
        <ExamEditorModal
          exam={editingExam}
          onSave={handleSaveExam}
          onClose={() => {
            setIsExamModalOpen(false);
            setEditingExam(null);
          }}
        />
      )}

      {isQuestionModalOpen && (
        <QuestionEditorModal
          question={editingQuestion}
          onSave={handleSaveQuestion}
          onClose={() => {
            setIsQuestionModalOpen(false);
            setEditingQuestion(null);
          }}
          nextNumber={activeExamQuestions.length + 1}
        />
      )}

      {/* Bulk Student Import Modal */}
      {isBulkImportOpen && (
        <BulkStudentImportModal
          onSuccess={(count) => {
            reloadData();
            setIsBulkImportOpen(false);
            setActiveTab('students');
          }}
          onClose={() => setIsBulkImportOpen(false)}
        />
      )}

      {/* Automatic Question Generator Modal (s/d 100 Soal, Kunci Merata A, B, C, D) */}
      {isGeneratorModalOpen && (
        <QuestionGeneratorModal
          exams={exams}
          selectedExamId={selectedExamForQuestions}
          onApplyQuestions={handleApplyGeneratedQuestions}
          onCreateExamWithQuestions={handleCreateExamWithQuestions}
          onClose={() => setIsGeneratorModalOpen(false)}
        />
      )}
    </div>
  );
};
