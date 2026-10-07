import React, { useState } from 'react';
import { StudentExamSession, Exam, ViolationLog, EXAM_CATEGORY_LABELS } from '../../types';
import { storage } from '../../services/storage';
import { 
  ShieldAlert, 
  Unlock, 
  Search, 
  Filter, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  KeyRound,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface AuditLogViewProps {
  exams: Exam[];
  sessions: StudentExamSession[];
  onRefresh: () => void;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ exams, sessions, onRefresh }) => {
  const [selectedExamId, setSelectedExamId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [successActionMsg, setSuccessActionMsg] = useState<string>('');

  const filteredSessions = sessions.filter(session => {
    const matchesExam = selectedExamId === 'all' || session.examId === selectedExamId;
    const matchesSearch =
      session.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.studentNisn.includes(searchQuery);
    return matchesExam && matchesSearch;
  });

  // Collect all violation items across filtered sessions
  interface FlatViolationRecord {
    log: ViolationLog;
    session: StudentExamSession;
    exam?: Exam;
  }

  const allViolations: FlatViolationRecord[] = [];
  filteredSessions.forEach(session => {
    const exam = exams.find(e => e.id === session.examId);
    session.violationLogs.forEach(log => {
      allViolations.push({ log, session, exam });
    });
  });

  // Sort descending by timestamp or creation
  allViolations.sort((a, b) => b.log.timestamp.localeCompare(a.log.timestamp));

  // Handler to lift suspension for a student
  const handleUnlockStudent = (sessionId: string, studentName: string) => {
    const session = storage.getSession(sessionId);
    if (!session) return;

    session.status = 'in_progress';
    session.unlockedBySupervisor = true;
    session.suspensionUnlockedAt = new Date().toISOString();
    // Reset violations count slightly or allow them to continue
    session.violationsCount = Math.max(0, session.violationsCount - 1);

    storage.saveSession(session);
    onRefresh();

    setSuccessActionMsg(`Penangguhan untuk siswa "${studentName}" berhasil dibuka oleh pengawas.`);
    setTimeout(() => setSuccessActionMsg(''), 4500);
  };

  const suspendedSessions = sessions.filter(s => s.status === 'suspended');

  return (
    <div className="space-y-6">
      {/* Top Banner Alert for Suspended Students */}
      {suspendedSessions.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-rose-900">
                Pemberitahuan: {suspendedSessions.length} Siswa Sedang Ditangguhkan (Suspended)
              </div>
              <div className="text-xs text-rose-700">
                Siswa terindikasi melebihi batas toleransi pelanggaran dan memerlukan verifikasi guru / PIN untuk melanjutkan.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold bg-rose-100 text-rose-800 px-2.5 py-1 rounded-lg">
              PIN Default: 8899
            </span>
          </div>
        </div>
      )}

      {successActionMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{successActionMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama siswa atau NISN..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" />
          </div>

          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
          >
            <option value="all">Semua Ujian</option>
            {exams.map(e => (
              <option key={e.id} value={e.id}>
                [{EXAM_CATEGORY_LABELS[e.category || 'sumatif_akhir_semester']}] {e.title} ({e.token})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={onRefresh}
          className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center gap-1.5 self-end sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* Grid: Suspended Candidates / Active Proctoring */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>Sesi Peserta dengan Catatan Pelanggaran Integritas</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSessions.map((s) => {
            const exam = exams.find(e => e.id === s.examId);
            const isSuspended = s.status === 'suspended';
            const hasViolations = s.violationsCount > 0;

            if (!hasViolations && !isSuspended) return null;

            return (
              <div
                key={s.id}
                className={`p-4 rounded-xl border transition-all ${
                  isSuspended
                    ? 'bg-rose-50/60 border-rose-300 ring-1 ring-rose-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="text-sm font-bold text-slate-900">{s.studentName}</div>
                    <div className="text-xs text-slate-500">
                      {s.className} · NISN: <span className="font-mono">{s.studentNisn}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isSuspended
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : s.status === 'submitted'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {isSuspended
                      ? 'DITANGGUHKAN'
                      : s.status === 'submitted'
                      ? 'SELESAI'
                      : 'SEDANG UJIAN'}
                  </span>
                </div>

                <div className="text-xs text-slate-600 mb-3 line-clamp-1">
                  Ujian: <span className="font-medium text-slate-800">{exam?.title || s.examId}</span>
                </div>

                <div className="flex items-center justify-between text-xs py-2 px-2.5 bg-slate-100/70 rounded-lg mb-3">
                  <span className="text-slate-600">Pelanggaran Terdeteksi:</span>
                  <span className="font-mono font-bold text-rose-600">
                    {s.violationsCount} / {exam?.settings.maxViolations || 3} Batas Maks
                  </span>
                </div>

                {isSuspended ? (
                  <button
                    onClick={() => handleUnlockStudent(s.id, s.studentName)}
                    className="w-full py-2 px-3 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Buka Suspensi Siswa Sekarang</span>
                  </button>
                ) : (
                  <div className="text-[11px] text-slate-500 text-right">
                    Status: Dipantau oleh sistem Proctor
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Comprehensive Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Log Aktivitas Pelanggaran Real-Time (Kronologis)
          </div>
          <div className="text-xs text-slate-500">
            Total {allViolations.length} catatan aktivitas
          </div>
        </div>

        {allViolations.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Tidak ada riwayat pelanggaran tercatat untuk filter ini. Seluruh siswa menjaga integritas ujian.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 font-semibold text-slate-600">
                  <th className="py-3 px-4 w-32">Waktu (WIB)</th>
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4">Ujian</th>
                  <th className="py-3 px-4">Jenis Pelanggaran</th>
                  <th className="py-3 px-4">Detail Kejadian</th>
                  <th className="py-3 px-4 text-center w-24">Insiden Ke-</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allViolations.map((v) => (
                  <tr key={v.log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-700 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{v.log.timestamp}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{v.session.studentName}</div>
                      <div className="text-[11px] text-slate-500">{v.session.className} · {v.session.studentNisn}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <span className="truncate max-w-[180px] block font-medium">
                        {v.exam?.title || v.session.tokenUsed}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded text-[11px] whitespace-nowrap">
                        {v.log.typeName}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs">
                      {v.log.details}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        #{v.log.violationNumber}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
