import React, { useState } from 'react';
import { User, StudentExamSession } from '../../types';
import { storage } from '../../services/storage';
import { BulkStudentImportModal } from './BulkStudentImportModal';
import { 
  UserPlus, 
  Search, 
  Trash2, 
  Edit, 
  Download, 
  CheckCircle2, 
  FileSpreadsheet,
  GraduationCap,
  AlertTriangle,
  School,
  X
} from 'lucide-react';

interface StudentManagerViewProps {
  students: User[];
  sessions: StudentExamSession[];
  onRefresh: () => void;
}

export const StudentManagerView: React.FC<StudentManagerViewProps> = ({
  students,
  sessions,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [isBulkModalOpen, setIsBulkModalOpen] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');

  // Single student modal state (Add)
  const [isSingleAddOpen, setIsSingleAddOpen] = useState<boolean>(false);
  const [singleNisn, setSingleNisn] = useState<string>('');
  const [singleName, setSingleName] = useState<string>('');
  const [singleClass, setSingleClass] = useState<string>('Kelas VI-A');
  const [singleSchool, setSingleSchool] = useState<string>('MI Negeri 1 Paser');

  // Edit student modal state
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editNisn, setEditNisn] = useState<string>('');
  const [editClass, setEditClass] = useState<string>('Kelas VI-A');
  const [editSchool, setEditSchool] = useState<string>('MI Negeri 1 Paser');
  const [editError, setEditError] = useState<string>('');

  // Delete student confirmation modal state
  const [deletingStudent, setDeletingStudent] = useState<User | null>(null);

  // Filter classes available
  const availableClasses = Array.from(new Set(students.map(s => s.className || 'Kelas VI-A'))).sort();

  const filteredStudents = students.filter(student => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.nisn || '').includes(searchQuery);

    const matchesClass = selectedClass === 'all' || student.className === selectedClass;

    return matchesSearch && matchesClass;
  });

  const handleOpenEdit = (student: User) => {
    setEditingStudent(student);
    setEditName(student.name);
    setEditNisn(student.nisn || '');
    setEditClass(student.className || 'Kelas VI-A');
    setEditSchool(student.schoolName || 'MI Negeri 1 Paser');
    setEditError('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    if (!editName.trim() || !editNisn.trim()) {
      setEditError('Nama lengkap dan NISN wajib diisi.');
      return;
    }

    // Check if NISN is changed and conflicts with another student
    const cleanNisn = editNisn.trim();
    const isConflict = students.some(
      s => s.id !== editingStudent.id && s.nisn?.toLowerCase() === cleanNisn.toLowerCase()
    );
    if (isConflict) {
      setEditError(`NISN "${cleanNisn}" sudah terdaftar untuk siswa lain.`);
      return;
    }

    const updated: User = {
      ...editingStudent,
      name: editName.trim(),
      nisn: cleanNisn,
      username: cleanNisn,
      className: editClass.trim(),
      schoolName: editSchool.trim() || 'MI Negeri 1 Paser',
    };

    storage.updateStudent(updated);
    onRefresh();
    setEditingStudent(null);
    setFeedbackMsg(`Data siswa "${updated.name}" berhasil diperbarui.`);
    setTimeout(() => setFeedbackMsg(''), 4500);
  };

  const handleConfirmDelete = () => {
    if (!deletingStudent) return;
    const { id, name } = deletingStudent;
    storage.deleteStudent(id);
    onRefresh();
    setDeletingStudent(null);
    setFeedbackMsg(`Siswa "${name}" berhasil dihapus dari sistem.`);
    setTimeout(() => setFeedbackMsg(''), 4500);
  };

  const handleSaveSingleStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNisn = singleNisn.trim();
    const cleanName = singleName.trim();
    if (!cleanNisn || !cleanName) return;

    // Check duplicate NISN
    const exists = students.some(s => s.nisn?.toLowerCase() === cleanNisn.toLowerCase());
    if (exists) {
      alert(`NISN "${cleanNisn}" sudah digunakan siswa lain.`);
      return;
    }

    const newStudent: User = {
      id: `student-${Date.now()}`,
      name: cleanName,
      username: cleanNisn,
      role: 'siswa',
      nisn: cleanNisn,
      className: singleClass.trim(),
      schoolName: singleSchool.trim() || 'MI Negeri 1 Paser',
    };

    storage.saveStudent(newStudent);
    onRefresh();
    setIsSingleAddOpen(false);
    setSingleNisn('');
    setSingleName('');
    setFeedbackMsg(`Siswa baru "${newStudent.name}" berhasil ditambahkan.`);
    setTimeout(() => setFeedbackMsg(''), 4500);
  };

  const handleExportCSV = () => {
    const headers = ['No', 'NISN', 'Nama Siswa', 'Kelas', 'Sekolah'];
    const rows = filteredStudents.map((s, idx) => [
      idx + 1,
      `'${s.nisn || ''}`,
      `"${s.name}"`,
      `"${s.className || 'Kelas VI-A'}"`,
      `"${s.schoolName || 'MI Negeri 1 Paser'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Daftar_Siswa_MIN1Paser_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>Basis Data Siswa Peserta Ujian · MI Negeri 1 Paser</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Daftar Siswa Terdaftar ({students.length} Siswa)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola data siswa, lakukan penambahan massal melalui Excel / CSV, atau tambah siswa secara manual.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSingleAddOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Tambah Satuan</span>
          </button>

          <button
            type="button"
            onClick={() => setIsBulkModalOpen(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>+ Impor Siswa Massal (Excel/CSV)</span>
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
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
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Filter Kelas:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            >
              <option value="all">Semua Kelas ({students.length})</option>
              {availableClasses.map(cls => (
                <option key={cls} value={cls}>
                  {cls} ({students.filter(s => s.className === cls).length})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Daftar Peserta Didik Terdaftar
          </div>
          <div className="text-xs text-slate-500 font-mono">
            Menampilkan {filteredStudents.length} dari {students.length} siswa
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Tidak ada siswa ditemukan untuk kriteria pencarian ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 font-semibold text-slate-600">
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4 w-32">NISN Siswa</th>
                  <th className="py-3 px-4">Nama Lengkap Siswa</th>
                  <th className="py-3 px-4 w-28">Tingkat / Kelas</th>
                  <th className="py-3 px-4">Madrasah</th>
                  <th className="py-3 px-4 text-center w-28">Riwayat Ujian</th>
                  <th className="py-3 px-4 text-center w-28">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student, idx) => {
                  const studentSessions = sessions.filter(s => s.studentId === student.id || s.studentNisn === student.nisn);
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-center font-mono text-slate-400 tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 tracking-wider">
                        {student.nisn || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{student.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">Username: {student.username}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {student.className || 'Kelas VI-A'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {student.schoolName || 'MI Negeri 1 Paser'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {studentSessions.length > 0 ? (
                          <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                            {studentSessions.length} Sesi CBT
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Belum Ada</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(student)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1 font-medium text-[11px]"
                            title="Edit Data Siswa"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <span className="text-slate-200">|</span>
                          <button
                            type="button"
                            onClick={() => setDeletingStudent(student)}
                            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1 font-medium text-[11px]"
                            title="Hapus Data Siswa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SINGLE STUDENT ADD MODAL */}
      {isSingleAddOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Tambah Data Siswa Satuan
              </h3>
              <button
                type="button"
                onClick={() => setIsSingleAddOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSingleStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Induk Siswa Nasional (NISN) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={singleNisn}
                  onChange={(e) => setSingleNisn(e.target.value)}
                  placeholder="Contoh: 0125550011"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap Siswa <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={singleName}
                  onChange={(e) => setSingleName(e.target.value)}
                  placeholder="Contoh: Muhammad Ilham Pratama"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kelas / Rombel
                </label>
                <select
                  value={singleClass}
                  onChange={(e) => setSingleClass(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                >
                  <option value="Kelas VI-A">Kelas VI-A</option>
                  <option value="Kelas VI-B">Kelas VI-B</option>
                  <option value="Kelas V-A">Kelas V-A</option>
                  <option value="Kelas V-B">Kelas V-B</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsSingleAddOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STUDENT MODAL */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Edit className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Edit Data Siswa
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    ID: {editingStudent.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="p-3 mb-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Induk Siswa Nasional (NISN) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editNisn}
                  onChange={(e) => setEditNisn(e.target.value)}
                  placeholder="Contoh: 0125550011"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  NISN digunakan sebagai username login siswa ke sistem CBT.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap Siswa <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Contoh: Muhammad Ilham Pratama"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kelas / Rombel
                </label>
                <select
                  value={editClass}
                  onChange={(e) => setEditClass(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                >
                  <option value="Kelas VI-A">Kelas VI-A</option>
                  <option value="Kelas VI-B">Kelas VI-B</option>
                  <option value="Kelas V-A">Kelas V-A</option>
                  <option value="Kelas V-B">Kelas V-B</option>
                  <option value="Kelas IV-A">Kelas IV-A</option>
                  <option value="Kelas IV-B">Kelas IV-B</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Madrasah / Sekolah
                </label>
                <input
                  type="text"
                  value={editSchool}
                  onChange={(e) => setEditSchool(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingStudent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Konfirmasi Hapus Siswa
                </h3>
                <p className="text-xs text-slate-500">
                  Tindakan ini akan menghapus siswa secara permanen dari sistem CBT.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs text-slate-700 mb-5">
              <div className="flex justify-between">
                <span className="text-slate-500">Nama Siswa:</span>
                <span className="font-bold text-slate-900">{deletingStudent.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">NISN:</span>
                <span className="font-mono font-bold text-slate-900">{deletingStudent.nisn || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kelas:</span>
                <span className="font-semibold text-slate-700">{deletingStudent.className || 'Kelas VI-A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sekolah:</span>
                <span className="text-slate-700">{deletingStudent.schoolName || 'MI Negeri 1 Paser'}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingStudent(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Siswa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK STUDENT IMPORT MODAL */}
      {isBulkModalOpen && (
        <BulkStudentImportModal
          onSuccess={(count) => {
            onRefresh();
            setIsBulkModalOpen(false);
            setFeedbackMsg(`Berhasil mengimpor dan memperbarui ${count} data siswa MI Negeri 1 Paser!`);
            setTimeout(() => setFeedbackMsg(''), 5000);
          }}
          onClose={() => setIsBulkModalOpen(false)}
        />
      )}
    </div>
  );
};
