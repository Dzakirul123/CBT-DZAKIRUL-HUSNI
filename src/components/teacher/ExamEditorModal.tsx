import React, { useState } from 'react';
import { Exam, ExamSettings, ExamCategory, EXAM_CATEGORY_LABELS, STANDARD_SUBJECTS, DEFAULT_GRADE_LEVEL } from '../../types';
import { X, Save, ShieldAlert, Sparkles, Key, BookOpen, GraduationCap } from 'lucide-react';

interface ExamEditorModalProps {
  exam: Exam | null;
  onSave: (exam: Exam) => void;
  onClose: () => void;
}

export const ExamEditorModal: React.FC<ExamEditorModalProps> = ({ exam, onSave, onClose }) => {
  const isEditing = !!exam;

  const [title, setTitle] = useState(exam?.title || '');
  const [category, setCategory] = useState<ExamCategory>(exam?.category || 'sumatif_akhir_semester');
  const [subject, setSubject] = useState(exam?.subject || 'Matematika');
  const [customSubject, setCustomSubject] = useState(
    STANDARD_SUBJECTS.includes(exam?.subject as any) ? '' : exam?.subject || ''
  );
  const [gradeLevel, setGradeLevel] = useState(exam?.gradeLevel || DEFAULT_GRADE_LEVEL);
  const [token, setToken] = useState(exam?.token || generateRandomToken());
  const [description, setDescription] = useState(exam?.description || '');
  const [instructions, setInstructions] = useState(
    exam?.instructions ||
      '1. Berdoalah sebelum mulai.\n2. Waktu ujian dihitung mundur otomatis.\n3. Dilarang berpindah tab atau keluar dari layar penuh.\n4. Jawaban tersimpan otomatis.'
  );

  // Settings
  const [durationMinutes, setDurationMinutes] = useState(exam?.settings.durationMinutes || 45);
  const [kkm, setKkm] = useState(exam?.settings.kkm || 75);
  const [maxViolations, setMaxViolations] = useState(exam?.settings.maxViolations || 3);
  const [warningGracePeriodSec, setWarningGracePeriodSec] = useState(exam?.settings.warningGracePeriodSec || 10);
  const [supervisorPin, setSupervisorPin] = useState(exam?.settings.supervisorPin || '8899');
  const [shuffleQuestions, setShuffleQuestions] = useState(exam?.settings.shuffleQuestions ?? false);
  const [shuffleOptions, setShuffleOptions] = useState(exam?.settings.shuffleOptions ?? false);
  const [showResultsImmediately, setShowResultsImmediately] = useState(exam?.settings.showResultsImmediately ?? true);
  const [allowBackNavigation, setAllowBackNavigation] = useState(exam?.settings.allowBackNavigation ?? true);
  const [isActive, setIsActive] = useState(exam?.isActive ?? true);

  function generateRandomToken() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = 'CBT-';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedExam: Exam = {
      id: exam ? exam.id : `exam-${Date.now()}`,
      title: title.trim(),
      category,
      subject: subject.trim(),
      gradeLevel: gradeLevel.trim(),
      token: token.trim().toUpperCase(),
      description: description.trim(),
      instructions: instructions.trim(),
      questions: exam ? exam.questions : [],
      settings: {
        durationMinutes: Number(durationMinutes),
        kkm: Number(kkm),
        maxViolations: Number(maxViolations),
        warningGracePeriodSec: Number(warningGracePeriodSec),
        supervisorPin: supervisorPin.trim() || '8899',
        shuffleQuestions,
        shuffleOptions,
        showResultsImmediately,
        allowBackNavigation,
        scheduleStart: exam?.settings.scheduleStart || new Date().toISOString(),
        scheduleEnd: exam?.settings.scheduleEnd || new Date(Date.now() + 30 * 86400000).toISOString(),
        questionSelectionCount: exam ? exam.questions.length : 0,
      },
      createdAt: exam ? exam.createdAt : new Date().toISOString(),
      isActive,
    };

    onSave(updatedExam);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isEditing ? 'Ubah Pengaturan Ujian' : 'Buat Ujian Baru'}
            </h2>
            <p className="text-xs text-slate-500">
              Konfigurasi jadwal, token, bobot KKM, dan batasan keamanan Exam Mode
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              1. Informasi Utama Ujian
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Pilihan / Jenis Ujian <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    [
                      { key: 'formatif', label: 'Formatif', desc: 'Asesmen Harian / Diagnostik' },
                      { key: 'sumatif_akhir_bab', label: 'Sumatif Akhir BAB', desc: 'Evaluasi Materi Pokok' },
                      { key: 'sumatif_akhir_semester', label: 'Sumatif Akhir Semester', desc: 'SAS Semester' },
                      { key: 'sumatif_akhir_tahun', label: 'Sumatif Akhir Tahun', desc: 'SAT Kelulusan/Kenaikan' },
                    ] as const
                  ).map((item) => {
                    const isSelected = category === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setCategory(item.key)}
                        className={`p-2.5 text-left rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-600/20 text-blue-900 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-xs font-bold">{item.label}</div>
                        <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{item.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Mata Pelajaran Pilihan <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-blue-700 font-medium">Kelas 6 / Fase C MI</span>
                </div>
                
                {/* 5 Standard subjects chips */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {STANDARD_SUBJECTS.map((subj) => {
                    const isSelected = subject === subj;
                    return (
                      <button
                        key={subj}
                        type="button"
                        onClick={() => {
                          setSubject(subj);
                          setCustomSubject('');
                        }}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        {subj}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => {
                      if (STANDARD_SUBJECTS.includes(subject as any)) {
                        setSubject('');
                      }
                    }}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                      !STANDARD_SUBJECTS.includes(subject as any) && subject.length > 0
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    Lainnya...
                  </button>
                </div>

                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ketik nama mata pelajaran jika tidak ada di daftar atas..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Judul Ujian / Asesmen <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Asesmen Sumatif Akhir Semester: IPAS"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tingkat / Fase Kelas
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    placeholder="Contoh: Kelas 6 / Fase C"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => setGradeLevel(DEFAULT_GRADE_LEVEL)}
                    title="Atur ke Kelas 6 / Fase C"
                    className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs whitespace-nowrap font-medium"
                  >
                    6 / Fase C
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kode Token Masuk <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 text-sm font-mono font-bold tracking-wider rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => setToken(generateRandomToken())}
                    title="Buat token acak"
                    className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs"
                  >
                    Acak
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Durasi Ujian (Menit) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="5"
                  max="180"
                  required
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nilai KKM (Skor Minimum) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={kkm}
                  onChange={(e) => setKkm(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Petunjuk Pengerjaan Ujian
              </label>
              <textarea
                rows={3}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-sans"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              2. Pengaturan Keamanan & Exam Mode
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Batas Toleransi Pelanggaran
                </label>
                <select
                  value={maxViolations}
                  onChange={(e) => setMaxViolations(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value={1}>1 kali (Sangat Ketat - Langsung Suspend)</option>
                  <option value={2}>2 kali toleransi</option>
                  <option value={3}>3 kali toleransi (Standar Rekomendasi)</option>
                  <option value={5}>5 kali toleransi (Fleksibel)</option>
                </select>
                <p className="mt-1 text-[11px] text-slate-500">
                  Jika melampaui batas, ujian akan otomatis ditangguhkan.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  PIN Verifikasi Pengawas / Guru
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={supervisorPin}
                  onChange={(e) => setSupervisorPin(e.target.value)}
                  placeholder="Contoh: 8899"
                  className="w-full px-3.5 py-2 text-sm font-mono tracking-widest rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  Digunakan untuk membuka kunci siswa yang ditangguhkan.
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showResultsImmediately}
                  onChange={(e) => setShowResultsImmediately(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span className="text-xs font-medium text-slate-700">
                  Tampilkan nilai dan pembahasan langsung ke siswa setelah kirim jawaban
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shuffleQuestions}
                  onChange={(e) => setShuffleQuestions(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span className="text-xs font-medium text-slate-700">
                  Acak urutan nomor soal untuk setiap siswa
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span className="text-xs font-medium text-slate-700">
                  Ujian berstatus Aktif (Siswa dapat memasukkan token)
                </span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan Ujian</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
