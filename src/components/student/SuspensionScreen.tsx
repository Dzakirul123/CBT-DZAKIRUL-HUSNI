import React, { useState, useEffect } from 'react';
import { StudentExamSession, Exam } from '../../types';
import { SecurityService } from '../../services/security';
import { storage } from '../../services/storage';
import { 
  ShieldAlert, 
  KeyRound, 
  CheckCircle, 
  AlertOctagon, 
  RefreshCw, 
  Info,
  Maximize
} from 'lucide-react';

interface SuspensionScreenProps {
  session: StudentExamSession;
  exam: Exam;
  onUnlocked: () => void;
}

export const SuspensionScreen: React.FC<SuspensionScreenProps> = ({
  session,
  exam,
  onUnlocked,
}) => {
  const [pinInput, setPinInput] = useState<string>('');
  const [errorPin, setErrorPin] = useState<string>('');
  const [isCheckingRemote, setIsCheckingRemote] = useState<boolean>(false);

  // Poll storage periodically in case teacher unlocked remotely from teacher dashboard
  useEffect(() => {
    const timer = setInterval(() => {
      const fresh = storage.getSession(session.id);
      if (fresh && fresh.status === 'in_progress') {
        onUnlocked();
      }
    }, 2000);

    return () => clearInterval(timer);
  }, [session.id, onUnlocked]);

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorPin('');

    const targetPin = exam.settings.supervisorPin || '8899';
    if (SecurityService.verifySupervisorPin(pinInput, targetPin)) {
      // Pin matched, lift suspension
      const freshSession = storage.getSession(session.id) || session;
      freshSession.status = 'in_progress';
      freshSession.unlockedBySupervisor = true;
      freshSession.suspensionUnlockedAt = new Date().toISOString();
      freshSession.violationsCount = Math.max(0, exam.settings.maxViolations - 1);
      storage.saveSession(freshSession);

      onUnlocked();
    } else {
      setErrorPin('PIN Verifikasi Pengawas salah. Silakan panggil guru di ruangan.');
    }
  };

  const handleManualCheck = () => {
    setIsCheckingRemote(true);
    setTimeout(() => {
      const fresh = storage.getSession(session.id);
      if (fresh && fresh.status === 'in_progress') {
        onUnlocked();
      } else {
        setErrorPin('Pengawas belum membuka suspensi dari dashboard. Silakan masukkan PIN pengawas.');
      }
      setIsCheckingRemote(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-4 border-rose-600 text-center animate-in zoom-in-95 duration-200">
        <div className="w-20 h-20 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-5 border-2 border-rose-300">
          <AlertOctagon className="w-10 h-10" />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
          Status Keamanan: Terkunci
        </span>

        <h1 className="text-2xl font-black text-slate-900 mt-3">
          Ujian Ditangguhkan
        </h1>

        <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
          Sesi ujian Anda telah ditangguhkan karena sistem mendeteksi aktivitas meninggalkan layar ujian sebanyak{' '}
          <span className="font-bold text-rose-600">{session.violationsCount} kali</span> (melebihi batas toleransi {exam.settings.maxViolations}x).
        </p>

        {/* Safety of answers guarantee */}
        <div className="mt-4 p-3.5 bg-blue-50/80 rounded-xl border border-blue-200 text-left text-xs text-blue-950 flex items-start gap-2.5">
          <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Jawaban Anda Aman:</span>
            Seluruh jawaban yang telah Anda pilih tersimpan aman di server dan <strong>tidak dihapus</strong>. Silakan panggil pengawas ujian untuk membuka kunci ini.
          </div>
        </div>

        {/* PIN Verification Form */}
        <form onSubmit={handleVerifyPin} className="mt-6 space-y-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Verifikasi Pengawas / Guru (Masukkan PIN)
            </label>
            <div className="relative">
              <input
                type="password"
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="PIN Pengawas Ruangan"
                autoFocus
                className="w-full px-4 py-3 text-center text-lg font-mono font-bold tracking-widest rounded-xl border-2 border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-600 focus:border-rose-600 text-slate-900"
              />
              <KeyRound className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              *Hanya boleh dimasukkan oleh Bapak/Ibu Guru Pengawas (Default: 8899)
            </p>
          </div>

          {errorPin && (
            <p className="text-xs text-rose-600 font-semibold">{errorPin}</p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-rose-600/20 cursor-pointer transition-colors"
            >
              Buka Kunci & Lanjutkan Ujian
            </button>
            <button
              type="button"
              onClick={handleManualCheck}
              disabled={isCheckingRemote}
              title="Periksa jika sudah dibuka dari dashboard guru"
              className="px-3.5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isCheckingRemote ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </form>

        <div className="mt-5 text-[11px] text-slate-400">
          Peserta: <span className="font-semibold text-slate-700">{session.studentName}</span> · NISN: {session.studentNisn}
        </div>
      </div>
    </div>
  );
};
