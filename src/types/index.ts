/**
 * Types definition for SIMAS CBT - Asesmen Digital Platform
 */

export type UserRole = 'guru' | 'siswa';

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  nisn?: string;
  nip?: string;
  className?: string;
  schoolName?: string;
}

export type QuestionType = 'pg' | 'isian' | 'benar_salah' | 'uraian';

export interface QuestionOption {
  id: string; // 'A', 'B', 'C', 'D', 'E'
  text: string;
}

export interface Question {
  id: string;
  number?: number;
  text: string;
  type: QuestionType;
  points: number;
  options?: QuestionOption[]; // For PG
  correctAnswer: string | boolean; // Option ID for PG, string for isian, boolean for benar_salah, rubric for essay
  rubricGuide?: string; // For essay evaluation
  explanation?: string;
  contextReading?: string; // Teks wacana literasi/bacaan jika ada
}

export interface ExamSettings {
  durationMinutes: number;
  kkm: number; // e.g. 75
  maxViolations: number; // e.g. 3
  warningGracePeriodSec: number; // countdown in seconds when violation detected
  supervisorPin: string; // e.g. "8899"
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showResultsImmediately: boolean;
  allowBackNavigation: boolean;
  scheduleStart: string; // ISO string or date string
  scheduleEnd: string;
  questionSelectionCount: number;
}

export type ExamCategory = 
  | 'formatif' 
  | 'sumatif_akhir_bab' 
  | 'sumatif_akhir_semester' 
  | 'sumatif_akhir_tahun';

export const EXAM_CATEGORY_LABELS: Record<ExamCategory, string> = {
  formatif: 'Formatif',
  sumatif_akhir_bab: 'Sumatif Akhir BAB',
  sumatif_akhir_semester: 'Sumatif Akhir Semester',
  sumatif_akhir_tahun: 'Sumatif Akhir Tahun',
};

export const STANDARD_SUBJECTS = [
  'Matematika',
  'IPAS',
  'Bahasa Indonesia',
  'Pendidikan Pancasila',
  'SBDP',
] as const;

export type StandardSubject = typeof STANDARD_SUBJECTS[number] | string;

export const DEFAULT_GRADE_LEVEL = 'Kelas 6 / Fase C';

export interface Exam {
  id: string;
  title: string;
  category: ExamCategory; // Formatif, Sumatif Akhir BAB, Sumatif Akhir Semester, Sumatif Akhir Tahun
  subject: string; // e.g. "Matematika", "Ilmu Pengetahuan Alam", "Informatika"
  gradeLevel: string; // e.g. "Kelas 9", "Fase D", "Kelas 12"
  token: string; // e.g. "ASESMEN-2026", "CBT-IPA01"
  description: string;
  instructions: string;
  questions: Question[];
  settings: ExamSettings;
  createdAt: string;
  isActive: boolean;
}

export type ViolationType = 
  | 'exit_fullscreen'
  | 'tab_switch'
  | 'window_blur'
  | 'forbidden_key'
  | 'context_menu';

export interface ViolationLog {
  id: string;
  timestamp: string; // Jam:Menit:Detik WIB
  type: ViolationType;
  typeName: string; // e.g. "Keluar Layar Penuh", "Berpindah Tab / Browser"
  details: string;
  violationNumber: number; // Pelanggaran ke-1, ke-2, dst.
}

export interface StudentAnswer {
  questionId: string;
  answer: string | boolean;
  flagged: boolean; // Ragu-ragu
  answeredAt: string;
  isCorrect?: boolean;
  essayScore?: number; // Score given by teacher
  essayFeedback?: string;
}

export interface StudentExamSession {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  studentNisn: string;
  className: string;
  tokenUsed: string;
  startedAt: string;
  submittedAt?: string;
  deadlineAt: string;
  status: 'not_started' | 'in_progress' | 'submitted' | 'suspended';
  answers: Record<string, StudentAnswer>;
  violationsCount: number;
  violationLogs: ViolationLog[];
  calculatedScore?: number;
  maxScore?: number;
  isPassed?: boolean;
  teacherReviewed?: boolean;
  suspensionUnlockedAt?: string;
  unlockedBySupervisor?: boolean;
}
