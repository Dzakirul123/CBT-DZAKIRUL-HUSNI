import React, { useEffect, useState } from 'react';
import { ViolationLog } from '../../types';
import { AlertTriangle, Maximize, Clock, ShieldAlert } from 'lucide-react';

interface ViolationAlertModalProps {
  currentViolation: ViolationLog;
  violationCount: number;
  maxViolations: number;
  countdownSec: number;
  onResume: () => void;
}

export const ViolationAlertModal: React.FC<ViolationAlertModalProps> = ({
  currentViolation,
  violationCount,
  maxViolations,
  countdownSec = 10,
  onResume,
}) => {
  const [remainingTime, setRemainingTime] = useState<number>(countdownSec);

  useEffect(() => {
    setRemainingTime(countdownSec);
    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [countdownSec]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-2 border-amber-400 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-300">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
          Peringatan Integritas #{violationCount} dari {maxViolations}
        </span>

        <h2 className="text-xl font-extrabold text-slate-900 mt-3">
          Terdeteksi aktivitas meninggalkan halaman ujian. Silakan kembali ke ujian
        </h2>

        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 text-left space-y-1.5">
          <div className="flex justify-between">
            <span className="font-semibold text-slate-500">Jenis Aktivitas:</span>
            <span className="font-bold text-slate-900">{currentViolation.typeName}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-slate-500">Waktu Terdeteksi:</span>
            <span className="font-mono text-slate-800">{currentViolation.timestamp}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-slate-500">Catatan Sistem:</span>
            <span className="text-slate-600 max-w-[240px] text-right">{currentViolation.details}</span>
          </div>
        </div>

        <div className="mt-4 p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-900 text-left">
          <strong>Perhatian:</strong> Jika Anda melakukan pelanggaran sebanyak{' '}
          <strong className="text-rose-700">{maxViolations} kali</strong>, sesi ujian Anda akan{' '}
          <strong>DITANGGUHKAN</strong> dan hanya dapat dibuka kembali dengan izin pengawas/guru.
        </div>

        <div className="mt-6 flex flex-col items-center gap-3">
          <button
            onClick={onResume}
            className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Maximize className="w-4 h-4" />
            <span>KEMBALI KE UJIAN & AKTIFKAN LAYAR PENUH</span>
          </button>

          <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>Kembali otomatis jika tombol ditekan ({remainingTime} detik)</span>
          </span>
        </div>
      </div>
    </div>
  );
};
