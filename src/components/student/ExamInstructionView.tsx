import React, { useState } from 'react';
import { Exam, User, EXAM_CATEGORY_LABELS } from '../../types';
import { 
  ShieldCheck, 
  Clock, 
  HelpCircle, 
  Award, 
  AlertTriangle, 
  Maximize, 
  Lock, 
  CheckCircle2, 
  ArrowRight,
  School,
  FileText
} from 'lucide-react';

interface ExamInstructionViewProps {
  exam: Exam;
  student: User;
  onStartExam: () => void;
  onCancel: () => void;
}

export const ExamInstructionView: React.FC<ExamInstructionViewProps> = ({
  exam,
  student,
  onStartExam,
  onCancel,
}) => {
  const [agreementChecked, setAgreementChecked] = useState<boolean>(false);
  const [isRequestingFullscreen, setIsRequestingFullscreen] = useState<boolean>(false);

  const handleStart = async () => {
    setIsRequestingFullscreen(true);
    onStartExam();
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50">
      <div className="max-w-3xl w-full bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Banner Top */}
        <div className="p-6 bg-gradient-to-r from-blue-700 to-indigo-800 text-white">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-200 uppercase tracking-wider">
              <School className="w-4 h-4" />
              <span>MI Negeri 1 Paser · Asesmen Digital Madrasah</span>
            </div>
            <span className="text-[11px] text-blue-200 hidden sm:inline">
              Pengembang: Dzakirul Husni, S.Pd
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            {exam.title}
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 flex flex-wrap items-center gap-2">
            <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-semibold text-white">
              {EXAM_CATEGORY_LABELS[exam.category || 'sumatif_akhir_semester']}
            </span>
            <span>·</span>
            <span>Mata Pelajaran: <span className="font-semibold text-white">{exam.subject}</span></span>
            <span>·</span>
            <span>{exam.gradeLevel}</span>
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Student Info Card */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Nama Peserta</span>
              <span className="font-bold text-slate-900 text-sm">{student.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">NISN Siswa</span>
              <span className="font-mono font-bold text-slate-800 text-sm">{student.nisn || '-'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Durasi Ujian</span>
              <span className="font-bold text-blue-700 text-sm">{exam.settings.durationMinutes} Menit</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">KKM / Ketuntasan</span>
              <span className="font-bold text-slate-900 text-sm">{exam.settings.kkm} Poin</span>
            </div>
          </div>

          {/* Exam Rules & Security Warnings */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Tata Tertib & Protokol Keamanan Ujian (Exam Mode)</span>
            </h3>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-50/60 border border-blue-100">
                <Maximize className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-blue-950 block">1. Mode Layar Penuh (Fullscreen) Wajib</span>
                  Saat menekan tombol mulai, ujian akan otomatis beralih ke layar penuh. Dilarang menekan tombol ESC atau keluar dari fullscreen selama ujian berlangsung.
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50/70 border border-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-amber-950 block">2. Deteksi Perpindahan Halaman & Tab Browser</span>
                  Sistem memantau perpindahan tab, pembukaan aplikasi lain, atau kehilangan fokus jendela. Setiap aktivitas ini dicatat dengan timestamp persis.
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-50/60 border border-rose-100">
                <Lock className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-rose-950 block">3. Batas Pelanggaran: {exam.settings.maxViolations} Kali</span>
                  Jika Anda meninggalkan halaman ujian sebanyak {exam.settings.maxViolations} kali, ujian akan <strong>DITANGGUHKAN</strong> dan Anda harus meminta verifikasi langsung kepada guru/pengawas.
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-50/60 border border-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-emerald-950 block">4. Autosave & Privasi Dijamin Aman</span>
                  Jawaban Anda tersimpan otomatis secara berkala. Sistem <strong>tidak</strong> merekam kamera/mikrofon dan <strong>tidak</strong> langsung menghapus jawaban jika terjadi kendala teknis.
                </div>
              </div>
            </div>
          </div>

          {/* Exam Instructions Text */}
          {exam.instructions && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-1">
              <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Petunjuk Tambahan dari Guru:</span>
              </span>
              <p className="whitespace-pre-wrap leading-relaxed text-slate-600">
                {exam.instructions}
              </p>
            </div>
          )}

          {/* Confirmation Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={agreementChecked}
                onChange={(e) => setAgreementChecked(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 mt-0.5 cursor-pointer"
              />
              <span className="text-xs text-slate-700 leading-snug">
                Saya menyatakan siap mengikuti ujian dengan jujur, mengaktifkan mode layar penuh, dan mematuhi seluruh tata tertib integritas akademik.
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Kembali ke Halaman Masuk
            </button>

            <button
              type="button"
              disabled={!agreementChecked || isRequestingFullscreen}
              onClick={handleStart}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                agreementChecked
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <Maximize className="w-4 h-4" />
              <span>MULAI UJIAN (AKTIFKAN EXAM MODE)</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
