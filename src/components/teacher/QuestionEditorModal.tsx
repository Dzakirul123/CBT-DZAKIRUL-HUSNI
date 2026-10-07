import React, { useState } from 'react';
import { Question, QuestionType, QuestionOption } from '../../types';
import { X, Plus, Trash2, Check, Save } from 'lucide-react';

interface QuestionEditorModalProps {
  question: Question | null;
  onSave: (question: Question) => void;
  onClose: () => void;
  nextNumber: number;
}

export const QuestionEditorModal: React.FC<QuestionEditorModalProps> = ({
  question,
  onSave,
  onClose,
  nextNumber,
}) => {
  const isEditing = !!question;

  const [type, setType] = useState<QuestionType>(question?.type || 'pg');
  const [points, setPoints] = useState<number>(question?.points || 10);
  const [text, setText] = useState<string>(question?.text || '');
  const [explanation, setExplanation] = useState<string>(question?.explanation || '');
  const [rubricGuide, setRubricGuide] = useState<string>(question?.rubricGuide || '');

  // PG options
  const defaultOptions: QuestionOption[] = [
    { id: 'A', text: '' },
    { id: 'B', text: '' },
    { id: 'C', text: '' },
    { id: 'D', text: '' },
    { id: 'E', text: '' },
  ];
  const [options, setOptions] = useState<QuestionOption[]>(
    question?.options && question.options.length > 0 ? question.options : defaultOptions
  );
  const [correctPgOption, setCorrectPgOption] = useState<string>(
    typeof question?.correctAnswer === 'string' ? question.correctAnswer : 'A'
  );

  // Isian correct answer
  const [correctIsian, setCorrectIsian] = useState<string>(
    typeof question?.correctAnswer === 'string' && question?.type === 'isian'
      ? question.correctAnswer
      : ''
  );

  // Benar / Salah
  const [correctBoolean, setCorrectBoolean] = useState<boolean>(
    typeof question?.correctAnswer === 'boolean' ? question.correctAnswer : true
  );

  const handleOptionTextChange = (id: string, value: string) => {
    setOptions(prev => prev.map(opt => (opt.id === id ? { ...opt, text: value } : opt)));
  };

  const handleAddOption = () => {
    const nextChar = String.fromCharCode(65 + options.length); // F, G ...
    setOptions([...options, { id: nextChar, text: '' }]);
  };

  const handleRemoveOption = (id: string) => {
    if (options.length <= 2) return;
    setOptions(options.filter(opt => opt.id !== id));
    if (correctPgOption === id) {
      setCorrectPgOption(options[0].id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalCorrectAnswer: string | boolean = 'A';
    if (type === 'pg') {
      finalCorrectAnswer = correctPgOption;
    } else if (type === 'isian') {
      finalCorrectAnswer = correctIsian.trim().toLowerCase();
    } else if (type === 'benar_salah') {
      finalCorrectAnswer = correctBoolean;
    } else if (type === 'uraian') {
      finalCorrectAnswer = 'rubric';
    }

    const newQuestion: Question = {
      id: question ? question.id : `q-${Date.now()}`,
      number: question?.number || nextNumber,
      type,
      points: Number(points) || 10,
      text: text.trim(),
      options: type === 'pg' ? options.filter(o => o.text.trim().length > 0) : undefined,
      correctAnswer: finalCorrectAnswer,
      explanation: explanation.trim(),
      rubricGuide: type === 'uraian' ? rubricGuide.trim() : undefined,
    };

    onSave(newQuestion);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isEditing ? `Edit Butir Soal #${question.number || ''}` : `Tambah Soal Baru #${nextNumber}`}
            </h2>
            <p className="text-xs text-slate-500">
              Pilih tipe soal: Pilihan Ganda, Isian Singkat, Benar / Salah, atau Uraian
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
          {/* Question Type and Points */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tipe Soal <span className="text-rose-500">*</span>
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as QuestionType)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
              >
                <option value="pg">Pilihan Ganda (PG A-E)</option>
                <option value="isian">Isian Singkat (Text Match)</option>
                <option value="benar_salah">Benar / Salah (True / False)</option>
                <option value="uraian">Uraian / Essay (Rubrik Guru)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bobot Nilai / Poin <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="100"
                required
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Question Text */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Narasi / Pertanyaan Soal <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Tuliskan naskah butir soal di sini..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* DYNAMIC ANSWER CONFIGURATION BASED ON TYPE */}
          {type === 'pg' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  Pilihan Jawaban & Tentukan Kunci Jawaban Benar
                </label>
                {options.length < 5 && (
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Opsi</span>
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {options.map((opt) => (
                  <div key={opt.id} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCorrectPgOption(opt.id)}
                      title={`Pilih opsi ${opt.id} sebagai kunci`}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                        correctPgOption === opt.id
                          ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-300'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {opt.id}
                    </button>
                    <input
                      type="text"
                      required
                      value={opt.text}
                      onChange={(e) => handleOptionTextChange(opt.id, e.target.value)}
                      placeholder={`Teks pilihan jawaban ${opt.id}`}
                      className="flex-1 px-3 py-1.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(opt.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-500">
                Klik tombol huruf biru untuk memilih opsi yang menjadi kunci jawaban yang benar.
              </p>
            </div>
          )}

          {type === 'isian' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kunci Jawaban Isian Singkat <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={correctIsian}
                onChange={(e) => setCorrectIsian(e.target.value)}
                placeholder="Contoh: alveolus (sistem pencocokan tidak sensitif huruf besar/kecil)"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Pencocokan jawaban siswa akan mengabaikan spasi berlebih dan huruf besar/kecil.
              </p>
            </div>
          )}

          {type === 'benar_salah' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Pernyataan di atas adalah <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setCorrectBoolean(true)}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                    correctBoolean === true
                      ? 'bg-blue-50 border-blue-600 text-blue-700 ring-2 ring-blue-300'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  BENAR (TRUE)
                </button>
                <button
                  type="button"
                  onClick={() => setCorrectBoolean(false)}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                    correctBoolean === false
                      ? 'bg-rose-50 border-rose-600 text-rose-700 ring-2 ring-rose-300'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  SALAH (FALSE)
                </button>
              </div>
            </div>
          )}

          {type === 'uraian' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pedoman Penskoran / Rubrik Guru
              </label>
              <textarea
                rows={3}
                value={rubricGuide}
                onChange={(e) => setRubricGuide(e.target.value)}
                placeholder="Tuliskan indikator jawaban lengkap dan pembagian poinnya untuk panduan koreksi guru..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          )}

          {/* Explanation */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pembahasan Soal (Opsional)
            </label>
            <textarea
              rows={2}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Penjelasan jawaban untuk bahan evaluasi siswa..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
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
              <span>Simpan Butir Soal</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
