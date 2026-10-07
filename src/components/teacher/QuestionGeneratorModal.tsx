import React, { useState, useMemo } from 'react';
import { Exam, Question, STANDARD_SUBJECTS, ExamCategory, EXAM_CATEGORY_LABELS } from '../../types';
import { 
  QuestionGeneratorEngine, 
  RECOMMENDED_THEMES, 
  GenerationResult 
} from '../../services/questionGenerator';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  BarChart3, 
  Layers, 
  Search, 
  RefreshCw, 
  Sliders, 
  HelpCircle, 
  BookOpen, 
  ShieldCheck, 
  Download, 
  Plus, 
  Save, 
  AlertCircle,
  FileText
} from 'lucide-react';

interface QuestionGeneratorModalProps {
  exams: Exam[];
  selectedExamId: string;
  onApplyQuestions: (examId: string, questions: Question[], mode: 'replace' | 'append') => void;
  onCreateExamWithQuestions: (examData: Partial<Exam>, questions: Question[]) => void;
  onClose: () => void;
}

export const QuestionGeneratorModal: React.FC<QuestionGeneratorModalProps> = ({
  exams,
  selectedExamId,
  onApplyQuestions,
  onCreateExamWithQuestions,
  onClose,
}) => {
  // Target Exam state
  const [targetExamId, setTargetExamId] = useState<string>(selectedExamId || (exams[0]?.id ?? ''));
  const currentExam = exams.find(e => e.id === targetExamId);

  // Configuration state
  const [subject, setSubject] = useState<string>(currentExam?.subject || 'Matematika');
  const [theme, setTheme] = useState<string>('');
  const [questionCount, setQuestionCount] = useState<number>(100); // Default can be up to 100
  const [category, setCategory] = useState<ExamCategory>(currentExam?.category || 'sumatif_akhir_bab');

  // Generation state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [result, setResult] = useState<GenerationResult | null>(null);

  // Preview filtering & search state
  const [filterKey, setFilterKey] = useState<'all' | 'A' | 'B' | 'C' | 'D'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // Save / Apply mode state
  const [applyMode, setApplyMode] = useState<'replace' | 'append' | 'new_exam'>('replace');
  const [newExamTitle, setNewExamTitle] = useState<string>('');

  // Recommended themes for current subject
  const currentThemes = useMemo(() => {
    return RECOMMENDED_THEMES[subject] || [
      'Capaian Pembelajaran Esensial Fase C',
      'Pemahaman Konsep & Penerapan Kontekstual',
      'Literasi dan Penalaran Kritis Siswa',
    ];
  }, [subject]);

  const handleSubjectChange = (newSub: string) => {
    setSubject(newSub);
    // If theme is empty or matches previous recommendation, suggest first of new subject
    if (!theme || currentThemes.includes(theme)) {
      const nextThemes = RECOMMENDED_THEMES[newSub] || [];
      if (nextThemes.length > 0) {
        setTheme(nextThemes[0]);
      }
    }
  };

  const handleGenerate = () => {
    if (!theme.trim()) {
      alert('Harap masukkan atau pilih Tema Mata Pelajaran terlebih dahulu.');
      return;
    }

    setIsGenerating(true);

    // Simulate realistic generation progress
    setTimeout(() => {
      const generated = QuestionGeneratorEngine.generateQuestions({
        subject,
        theme: theme.trim(),
        count: questionCount,
        category,
        gradeLevel: 'Kelas 6 / Fase C',
      });

      setResult(generated);
      setIsGenerating(false);

      // Default new exam title recommendation
      const catLabel = EXAM_CATEGORY_LABELS[category] || 'Ujian';
      setNewExamTitle(`${catLabel}: ${subject} - ${theme.trim()}`);
    }, 400);
  };

  // Filtered questions in preview
  const displayedQuestions = useMemo(() => {
    if (!result) return [];
    return result.questions.filter(q => {
      const matchesKey = filterKey === 'all' || q.correctAnswer === filterKey;
      const matchesSearch = !searchQuery.trim() || 
        q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.options?.some(opt => opt.text.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesKey && matchesSearch;
    });
  }, [result, filterKey, searchQuery]);

  const handleSaveToExam = () => {
    if (!result || result.questions.length === 0) return;

    if (applyMode === 'new_exam') {
      const tokenCandidate = subject.substring(0, 3).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);
      onCreateExamWithQuestions(
        {
          title: newExamTitle.trim() || `Asesmen ${subject} - ${theme}`,
          category,
          subject,
          gradeLevel: 'Kelas 6 / Fase C',
          token: tokenCandidate,
          description: `Soal asesmen otomatis kurikulum merdeka tema: ${theme}`,
        },
        result.questions
      );
    } else {
      if (!targetExamId) {
        alert('Pilih target ujian terlebih dahulu.');
        return;
      }
      onApplyQuestions(targetExamId, result.questions, applyMode);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center border border-white/20">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">
                  Generate Soal Otomatis (Hingga 100 Butir)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-amber-950 uppercase">
                  Admin Super
                </span>
              </div>
              <p className="text-xs text-blue-100">
                Opsi murni A, B, C, D dengan kunci jawaban terdistribusi merata sempurna & terstandar Fase C
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">

          {/* Guarantee Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-emerald-900 block">Kunci Jawaban Merata</span>
                <span className="text-emerald-700 text-[11px]">Kunci A, B, C, dan D dibagi seimbang (25% tiap opsi).</span>
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-blue-900 block">Opsi Hanya A, B, C, D</span>
                <span className="text-blue-700 text-[11px]">Format 4 pilihan ganda baku tanpa opsi E.</span>
              </div>
            </div>
            <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200 flex items-start gap-2.5">
              <BookOpen className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-indigo-900 block">Kapasitas s/d 100 Soal</span>
                <span className="text-indigo-700 text-[11px]">Bebas atur 1 hingga 100 soal valid sesuai tema.</span>
              </div>
            </div>
          </div>

          {/* Form Step: Input Parameters */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-blue-600" />
                <span>Pengaturan Tema & Spesifikasi Generator</span>
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">
                MI Negeri 1 Paser · Kelas 6 Fase C
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Mata Pelajaran */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  1. Pilih Mata Pelajaran <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {STANDARD_SUBJECTS.map(subj => (
                    <button
                      type="button"
                      key={subj}
                      onClick={() => handleSubjectChange(subj)}
                      className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border text-left transition-all ${
                        subject === subj
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {subj}
                    </button>
                  ))}
                </div>
              </div>

              {/* Kategori Ujian */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  2. Kategori / Pilihan Ujian
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['formatif', 'sumatif_akhir_bab', 'sumatif_akhir_semester', 'sumatif_akhir_tahun'] as ExamCategory[]).map(cat => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border text-left transition-all ${
                        category === cat
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {EXAM_CATEGORY_LABELS[cat]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Manual Input Tema (Requested Core Feature) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="themeInput" className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span>3. Input Manual Tema Mata Pelajaran</span>
                  <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-blue-700 font-medium">
                  Ketik topik bab/tema spesifik yang ingin diujikan
                </span>
              </div>
              <div className="relative">
                <input
                  id="themeInput"
                  type="text"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="Contoh: Volume & Luas Permukaan Bangun Ruang, Tata Surya & Gerhana, Pengamalan Sila Pancasila..."
                  className="w-full px-3.5 py-2.5 text-sm font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white shadow-xs pr-10"
                />
                {theme && (
                  <button
                    type="button"
                    onClick={() => setTheme('')}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    title="Hapus teks"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Inspiration Chips */}
              <div className="mt-2">
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                  💡 Inspirasi Tema Populer {subject} (Klik untuk pasang):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentThemes.map((recTheme) => (
                    <button
                      type="button"
                      key={recTheme}
                      onClick={() => setTheme(recTheme)}
                      className={`px-2.5 py-1 text-[11px] rounded-lg border transition-all ${
                        theme === recTheme
                          ? 'bg-blue-100 border-blue-400 text-blue-800 font-bold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                      }`}
                    >
                      {recTheme}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Question Count Selection (Up to 100) */}
            <div className="pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-800">
                  4. Jumlah Soal yang Digenerate (Maksimal 100 Butir)
                </label>
                <span className="text-sm font-extrabold text-blue-700 bg-blue-100 px-3 py-0.5 rounded-full">
                  {questionCount} Butir Soal
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex items-center gap-1 shrink-0">
                  {[10, 20, 25, 40, 50, 75, 100].map(cnt => (
                    <button
                      type="button"
                      key={cnt}
                      onClick={() => setQuestionCount(cnt)}
                      className={`px-2 py-1 text-[11px] font-bold rounded-md border transition-all ${
                        questionCount === cnt
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Generate Trigger Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || !theme.trim()}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sedang Menyusun & Menyeimbangkan {questionCount} Soal...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Generate {questionCount} Soal Otomatis (Tema: {theme ? `"${theme.substring(0, 30)}..."` : 'Manual'})</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Step 2: Generation Results, Statistics & Review */}
          {result && (
            <div className="space-y-4 pt-2">
              <div className="bg-white rounded-2xl border-2 border-emerald-500/40 p-5 shadow-sm space-y-4">
                {/* Result Title & Stats */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                      <h3 className="text-sm font-extrabold text-slate-900">
                        Hasil Generate Berhasil: {result.stats.total} Butir Soal Valid
                      </h3>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        100% Kunci Merata
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Tema: <span className="font-semibold text-slate-800">{result.stats.theme}</span> · Mata Pelajaran: <span className="font-semibold text-blue-700">{result.stats.subject}</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerate}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Acak Ulang Soal</span>
                  </button>
                </div>

                {/* Key Distribution Cards (Requested: Kunci jawaban merata antara A, B, C, D) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-emerald-600" />
                      <span>Distribusi Kunci Jawaban (A, B, C, D)</span>
                    </span>
                    <span className="text-xs font-bold text-emerald-700">
                      Rasio Rata: ~{(100 / 4).toFixed(0)}% Tiap Kunci
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {(['A', 'B', 'C', 'D'] as const).map(k => (
                      <div 
                        key={k} 
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          filterKey === k 
                            ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-300' 
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100 cursor-pointer'
                        }`}
                        onClick={() => setFilterKey(filterKey === k ? 'all' : k)}
                      >
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Kunci {k}</span>
                        <div className="text-base sm:text-lg font-black text-slate-900">
                          {result.stats.distribution[k]} <span className="text-xs font-normal text-slate-500">soal</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600">
                          {result.stats.percentages[k]}%
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Multi-colored Progress Bar */}
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex mt-2 border border-slate-200">
                    <div style={{ width: `${result.stats.percentages.A}%` }} className="bg-blue-500" title={`Kunci A: ${result.stats.distribution.A}`} />
                    <div style={{ width: `${result.stats.percentages.B}%` }} className="bg-emerald-500" title={`Kunci B: ${result.stats.distribution.B}`} />
                    <div style={{ width: `${result.stats.percentages.C}%` }} className="bg-amber-500" title={`Kunci C: ${result.stats.distribution.C}`} />
                    <div style={{ width: `${result.stats.percentages.D}%` }} className="bg-purple-500" title={`Kunci D: ${result.stats.distribution.D}`} />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium px-1 mt-1">
                    <span>A: {result.stats.distribution.A}</span>
                    <span>B: {result.stats.distribution.B}</span>
                    <span>C: {result.stats.distribution.C}</span>
                    <span>D: {result.stats.distribution.D}</span>
                  </div>
                </div>

                {/* Filter & Search Bar for Questions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-500">Filter Kunci:</span>
                    {(['all', 'A', 'B', 'C', 'D'] as const).map(k => (
                      <button
                        type="button"
                        key={k}
                        onClick={() => setFilterKey(k)}
                        className={`px-2 py-1 text-xs font-bold rounded-lg border transition-all ${
                          filterKey === k
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {k === 'all' ? 'Semua' : `Kunci ${k}`}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari teks soal / opsi..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full sm:w-56"
                    />
                  </div>
                </div>

                {/* Question List Preview */}
                <div className="max-h-72 overflow-y-auto space-y-3 pr-1 divide-y divide-slate-100">
                  {displayedQuestions.map((q) => (
                    <div key={q.id} className="pt-3 first:pt-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {q.number}
                          </span>
                          <div>
                            <p className="text-xs font-medium text-slate-900 leading-relaxed">
                              {q.text}
                            </p>
                          </div>
                        </div>
                        <span className="shrink-0 px-2 py-0.5 rounded text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Kunci: {q.correctAnswer}
                        </span>
                      </div>

                      {/* Options Grid (A, B, C, D) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-2 pl-8">
                        {q.options?.map(opt => {
                          const isCorrect = opt.id === q.correctAnswer;
                          return (
                            <div
                              key={opt.id}
                              className={`px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-2 border ${
                                isCorrect
                                  ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-950'
                                  : 'bg-white border-slate-200 text-slate-700'
                              }`}
                            >
                              <span
                                className={`w-4 h-4 rounded text-[10px] font-extrabold flex items-center justify-center ${
                                  isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                                }`}
                              >
                                {opt.id}
                              </span>
                              <span className="truncate">{opt.text}</span>
                            </div>
                          );
                        })}
                      </div>

                      {q.explanation && (
                        <div className="mt-1.5 pl-8 text-[11px] text-slate-500 italic">
                          💡 Pembahasan: {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}

                  {displayedQuestions.length === 0 && (
                    <div className="p-6 text-center text-xs text-slate-400">
                      Tidak ada butir soal yang sesuai dengan filter atau kata kunci pencarian.
                    </div>
                  )}
                </div>
              </div>

              {/* Destination & Action Section */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-800 block uppercase tracking-wider">
                  5. Terapkan Soal yang Digenerate
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label
                    className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                      applyMode === 'replace'
                        ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="applyMode"
                      checked={applyMode === 'replace'}
                      onChange={() => setApplyMode('replace')}
                      className="text-blue-600"
                    />
                    <div className="text-xs">
                      <span className="block">Gantikan Soal Ujian Ini</span>
                      <span className="text-[10px] text-slate-500 font-normal">Timpa soal ujian saat ini</span>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                      applyMode === 'append'
                        ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="applyMode"
                      checked={applyMode === 'append'}
                      onChange={() => setApplyMode('append')}
                      className="text-blue-600"
                    />
                    <div className="text-xs">
                      <span className="block">Tambahkan ke Ujian Ini</span>
                      <span className="text-[10px] text-slate-500 font-normal">Gabungkan dengan soal lama</span>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                      applyMode === 'new_exam'
                        ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="applyMode"
                      checked={applyMode === 'new_exam'}
                      onChange={() => setApplyMode('new_exam')}
                      className="text-blue-600"
                    />
                    <div className="text-xs">
                      <span className="block">Buat Ujian Baru</span>
                      <span className="text-[10px] text-slate-500 font-normal">Jadikan paket ujian baru</span>
                    </div>
                  </label>
                </div>

                {applyMode !== 'new_exam' && (
                  <div className="flex items-center gap-2 pt-1">
                    <label className="text-xs font-semibold text-slate-700 shrink-0">
                      Target Ujian:
                    </label>
                    <select
                      value={targetExamId}
                      onChange={(e) => setTargetExamId(e.target.value)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white w-full"
                    >
                      {exams.map(e => (
                        <option key={e.id} value={e.id}>
                          {e.title} ({e.subject} · {e.questions.length} soal saat ini)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {applyMode === 'new_exam' && (
                  <div className="pt-1">
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Judul Paket Ujian Baru:
                    </label>
                    <input
                      type="text"
                      value={newExamTitle}
                      onChange={(e) => setNewExamTitle(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 bg-white"
                      placeholder="Masukkan judul ujian..."
                    />
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>

          {result && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveToExam}
                className="px-5 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Simpan {result.stats.total} Soal ke Sistem CBT</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
