import React from 'react';
import { Exam, StudentExamSession, User, EXAM_CATEGORY_LABELS } from '../../types';
import { X, Printer, Download, School } from 'lucide-react';

interface PrintReportModalProps {
  exam: Exam;
  sessions: StudentExamSession[];
  currentUser: User | null;
  onClose: () => void;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  exam,
  sessions,
  currentUser,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['No', 'NISN', 'Nama Siswa', 'Kelas', 'Nilai Akhir', 'KKM', 'Status', 'Jumlah Pelanggaran', 'Waktu Selesai'];
    const rows = sessions.map((s, idx) => [
      idx + 1,
      `'${s.studentNisn}`,
      `"${s.studentName}"`,
      `"${s.className}"`,
      s.calculatedScore ?? 0,
      exam.settings.kkm,
      (s.calculatedScore ?? 0) >= exam.settings.kkm ? 'TUNTAS' : 'REMIDIAL',
      s.violationsCount,
      s.submittedAt ? new Date(s.submittedAt).toLocaleTimeString('id-ID') : 'Belum Selesai',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Nilai_${exam.token}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const passedCount = sessions.filter(s => (s.calculatedScore ?? 0) >= exam.settings.kkm).length;
  const remidialCount = sessions.length - passedCount;
  const avgScore = sessions.length > 0
    ? Math.round(sessions.reduce((acc, s) => acc + (s.calculatedScore ?? 0), 0) / sessions.length)
    : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Top Control Bar (Hidden on print) */}
        <div className="no-print px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Pratinjau Berita Acara & Rekapitulasi Nilai Asesmen
            </h2>
            <p className="text-xs text-slate-500">
              Format cetak resmi arsip sekolah / madrasah
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Dokumen</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-8 font-sans bg-white text-slate-900">
          {/* Official Letterhead (KOP SURAT) */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6 text-center">
            <div className="text-xs font-bold tracking-widest uppercase text-slate-600">
              KEMENTERIAN AGAMA REPUBLIK INDONESIA · KANTOR KEMENAG KABUPATEN PASER
            </div>
            <div className="text-lg font-extrabold uppercase text-slate-900 tracking-wide mt-0.5">
              MADRASAH IBTIDAIYAH NEGERI 1 PASER
            </div>
            <div className="text-xs text-slate-600 mt-1">
              Jl. Kusuma Bangsa Km. 5, Tanah Grogot, Kabupaten Paser, Kalimantan Timur · Web: min1paser.sch.id
            </div>
            <div className="text-xs font-bold text-slate-800 tracking-wider mt-2 underline uppercase">
              BERITA ACARA & REKAPITULASI PELAKSANAAN ASESMEN BERBASIS KOMPUTER (CBT)
            </div>
          </div>

          {/* Exam Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs mb-6 p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div>
              <div className="flex gap-2 py-0.5">
                <span className="w-32 font-semibold text-slate-600">Jenis Asesmen</span>
                <span className="font-semibold text-blue-800">: {EXAM_CATEGORY_LABELS[exam.category || 'sumatif_akhir_semester']}</span>
              </div>
              <div className="flex gap-2 py-0.5">
                <span className="w-32 font-semibold text-slate-600">Mata Pelajaran</span>
                <span>: {exam.subject}</span>
              </div>
              <div className="flex gap-2 py-0.5">
                <span className="w-32 font-semibold text-slate-600">Tingkat / Kelas</span>
                <span>: {exam.gradeLevel}</span>
              </div>
              <div className="flex gap-2 py-0.5">
                <span className="w-32 font-semibold text-slate-600">Judul Asesmen</span>
                <span>: {exam.title}</span>
              </div>
            </div>
            <div>
              <div className="flex gap-2 py-0.5">
                <span className="w-32 font-semibold text-slate-600">Kode Token</span>
                <span className="font-mono font-bold">: {exam.token}</span>
              </div>
              <div className="flex gap-2 py-0.5">
                <span className="w-32 font-semibold text-slate-600">Kriteria KKM</span>
                <span>: {exam.settings.kkm}</span>
              </div>
              <div className="flex gap-2 py-0.5">
                <span className="w-32 font-semibold text-slate-600">Durasi Pengerjaan</span>
                <span>: {exam.settings.durationMinutes} Menit</span>
              </div>
            </div>
          </div>

          {/* Statistical Highlights */}
          <div className="grid grid-cols-4 gap-3 text-center mb-6 text-xs">
            <div className="p-2 border border-slate-200 rounded bg-slate-50">
              <div className="text-[11px] text-slate-500 uppercase">Peserta Terdaftar</div>
              <div className="text-base font-bold text-slate-900 mt-0.5 tabular-nums">{sessions.length} Siswa</div>
            </div>
            <div className="p-2 border border-slate-200 rounded bg-slate-50">
              <div className="text-[11px] text-slate-500 uppercase">Tuntas KKM</div>
              <div className="text-base font-bold text-emerald-700 mt-0.5 tabular-nums">{passedCount} Siswa</div>
            </div>
            <div className="p-2 border border-slate-200 rounded bg-slate-50">
              <div className="text-[11px] text-slate-500 uppercase">Remidial</div>
              <div className="text-base font-bold text-amber-700 mt-0.5 tabular-nums">{remidialCount} Siswa</div>
            </div>
            <div className="p-2 border border-slate-200 rounded bg-slate-50">
              <div className="text-[11px] text-slate-500 uppercase">Rata-Rata Nilai</div>
              <div className="text-base font-bold text-blue-700 mt-0.5 tabular-nums">{avgScore}</div>
            </div>
          </div>

          {/* Students Result Table */}
          <table className="w-full text-left text-xs border-collapse border border-slate-300 mb-8">
            <thead>
              <tr className="bg-slate-100 font-semibold text-slate-800">
                <th className="border border-slate-300 p-2 text-center w-10">No</th>
                <th className="border border-slate-300 p-2 w-28">NISN</th>
                <th className="border border-slate-300 p-2">Nama Siswa</th>
                <th className="border border-slate-300 p-2 w-24">Kelas</th>
                <th className="border border-slate-300 p-2 text-center w-20">Nilai</th>
                <th className="border border-slate-300 p-2 text-center w-24">Ketuntasan</th>
                <th className="border border-slate-300 p-2 text-center w-24">Pelanggaran</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s, idx) => {
                const score = s.calculatedScore ?? 0;
                const isPassed = score >= exam.settings.kkm;
                return (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="border border-slate-300 p-2 text-center tabular-nums">{idx + 1}</td>
                    <td className="border border-slate-300 p-2 font-mono tabular-nums">{s.studentNisn}</td>
                    <td className="border border-slate-300 p-2 font-medium">{s.studentName}</td>
                    <td className="border border-slate-300 p-2">{s.className}</td>
                    <td className="border border-slate-300 p-2 text-center font-bold font-mono tabular-nums">{score}</td>
                    <td className="border border-slate-300 p-2 text-center">
                      <span className={`font-semibold ${isPassed ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {isPassed ? 'TUNTAS' : 'REMIDIAL'}
                      </span>
                    </td>
                    <td className="border border-slate-300 p-2 text-center font-mono tabular-nums">
                      {s.violationsCount > 0 ? `${s.violationsCount}x Catatan` : 'Nihil'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Signatures */}
          <div className="grid grid-cols-2 text-xs pt-6 text-center">
            <div>
              <div>Mengetahui,</div>
              <div className="font-semibold">Kepala Madrasah</div>
              <div className="h-16"></div>
              <div className="font-bold underline">H. Muhammad Arsyad, M.Pd</div>
              <div className="text-slate-600">NIP. 197804152005011006</div>
            </div>
            <div>
              <div>Tanah Grogot, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              <div className="font-semibold">Guru Pengampu / Proktor CBT</div>
              <div className="h-16"></div>
              <div className="font-bold underline">{currentUser?.name || 'Dzakirul Husni, S.Pd'}</div>
              <div className="text-slate-600">NIP. {currentUser?.nip || '199005122019031008'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
