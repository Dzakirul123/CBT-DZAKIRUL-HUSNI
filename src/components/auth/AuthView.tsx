import React, { useState } from 'react';
import { User, UserRole, Exam } from '../../types';
import { storage, DEFAULT_USERS } from '../../services/storage';
import { 
  KeyRound, 
  GraduationCap, 
  UserCheck, 
  ShieldAlert, 
  ArrowRight, 
  Sparkles,
  Info,
  BookOpen,
  School,
  Lock
} from 'lucide-react';

interface AuthViewProps {
  onLogin: (user: User, examToken?: string) => void;
  availableExams: Exam[];
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin, availableExams }) => {
  const [activeTab, setActiveTab] = useState<UserRole>('siswa');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Student form state
  const [studentToken, setStudentToken] = useState<string>('MAT-6C');
  const [studentNisn, setStudentNisn] = useState<string>('0121234567');
  const [studentName, setStudentName] = useState<string>('Ahmad Fauzi');

  // Teacher form state
  const [teacherUsername, setTeacherUsername] = useState<string>('guru');
  const [teacherPassword, setTeacherPassword] = useState<string>('guru123');

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!studentToken.trim()) {
      setErrorMsg('Harap masukkan Kode Token Ujian yang valid.');
      return;
    }

    const exam = storage.getExamByToken(studentToken);
    if (!exam) {
      setErrorMsg(`Token "${studentToken}" tidak ditemukan atau ujian belum aktif.`);
      return;
    }

    if (!studentNisn.trim()) {
      setErrorMsg('Harap masukkan NISN siswa.');
      return;
    }

    if (!studentName.trim()) {
      setErrorMsg('Harap masukkan nama lengkap siswa.');
      return;
    }

    // Check if matching student from storage or create new student profile
    const registeredStudents = storage.getStudents();
    const existing = registeredStudents.find(u => u.nisn === studentNisn.trim()) || DEFAULT_USERS.find(u => u.nisn === studentNisn.trim());
    const studentUser: User = existing || {
      id: `student-${Date.now()}`,
      name: studentName.trim(),
      username: studentNisn.trim(),
      role: 'siswa',
      nisn: studentNisn.trim(),
      className: 'Kelas VI-A',
      schoolName: 'MI Negeri 1 Paser',
    };

    onLogin(studentUser, studentToken.trim().toUpperCase());
  };

  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (teacherUsername.trim() === 'guru' || teacherUsername.trim() === 'admin' || teacherUsername.trim().toLowerCase() === 'dzakirul') {
      const teacher = DEFAULT_USERS.find(u => u.role === 'guru') || {
        id: 'teacher-1',
        name: 'Dzakirul Husni, S.Pd',
        username: 'guru',
        role: 'guru',
        nip: '199005122019031008',
        schoolName: 'MI Negeri 1 Paser',
      };
      onLogin(teacher);
    } else {
      setErrorMsg('Username atau kata sandi pengawas/guru tidak cocok. (Gunakan: guru)');
    }
  };

  // Quick fill helper for testers
  const fillSampleStudent = (nisn: string, name: string, token: string = 'CBT-IPA01') => {
    setStudentNisn(nisn);
    setStudentName(name);
    setStudentToken(token);
    setErrorMsg('');
  };

  return (
    <div className="min-w-full min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-blue-50/40 via-white to-slate-50">
      <div className="w-full max-w-xl">
        {/* Welcome Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100/70 border border-blue-200 rounded-full text-blue-800 text-xs font-semibold mb-3">
            <School className="w-3.5 h-3.5" />
            <span>MI Negeri 1 Paser · CBT & Asesmen Madrasah Digital</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Portal Asesmen MI Negeri 1 Paser
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
            Sistem evaluasi mandiri terstandar dengan keamanan Kiosk Exam Mode, autosave, dan audit proctoring.
          </p>
          <div className="mt-2 text-xs font-medium text-slate-500">
            Pembuat & Pengembang: <span className="font-semibold text-blue-700">Dzakirul Husni, S.Pd</span>
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-200/50 overflow-hidden">
          {/* Segmented Role Tabs */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-100/90 border-b border-slate-200">
            <button
              type="button"
              onClick={() => { setActiveTab('siswa'); setErrorMsg(''); }}
              className={`flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                activeTab === 'siswa'
                  ? 'bg-white text-blue-700 shadow-sm shadow-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Masuk Sebagai Siswa</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('guru'); setErrorMsg(''); }}
              className={`flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                activeTab === 'guru'
                  ? 'bg-white text-blue-700 shadow-sm shadow-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Portal Guru / Admin Super</span>
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {errorMsg && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* SISWA LOGIN FORM */}
            {activeTab === 'siswa' ? (
              <form onSubmit={handleStudentSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Kode Token Ujian
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={studentToken}
                      onChange={(e) => setStudentToken(e.target.value.toUpperCase())}
                      placeholder="Contoh: CBT-IPA01"
                      required
                      className="w-full px-4 py-2.5 text-sm font-mono tracking-widest font-bold uppercase rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all text-slate-900 placeholder:text-slate-400"
                    />
                    <KeyRound className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Dapatkan token dari guru atau pengawas ruangan.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                      Nomor Induk Siswa (NISN)
                    </label>
                    <input
                      type="text"
                      value={studentNisn}
                      onChange={(e) => {
                        const val = e.target.value;
                        setStudentNisn(val);
                        const matched = storage.getStudents().find(s => s.nisn === val.trim());
                        if (matched) {
                          setStudentName(matched.name);
                        }
                      }}
                      placeholder="Contoh: 0121234567"
                      required
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                      Nama Lengkap Siswa
                    </label>
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Nama sesuai absensi"
                      required
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all text-slate-900"
                    />
                  </div>
                </div>

                {/* Info Exam Mode Notice */}
                <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
                  <Lock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-blue-950">Keamanan Kiosk Exam Mode Aktif</span>
                    Ujian akan berjalan dalam layar penuh (fullscreen) dengan pencatatan otomatis saat berpindah tab atau meminimalkan jendela.
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Verifikasi & Masuk Ruang Ujian</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Quick test presets */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="text-[11px] font-medium text-slate-500 mb-2 flex items-center justify-between">
                    <span>Uji Coba Cepat Token Ujian (Kelas 6 / Fase C):</span>
                    <span className="text-blue-600 font-mono text-[10px]">Pilih mata pelajaran</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => fillSampleStudent('0121234567', 'Ahmad Fauzi', 'MAT-6C')}
                      className={`px-2 py-1 text-xs rounded-lg transition-colors border ${
                        studentToken === 'MAT-6C'
                          ? 'bg-blue-600 text-white border-blue-600 font-bold'
                          : 'bg-slate-100 hover:bg-blue-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      Matematika (MAT-6C)
                    </button>
                    <button
                      type="button"
                      onClick={() => fillSampleStudent('0122345678', 'Farah Annisa', 'IPAS-6C')}
                      className={`px-2 py-1 text-xs rounded-lg transition-colors border ${
                        studentToken === 'IPAS-6C'
                          ? 'bg-blue-600 text-white border-blue-600 font-bold'
                          : 'bg-slate-100 hover:bg-blue-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      IPAS (IPAS-6C)
                    </button>
                    <button
                      type="button"
                      onClick={() => fillSampleStudent('0123456789', 'Dimas Wahyu Pratama', 'BIND-6C')}
                      className={`px-2 py-1 text-xs rounded-lg transition-colors border ${
                        studentToken === 'BIND-6C'
                          ? 'bg-blue-600 text-white border-blue-600 font-bold'
                          : 'bg-slate-100 hover:bg-blue-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      B. Indonesia (BIND-6C)
                    </button>
                    <button
                      type="button"
                      onClick={() => fillSampleStudent('0124567890', 'Siti Rahmawati', 'PPKN-6C')}
                      className={`px-2 py-1 text-xs rounded-lg transition-colors border ${
                        studentToken === 'PPKN-6C'
                          ? 'bg-blue-600 text-white border-blue-600 font-bold'
                          : 'bg-slate-100 hover:bg-blue-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      Pancasila (PPKN-6C)
                    </button>
                    <button
                      type="button"
                      onClick={() => fillSampleStudent('0121234567', 'Ahmad Fauzi', 'SBDP-6C')}
                      className={`px-2 py-1 text-xs rounded-lg transition-colors border ${
                        studentToken === 'SBDP-6C'
                          ? 'bg-blue-600 text-white border-blue-600 font-bold'
                          : 'bg-slate-100 hover:bg-blue-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      SBDP (SBDP-6C)
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* GURU LOGIN FORM */
              <form onSubmit={handleTeacherSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Nama Pengguna / NIP
                  </label>
                  <input
                    type="text"
                    value={teacherUsername}
                    onChange={(e) => setTeacherUsername(e.target.value)}
                    placeholder="Masukkan NIP atau username"
                    required
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Kata Sandi Pengawas
                  </label>
                  <input
                    type="password"
                    value={teacherPassword}
                    onChange={(e) => setTeacherPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all text-slate-900"
                  />
                  <p className="mt-1 text-[11px] text-slate-500">
                    Akun default guru: <span className="font-mono text-blue-600">guru</span> / sandi: <span className="font-mono text-blue-600">guru123</span>
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                  <div className="font-medium text-slate-900 mb-0.5">Akses Admin Super, Guru & Pembuat Soal:</div>
                  Dapat menginput manual Tema mata pelajaran, generate hingga 100 butir soal otomatis (opsi A, B, C, D) dengan kunci jawaban terdistribusi merata, memantau ujian real-time, dan mengimpor siswa massal.
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl shadow-md shadow-slate-900/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Masuk Dashboard Pengawas & Guru</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer info note */}
        <div className="mt-6 text-center text-xs text-slate-500">
          <p className="font-semibold text-slate-700">
            SIMAS CBT — MI Negeri 1 Paser · Tahun Ajaran 2026/2027
          </p>
          <p className="text-[11px] text-blue-700 mt-0.5 font-medium">
            Pembuat & Pengembang Aplikasi: Dzakirul Husni, S.Pd
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            *Catatan Keamanan: Web browser mendukung Kiosk Exam Mode; untuk penguncian tingkat perangkat keras disarankan menggunakan Chromebook Kiosk / Safe Exam Browser.
          </p>
        </div>
      </div>
    </div>
  );
};
