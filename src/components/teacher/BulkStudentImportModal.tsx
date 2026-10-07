import React, { useState } from 'react';
import { User } from '../../types';
import { storage } from '../../services/storage';
import { 
  X, 
  Upload, 
  FileText, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  Sparkles,
  ArrowRight,
  Database
} from 'lucide-react';

interface ParsedStudentRow {
  nisn: string;
  name: string;
  className: string;
  isValid: boolean;
  errorReason?: string;
}

interface BulkStudentImportModalProps {
  onSuccess: (count: number) => void;
  onClose: () => void;
}

export const BulkStudentImportModal: React.FC<BulkStudentImportModalProps> = ({
  onSuccess,
  onClose,
}) => {
  const [inputText, setInputText] = useState<string>('');
  const [defaultClass, setDefaultClass] = useState<string>('Kelas VI-A');
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [importStatus, setImportStatus] = useState<string>('');

  // Sample data generator for quick test
  const SAMPLE_DATA_MI = `0125550001, Muhammad Al-Farabi, Kelas VI-A
0125550002, Siti Nur Halizah, Kelas VI-A
0125550003, Rayhan Al-Ghifari, Kelas VI-A
0125550004, Zahra Amelia Putri, Kelas VI-A
0125550005, Bilal Ramadhan, Kelas VI-A
0125550006, Fatimah Az-Zahra, Kelas VI-B
0125550007, Kenzo Al-Fatih, Kelas VI-B
0125550008, Nabila Syakirah, Kelas VI-B
0125550009, Zaidan Abdillah, Kelas VI-B
0125550010, Maryam Salsabila, Kelas VI-B`;

  // Parse raw text into structured rows
  const parseRawText = (raw: string, fallbackClass: string) => {
    const lines = raw.split(/\r?\n/).filter(line => line.trim().length > 0);
    const results: ParsedStudentRow[] = [];

    lines.forEach((line, index) => {
      // Skip header if detected
      if (index === 0 && (line.toLowerCase().includes('nisn') || line.toLowerCase().includes('nama'))) {
        return;
      }

      // Support comma (,), semicolon (;), or tab (\t) delimiter
      let parts: string[] = [];
      if (line.includes('\t')) {
        parts = line.split('\t');
      } else if (line.includes(';')) {
        parts = line.split(';');
      } else if (line.includes(',')) {
        parts = line.split(',');
      } else {
        parts = line.trim().split(/\s{2,}/); // 2 or more spaces
      }

      const nisn = (parts[0] || '').trim();
      const name = (parts[1] || '').trim();
      const className = (parts[2] || fallbackClass).trim();

      let isValid = true;
      let errorReason = '';

      if (!nisn) {
        isValid = false;
        errorReason = 'NISN kosong';
      } else if (!name) {
        isValid = false;
        errorReason = 'Nama siswa kosong';
      }

      results.push({
        nisn,
        name,
        className: className || fallbackClass,
        isValid,
        errorReason,
      });
    });

    setParsedRows(results);
  };

  const handleTextChange = (text: string) => {
    setInputText(text);
    parseRawText(text, defaultClass);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setInputText(content);
        parseRawText(content, defaultClass);
      }
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    setInputText(SAMPLE_DATA_MI);
    parseRawText(SAMPLE_DATA_MI, defaultClass);
  };

  const handleDownloadTemplate = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,NISN,Nama Siswa,Kelas\n0125550001,Muhammad Al-Farabi,Kelas VI-A\n0125550002,Siti Nur Halizah,Kelas VI-A\n0125550003,Rayhan Al-Ghifari,Kelas VI-B';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Template_Import_Siswa_MIN1Paser.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExecuteImport = () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) {
      setImportStatus('Tidak ada data siswa yang valid untuk diimpor.');
      return;
    }

    const payload = validRows.map(r => ({
      name: r.name,
      nisn: r.nisn,
      className: r.className,
      username: r.nisn,
    }));

    const result = storage.importStudentsBatch(payload, 'MI Negeri 1 Paser');
    onSuccess(result.addedCount + result.updatedCount);
  };

  const validCount = parsedRows.filter(r => r.isValid).length;
  const invalidCount = parsedRows.length - validCount;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Tambah & Impor Siswa Secara Massal
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              MI Negeri 1 Paser · Masukkan daftar nama dan NISN sekaligus dari file Excel atau teks
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Action Tools: Download Template, Load Sample, Upload File */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="px-3 py-1.5 bg-white text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold border border-blue-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Format CSV</span>
              </button>

              <button
                type="button"
                onClick={handleLoadSample}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Muat Contoh 10 Siswa MI</span>
              </button>
            </div>

            <label className="px-3 py-1.5 bg-white text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold border border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Unggah File .CSV / .TXT</span>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Quick Guide & Textarea */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Tempel (Paste) Data Siswa dari Excel / Spreadsheet:
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500">Kelas Standar:</span>
                <select
                  value={defaultClass}
                  onChange={(e) => {
                    setDefaultClass(e.target.value);
                    parseRawText(inputText, e.target.value);
                  }}
                  className="px-2 py-0.5 text-xs rounded border border-slate-300 bg-white"
                >
                  <option value="Kelas VI-A">Kelas VI-A</option>
                  <option value="Kelas VI-B">Kelas VI-B</option>
                  <option value="Kelas V-A">Kelas V-A</option>
                  <option value="Kelas V-B">Kelas V-B</option>
                </select>
              </div>
            </div>

            <textarea
              rows={6}
              value={inputText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Contoh format per baris:&#10;0125550001, Muhammad Al-Farabi, Kelas VI-A&#10;0125550002, Siti Nur Halizah, Kelas VI-A&#10;(Bisa langsung copy-paste kolom dari file Excel)"
              className="w-full p-3.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono text-slate-900 leading-relaxed"
            />
            <p className="text-[11px] text-slate-500">
              *Format per baris: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">NISN, Nama Siswa, Kelas</code> (atau pemisah tab dari Excel). Jika kelas tidak ditulis, otomatis menggunakan Kelas Standar.
            </p>
          </div>

          {/* Real-Time Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <span>Pratinjau Hasil Pembacaan Data:</span>
                  <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                    {validCount} Siap Diimpor
                  </span>
                  {invalidCount > 0 && (
                    <span className="text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded">
                      {invalidCount} Baris Tidak Valid
                    </span>
                  )}
                </div>
              </div>

              <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200 shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-600 sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">No</th>
                      <th className="py-2.5 px-3 w-28">NISN</th>
                      <th className="py-2.5 px-3">Nama Lengkap Siswa</th>
                      <th className="py-2.5 px-3 w-24">Kelas</th>
                      <th className="py-2.5 px-3 text-center w-24">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} className={row.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/50'}>
                        <td className="py-2 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-2 px-3 font-mono font-bold text-slate-800">{row.nisn || '-'}</td>
                        <td className="py-2 px-3 font-medium text-slate-900">{row.name || '-'}</td>
                        <td className="py-2 px-3 text-slate-600">{row.className}</td>
                        <td className="py-2 px-3 text-center">
                          {row.isValid ? (
                            <span className="text-emerald-700 font-semibold text-[11px] inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Valid</span>
                            </span>
                          ) : (
                            <span className="text-rose-600 font-semibold text-[11px] inline-flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>{row.errorReason}</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {importStatus && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{importStatus}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Siswa yang diimpor dapat langsung login ujian menggunakan NISN masing-masing.
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={validCount === 0}
              onClick={handleExecuteImport}
              className={`px-5 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-sm ${
                validCount > 0
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Simpan & Impor {validCount} Siswa</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
