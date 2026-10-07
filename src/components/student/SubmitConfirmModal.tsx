import React from 'react';
import { X, Send, AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';

interface SubmitConfirmModalProps {
  totalQuestions: number;
  answeredCount: number;
  flaggedCount: number;
  unansweredCount: number;
  onConfirmSubmit: () => void;
  onClose: () => void;
}

export const SubmitConfirmModal: React.FC<SubmitConfirmModalProps> = ({
  totalQuestions,
  answeredCount,
  flaggedCount,
  unansweredCount,
  onConfirmSubmit,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <h3 className="text-base font-bold text-slate-900">
            Konfirmasi Pengumpulan Jawaban
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-600 mb-4">
          Apakah Anda yakin ingin menyelesaikan dan mengumpulkan seluruh jawaban ujian sekarang? Periksa kembali ringkasan berikut:
        </p>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-2.5 text-center text-xs mb-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <span className="text-slate-500 text-[10px] block font-medium">Sudah Dijawab</span>
            <span className="text-lg font-bold text-blue-700 tabular-nums">{answeredCount}</span>
            <span className="text-[10px] text-slate-400 block">/ {totalQuestions} Soal</span>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <span className="text-slate-500 text-[10px] block font-medium">Masih Ragu</span>
            <span className="text-lg font-bold text-amber-700 tabular-nums">{flaggedCount}</span>
            <span className="text-[10px] text-slate-400 block">Ditandai</span>
          </div>

          <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl">
            <span className="text-slate-500 text-[10px] block font-medium">Belum Dijawab</span>
            <span className="text-lg font-bold text-slate-700 tabular-nums">{unansweredCount}</span>
            <span className="text-[10px] text-slate-400 block">Kosong</span>
          </div>
        </div>

        {unansweredCount > 0 && (
          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 mb-4 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Masih terdapat <strong>{unansweredCount} butir soal</strong> yang belum Anda isi. Pastikan Anda telah memeriksa kembali sebelum mengumpulkan.
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-300 transition-colors"
          >
            Kembali Periksa
          </button>
          <button
            type="button"
            onClick={onConfirmSubmit}
            className="flex-1 py-2.5 px-4 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/20 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ya, Kumpulkan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
