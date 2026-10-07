import React from 'react';
import { StudentExamSession, Exam, EXAM_CATEGORY_LABELS } from '../../types';
import { 
  CheckCircle2, 
  Award, 
  Clock, 
  ArrowLeft, 
  HelpCircle, 
  Check, 
  X, 
  Lock, 
  FileCheck2,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

interface ExamCompletedViewProps {
  session: StudentExamSession;
  exam: Exam;
  onReturnToHome: () => void;
}

export const ExamCompletedView: React.FC<ExamCompletedViewProps> = ({
  session,
  exam,
  onReturnToHome,
}) => {
  const showResults = exam.settings.showResultsImmediately;
  const score = session.calculatedScore ?? 0;
  const isPassed = score >= exam.settings.kkm;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50">
      <div className="max-w-3xl w-full bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header Status */}
        <div className="p-8 text-center bg-gradient-to-b from-blue-50/50 to-white border-b border-slate-100">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Ujian Berhasil Diserahkan
          </span>

          <h1 className="text-2xl font-black text-slate-900 mt-3">
            Terima Kasih, {session.studentName}!
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-md mx-auto">
            Seluruh lembar jawaban Anda telah diterima oleh server pada{' '}
            <span className="font-mono font-medium text-slate-800">
              {session.submittedAt ? new Date(session.submittedAt).toLocaleTimeString('id-ID') : 'Selesai'} WIB
            </span>
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Official Verification Receipt */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Jenis Asesmen</span>
              <span className="font-bold text-blue-700">{EXAM_CATEGORY_LABELS[exam.category || 'sumatif_akhir_semester']}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Mata Pelajaran</span>
              <span className="font-bold text-slate-900">{exam.subject}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Catatan Integritas</span>
              <span className={`font-mono font-bold ${session.violationsCount > 0 ? 'text-amber-600' : 'text-emerald-700'}`}>
                {session.violationsCount > 0 ? `${session.violationsCount}x Catatan` : '100% Bersih'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Token Digunakan</span>
              <span className="font-mono font-bold text-blue-700">{session.tokenUsed}</span>
            </div>
          </div>

          {/* Conditional Result Score */}
          {showResults ? (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase font-semibold text-blue-200 block">
                    Hasil Perolehan Nilai Akhir
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight tabular-nums">
                      {score}
                    </span>
                    <span className="text-base text-blue-200">/ 100 Poin</span>
                  </div>
                </div>

                <div className="text-center sm:text-right">
                  <span className="text-xs text-blue-200 block">Kriteria Ketuntasan (KKM: {exam.settings.kkm})</span>
                  <div className={`mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    isPassed ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                  }`}>
                    {isPassed ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>TUNTAS KKM</span>
                      </>
                    ) : (
                      <>
                        <X className="w-3.5 h-3.5" />
                        <span>PERLU REMIDIAL</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-blue-950">
                Nilai dan Pembahasan Ditahan oleh Guru
              </h3>
              <p className="text-xs text-blue-800 max-w-md mx-auto leading-relaxed">
                Sesuai kebijakan pengawas, nilai akhir serta kunci jawaban akan diumumkan secara serentak oleh Bapak/Ibu guru setelah seluruh peserta selesai mengikuti ujian.
              </p>
            </div>
          )}

          {/* Question by question summary if results visible */}
          {showResults && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Ringkasan Jawaban Soal Otomatis (PG & Isian)
              </h3>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {exam.questions.map((q, idx) => {
                  const studentAns = session.answers[q.id];
                  const isCorrect = studentAns?.isCorrect;

                  return (
                    <div
                      key={q.id}
                      className="p-3 rounded-xl border border-slate-200 bg-white text-xs space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">#{q.number || idx + 1}</span>
                          <span className="text-slate-500 text-[11px] uppercase">({q.type})</span>
                        </div>

                        {q.type !== 'uraian' ? (
                          <span className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                            isCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {isCorrect ? 'BENAR' : 'SALAH'}
                          </span>
                        ) : (
                          <span className="bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded text-[10px]">
                            {studentAns?.essayScore !== undefined ? `${studentAns.essayScore} Poin` : 'Menunggu Koreksi Guru'}
                          </span>
                        )}
                      </div>

                      <p className="text-slate-700 line-clamp-1">{q.text}</p>

                      <div className="text-[11px] text-slate-500 flex flex-wrap gap-x-4 gap-y-1 pt-1 border-t border-slate-100">
                        <span>
                          Jawaban Anda: <strong className="text-slate-800">{studentAns?.answer ? String(studentAns.answer) : '(Kosong)'}</strong>
                        </span>
                        {q.type !== 'uraian' && (
                          <span>
                            Kunci: <strong className="text-blue-700">{String(q.correctAnswer)}</strong>
                          </span>
                        )}
                      </div>

                      {q.explanation && (
                        <p className="text-[11px] text-slate-500 italic bg-slate-50 p-1.5 rounded">
                          💡 Pembahasan: {q.explanation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action button: Return to Home / Logout */}
          <div className="pt-4 border-t border-slate-200 flex justify-center">
            <button
              onClick={onReturnToHome}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Keluar & Kembali ke Halaman Utama</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
