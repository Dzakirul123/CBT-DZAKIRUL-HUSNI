import React, { useState } from 'react';
import { StudentExamSession, Exam, User, EXAM_CATEGORY_LABELS } from '../../types';
import { EssayGradingModal } from './EssayGradingModal';
import { PrintReportModal } from './PrintReportModal';
import { 
  Award, 
  FileCheck2, 
  Search, 
  Printer, 
  Download, 
  Edit3, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';

interface ResultsViewProps {
  exams: Exam[];
  sessions: StudentExamSession[];
  currentUser: User | null;
  onRefresh: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  exams,
  sessions,
  currentUser,
  onRefresh,
}) => {
  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || 'all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'passed' | 'remedial'>('all');

  // Modal states
  const [gradingSession, setGradingSession] = useState<StudentExamSession | null>(null);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  const activeExam = exams.find(e => e.id === selectedExamId) || exams[0];

  const filteredSessions = sessions.filter(session => {
    const matchesExam = selectedExamId === 'all' || session.examId === selectedExamId;
    const matchesSearch =
      session.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.studentNisn.includes(searchQuery);

    const exam = exams.find(e => e.id === session.examId);
    const kkm = exam?.settings.kkm || 75;
    const isPassed = (session.calculatedScore ?? 0) >= kkm;

    let matchesStatus = true;
    if (statusFilter === 'passed') matchesStatus = isPassed;
    if (statusFilter === 'remedial') matchesStatus = !isPassed;

    return matchesExam && matchesSearch && matchesStatus;
  });

  const passedCount = filteredSessions.filter(s => {
    const exam = exams.find(e => e.id === s.examId);
    return (s.calculatedScore ?? 0) >= (exam?.settings.kkm || 75);
  }).length;

  const remedialCount = filteredSessions.length - passedCount;

  const avgScore = filteredSessions.length > 0
    ? Math.round(filteredSessions.reduce((acc, s) => acc + (s.calculatedScore ?? 0), 0) / filteredSessions.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Controls & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="min-w-[200px]">
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Pilih Paket Ujian:
            </label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
            >
              {exams.map(e => (
                <option key={e.id} value={e.id}>
                  [{EXAM_CATEGORY_LABELS[e.category || 'sumatif_akhir_semester']}] {e.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[180px]">
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Pencarian Siswa:
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama atau NISN..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Status Ketuntasan:
            </label>
            <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                  statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('passed')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                  statusFilter === 'passed' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tuntas KKM
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('remedial')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                  statusFilter === 'remedial' ? 'bg-white text-rose-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Remidial
              </button>
            </div>
          </div>
        </div>

        {/* Action Button: Print official report */}
        <div className="self-end md:self-center">
          <button
            onClick={() => setShowPrintModal(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Berita Acara & Nilai</span>
          </button>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Total Peserta Selesai</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
            {filteredSessions.length}
          </div>
          <span className="text-[11px] text-slate-400">Terdaftar dalam sistem</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Rata-Rata Nilai</span>
          <div className="text-2xl font-extrabold text-blue-600 mt-1 tabular-nums">
            {avgScore}
          </div>
          <span className="text-[11px] text-slate-400">Skala 0 - 100</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Tuntas KKM</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1 tabular-nums">
            {passedCount} Siswa
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">
            {filteredSessions.length > 0 ? Math.round((passedCount / filteredSessions.length) * 100) : 0}% Kelulusan
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Perlu Remidial</span>
          <div className="text-2xl font-extrabold text-rose-600 mt-1 tabular-nums">
            {remedialCount} Siswa
          </div>
          <span className="text-[11px] text-rose-700 font-medium">
            Nilai &lt; KKM ({activeExam?.settings.kkm || 75})
          </span>
        </div>
      </div>

      {/* Main Results Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Daftar Perolehan Skor & Lembar Koreksi Siswa
          </div>
          <div className="text-xs text-slate-500">
            KKM: <span className="font-bold text-slate-800">{activeExam?.settings.kkm || 75}</span>
          </div>
        </div>

        {filteredSessions.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Belum ada data pengerjaan ujian untuk filter yang dipilih.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 font-semibold text-slate-600">
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4">Kelas / NISN</th>
                  <th className="py-3 px-4 text-center">Nilai Akhir</th>
                  <th className="py-3 px-4 text-center">Status Ketuntasan</th>
                  <th className="py-3 px-4 text-center">Waktu Pengerjaan</th>
                  <th className="py-3 px-4 text-center">Integritas</th>
                  <th className="py-3 px-4 text-right">Koreksi Uraian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSessions.map((session, idx) => {
                  const exam = exams.find(e => e.id === session.examId);
                  const kkm = exam?.settings.kkm || 75;
                  const score = session.calculatedScore ?? 0;
                  const isPassed = score >= kkm;

                  // Check if exam has essay questions
                  const hasEssay = exam?.questions.some(q => q.type === 'uraian');

                  return (
                    <tr key={session.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-center font-mono text-slate-500">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{session.studentName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">Token: {session.tokenUsed}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div>{session.className}</div>
                        <div className="font-mono text-[11px] text-slate-400">{session.studentNisn}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-base font-extrabold font-mono tabular-nums ${
                          isPassed ? 'text-blue-700' : 'text-rose-600'
                        }`}>
                          {score}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">/ 100</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                          isPassed
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}>
                          {isPassed ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>TUNTAS</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-rose-600" />
                              <span>REMIDIAL</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-slate-600">
                        <div className="font-mono">
                          {session.submittedAt
                            ? new Date(session.submittedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                            : 'Selesai'}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {session.violationsCount > 0 ? (
                          <span className="text-rose-600 font-mono font-bold bg-rose-50 px-2 py-0.5 rounded text-[11px]">
                            {session.violationsCount}x Catatan
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-medium text-[11px]">
                            Bersih (0)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {hasEssay ? (
                          <button
                            onClick={() => setGradingSession(session)}
                            className="px-2.5 py-1 text-xs font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg inline-flex items-center gap-1 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Koreksi Essay</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Otomatis (PG)</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Essay Grading Modal */}
      {gradingSession && activeExam && (
        <EssayGradingModal
          session={gradingSession}
          exam={activeExam}
          onSave={() => {
            onRefresh();
            setGradingSession(null);
          }}
          onClose={() => setGradingSession(null)}
        />
      )}

      {/* Print Report Modal */}
      {showPrintModal && activeExam && (
        <PrintReportModal
          exam={activeExam}
          sessions={filteredSessions}
          currentUser={currentUser}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
};
