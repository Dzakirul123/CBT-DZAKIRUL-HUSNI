import React, { useState } from 'react';
import { StudentExamSession, Exam, Question } from '../../types';
import { storage } from '../../services/storage';
import { X, CheckCircle2, Award, MessageSquare } from 'lucide-react';

interface EssayGradingModalProps {
  session: StudentExamSession;
  exam: Exam;
  onSave: (updatedSession: StudentExamSession) => void;
  onClose: () => void;
}

export const EssayGradingModal: React.FC<EssayGradingModalProps> = ({
  session,
  exam,
  onSave,
  onClose,
}) => {
  const essayQuestions = exam.questions.filter(q => q.type === 'uraian');

  // Track grading inputs per essay question
  const [scores, setScores] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    essayQuestions.forEach(q => {
      init[q.id] = session.answers[q.id]?.essayScore ?? 0;
    });
    return init;
  });

  const [feedbacks, setFeedbacks] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    essayQuestions.forEach(q => {
      init[q.id] = session.answers[q.id]?.essayFeedback ?? '';
    });
    return init;
  });

  const handleScoreChange = (qId: string, val: number, maxPoints: number) => {
    const bounded = Math.max(0, Math.min(maxPoints, val));
    setScores(prev => ({ ...prev, [qId]: bounded }));
  };

  const handleFeedbackChange = (qId: string, val: string) => {
    setFeedbacks(prev => ({ ...prev, [qId]: val }));
  };

  const handleSave = () => {
    const updatedAnswers = { ...session.answers };

    essayQuestions.forEach(q => {
      if (updatedAnswers[q.id]) {
        updatedAnswers[q.id] = {
          ...updatedAnswers[q.id],
          essayScore: scores[q.id] ?? 0,
          essayFeedback: feedbacks[q.id] ?? '',
          isCorrect: (scores[q.id] ?? 0) > 0,
        };
      }
    });

    const updatedSession: StudentExamSession = {
      ...session,
      answers: updatedAnswers,
      teacherReviewed: true,
    };

    // Recalculate overall exam score
    const res = storage.calculateSessionScore(updatedSession, exam);
    updatedSession.calculatedScore = res.totalScore;
    updatedSession.isPassed = res.isPassed;

    storage.saveSession(updatedSession);
    onSave(updatedSession);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Penilaian Jawaban Uraian / Essay
            </h2>
            <p className="text-xs text-slate-500">
              Siswa: <span className="font-semibold text-slate-800">{session.studentName}</span> ({session.className} · NISN {session.studentNisn})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {essayQuestions.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              Tidak ada butir soal tipe uraian dalam ujian ini.
            </div>
          ) : (
            essayQuestions.map((q, idx) => {
              const studentAnswer = session.answers[q.id];
              return (
                <div key={q.id} className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold text-blue-700 uppercase mb-1">
                        Soal Uraian #{q.number || idx + 1} (Bobot Maks: {q.points} Poin)
                      </div>
                      <p className="text-sm font-medium text-slate-900">
                        {q.text}
                      </p>
                    </div>
                  </div>

                  {/* Rubric guide */}
                  {q.rubricGuide && (
                    <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900">
                      <span className="font-bold block mb-1">Pedoman Penskoran:</span>
                      <pre className="whitespace-pre-wrap font-sans">{q.rubricGuide}</pre>
                    </div>
                  )}

                  {/* Student Answer */}
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                      Jawaban Siswa:
                    </label>
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 font-sans leading-relaxed whitespace-pre-wrap">
                      {studentAnswer?.answer ? String(studentAnswer.answer) : (
                        <span className="text-rose-500 italic">Siswa tidak mengisi jawaban pada butir ini.</span>
                      )}
                    </div>
                  </div>

                  {/* Grading Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 items-end">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Beri Nilai (0 - {q.points})
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max={q.points}
                          value={scores[q.id] ?? 0}
                          onChange={(e) => handleScoreChange(q.id, Number(e.target.value), q.points)}
                          className="w-24 px-3 py-1.5 text-sm font-bold text-blue-700 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                        />
                        <span className="text-xs text-slate-500">/ {q.points}</span>
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Catatan / Feedback Guru untuk Siswa
                      </label>
                      <input
                        type="text"
                        value={feedbacks[q.id] ?? ''}
                        onChange={(e) => handleFeedbackChange(q.id, e.target.value)}
                        placeholder="Catatan perbaikan atau apresiasi..."
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Nilai akhir ujian siswa akan otomatis dihitung ulang setelah disimpan.
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Tutup
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan & Perbarui Nilai</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
