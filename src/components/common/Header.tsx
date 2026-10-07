import React from 'react';
import { User, Exam } from '../../types';
import { 
  ShieldCheck, 
  LogOut, 
  User as UserIcon, 
  GraduationCap, 
  School,
  Lock,
  Clock
} from 'lucide-react';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  activeExam?: Exam | null;
  isExamMode?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  activeExam,
  isExamMode = false,
}) => {
  // If in pure exam mode, we render a specialized distraction-free bar
  if (isExamMode) {
    return null;
  }

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Brand title, single line */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
                SIMAS CBT · MI Negeri 1 Paser
              </span>
              <span className="text-[11px] font-medium text-slate-500 block leading-none">
                Pengembang: <span className="text-blue-700 font-semibold">Dzakirul Husni, S.Pd</span>
              </span>
            </div>
          </div>

          {/* Zone 2: Informational / context navigation */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            {user ? (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <School className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-slate-800">{user.schoolName || 'MI Negeri 1 Paser'}</span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="text-slate-500 font-mono">T.A. 2026/2027</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <School className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-semibold text-slate-700">MI Negeri 1 Paser</span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span>Kiosk Exam Mode & Proctoring</span>
              </div>
            )}
          </div>

          {/* Zone 3: Primary actions & User account */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-semibold text-slate-900 leading-tight">
                    {user.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    {user.role === 'guru' ? `NIP. ${user.nip || '-'}` : `${user.className || 'Siswa'} · NISN ${user.nisn || '-'}`}
                  </div>
                </div>

                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                  user.role === 'guru' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {user.role === 'guru' ? 'GR' : 'SW'}
                </div>

                <button
                  onClick={onLogout}
                  title="Keluar Akun"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                Portal Resmi Asesmen
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
