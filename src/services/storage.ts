/**
 * Storage Service for SIMAS CBT
 * Provides robust localStorage persistence with initial curriculum datasets.
 */

import { Exam, User, StudentExamSession, ViolationLog, Question } from '../types';

const STORAGE_KEYS = {
  CURRENT_USER: 'simas_cbt_paser_user_v4',
  EXAMS: 'simas_cbt_paser_exams_v4',
  SESSIONS: 'simas_cbt_paser_sessions_v4',
  STUDENTS: 'simas_cbt_paser_students_v4',
};

// Initial Mock Users
export const DEFAULT_USERS: User[] = [
  {
    id: 'teacher-1',
    name: 'Dzakirul Husni, S.Pd',
    username: 'guru',
    role: 'guru',
    nip: '199005122019031008',
    schoolName: 'MI Negeri 1 Paser',
  },
  {
    id: 'student-1',
    name: 'Ahmad Fauzi',
    username: 'ahmad',
    role: 'siswa',
    nisn: '0121234567',
    className: 'Kelas VI-A',
    schoolName: 'MI Negeri 1 Paser',
  },
  {
    id: 'student-2',
    name: 'Farah Annisa',
    username: 'farah',
    role: 'siswa',
    nisn: '0122345678',
    className: 'Kelas VI-A',
    schoolName: 'MI Negeri 1 Paser',
  },
  {
    id: 'student-3',
    name: 'Dimas Wahyu Pratama',
    username: 'dimas',
    role: 'siswa',
    nisn: '0123456789',
    className: 'Kelas VI-B',
    schoolName: 'MI Negeri 1 Paser',
  },
  {
    id: 'student-4',
    name: 'Siti Rahmawati',
    username: 'siti',
    role: 'siswa',
    nisn: '0124567890',
    className: 'Kelas VI-B',
    schoolName: 'MI Negeri 1 Paser',
  },
];

// Questions by Subject (Fase C / Kelas 6 MI)
export const QUESTIONS_IPAS: Question[] = [
  {
    id: 'q-ipas-1',
    number: 1,
    type: 'pg',
    points: 20,
    text: 'Planet terbesar dalam tata surya kita yang tersusun sebagian besar atas gas hidrogen dan helium serta memiliki bintik merah raksasa adalah...',
    options: [
      { id: 'A', text: 'Mars' },
      { id: 'B', text: 'Jupiter' },
      { id: 'C', text: 'Saturnus' },
      { id: 'D', text: 'Uranus' },
    ],
    correctAnswer: 'B',
    explanation: 'Jupiter adalah planet terbesar dalam tata surya kita dengan massa lebih dari dua kali lipat gabungan seluruh planet lainnya.',
  },
  {
    id: 'q-ipas-2',
    number: 2,
    type: 'pg',
    points: 20,
    text: 'Dalam rantai makanan ekosistem sawah: Padi -> Belalang -> Katak -> Ular -> Elang. Jika populasi katak menurun drastis akibat perburuan liar, dampak langsung yang akan terjadi adalah...',
    options: [
      { id: 'A', text: 'Populasi belalang akan meningkat pesat dan merusak tanaman padi' },
      { id: 'B', text: 'Populasi elang akan langsung bertambah banyak' },
      { id: 'C', text: 'Tanaman padi akan tumbuh semakin subur tanpa hama' },
      { id: 'D', text: 'Populasi ular akan bertambah dengan cepat' },
    ],
    correctAnswer: 'A',
    explanation: 'Katak adalah predator alami belalang. Tanpa katak, populasi belalang melonjak drastis sehingga merugikan hasil panen padi petani.',
  },
  {
    id: 'q-ipas-3',
    number: 3,
    type: 'isian',
    points: 20,
    text: 'Bagian pada sistem pernapasan manusia yang berfungsi sebagai tempat terjadinya pertukaran gas oksigen (O2) dan karbon dioksida (CO2) adalah...',
    correctAnswer: 'alveolus',
    explanation: 'Pertukaran gas terjadi secara difusi pada gelembung-gelembung halus paru-paru yang disebut alveolus.',
  },
  {
    id: 'q-ipas-4',
    number: 4,
    type: 'benar_salah',
    points: 15,
    text: 'Panel surya (solar cell) merupakan teknologi ramah lingkungan yang mengubah energi cahaya matahari langsung menjadi energi listrik DC.',
    correctAnswer: true,
    explanation: 'BENAR. Sel fotovoltaik pada panel surya menyerap foton matahari dan menghasilkan arus listrik searah.',
  },
  {
    id: 'q-ipas-5',
    number: 5,
    type: 'uraian',
    points: 25,
    text: 'Sebutkan 3 (tiga) upaya nyata yang dapat dilakukan oleh siswa di lingkungan madrasah untuk menghemat energi listrik dan melestarikan lingkungan!',
    correctAnswer: 'rubric',
    rubricGuide: 'Kriteria Penilaian (Maksimal 25 Poin):\n1. Mematikan lampu/kipas angin saat kelas kosong (8 Poin)\n2. Memanfaatkan ventilasi dan cahaya alami jendela di siang hari (8 Poin)\n3. Mencabut steker alat elektronik jika tidak digunakan & membuang sampah pada tempatnya (9 Poin)',
    explanation: 'Jawaban mencakup mematikan lampu dan kipas angin saat meninggalkan ruang kelas, memanfaatkan cahaya jendela alami, dan menghemat penggunaan air/peralatan listrik.',
  },
];

export const QUESTIONS_MATEMATIKA: Question[] = [
  {
    id: 'q-mat-1',
    number: 1,
    type: 'pg',
    points: 20,
    text: 'Sebuah balok memiliki panjang 15 cm, lebar 8 cm, dan tinggi 10 cm. Volume balok tersebut adalah...',
    options: [
      { id: 'A', text: '1.200 cm³' },
      { id: 'B', text: '1.080 cm³' },
      { id: 'C', text: '960 cm³' },
      { id: 'D', text: '600 cm³' },
    ],
    correctAnswer: 'A',
    explanation: 'Volume balok = panjang x lebar x tinggi = 15 x 8 x 10 = 1.200 cm³.',
  },
  {
    id: 'q-mat-2',
    number: 2,
    type: 'pg',
    points: 20,
    text: 'Data nilai ulangan matematika 10 siswa MI Negeri 1 Paser: 75, 80, 85, 70, 90, 80, 85, 80, 75, 80. Modus dari data tersebut adalah...',
    options: [
      { id: 'A', text: '75' },
      { id: 'B', text: '80' },
      { id: 'C', text: '85' },
      { id: 'D', text: '90' },
    ],
    correctAnswer: 'B',
    explanation: 'Modus adalah nilai yang paling sering muncul. Nilai 80 muncul sebanyak 4 kali.',
  },
  {
    id: 'q-mat-3',
    number: 3,
    type: 'isian',
    points: 20,
    text: 'Ibu membeli kain sepanjang 3,5 meter. Digunakan untuk membuat seragam 2,25 meter. Sisa kain Ibu sekarang adalah ... meter (tulis dalam bentuk desimal, misal: 1.25)',
    correctAnswer: '1.25',
    explanation: '3,5 - 2,25 = 1,25 meter.',
  },
  {
    id: 'q-mat-4',
    number: 4,
    type: 'benar_salah',
    points: 15,
    text: 'Bangun ruang kubus memiliki 6 sisi berbentuk persegi yang kongruen dan memiliki 12 rusuk yang sama panjang.',
    correctAnswer: true,
    explanation: 'BENAR. Sifat kubus memiliki 6 bidang sisi berbentuk persegi sama besar dan 12 rusuk sama panjang.',
  },
  {
    id: 'q-mat-5',
    number: 5,
    type: 'uraian',
    points: 25,
    text: 'Koperasi madrasah menjual buku tulis seharga Rp 5.000 per buah dengan diskon 10%. Jika Ahmad membeli 6 buah buku tulis dan membayar dengan uang selembar Rp 50.000, hitunglah total yang harus dibayar dan uang kembalian yang diterima!',
    correctAnswer: 'rubric',
    rubricGuide: 'Kriteria Penilaian (Maksimal 25 Poin):\n1. Harga 6 buku sebelum diskon: 6 x 5.000 = Rp 30.000 (8 Poin)\n2. Diskon 10%: 10% x 30.000 = Rp 3.000. Total bayar = Rp 27.000 (9 Poin)\n3. Uang kembalian = 50.000 - 27.000 = Rp 23.000 (8 Poin)',
    explanation: 'Total bayar = Rp 27.000, Uang kembalian = Rp 23.000.',
  },
];

export const QUESTIONS_BIND: Question[] = [
  {
    id: 'q-bind-1',
    number: 1,
    type: 'pg',
    points: 25,
    text: 'Bacalah teks berikut: "Gerhana matahari terjadi saat posisi bulan berada di antara bumi dan matahari sehingga menutup sebagian atau seluruh cahaya matahari yang sampai ke bumi." Gagasan utama kutipan teks eksplanasi tersebut adalah...',
    options: [
      { id: 'A', text: 'Proses terjadinya gerhana matahari' },
      { id: 'B', text: 'Keindahan fenomena luar angkasa' },
      { id: 'C', text: 'Jarak bumi dengan matahari' },
      { id: 'D', text: 'Manfaat sinar matahari bagi kehidupan' },
    ],
    correctAnswer: 'A',
    explanation: 'Paragraf tersebut menjelaskan sebab dan posisi benda langit saat terjadinya fenomena gerhana matahari.',
  },
  {
    id: 'q-bind-2',
    number: 2,
    type: 'pg',
    points: 25,
    text: 'Manakah di bawah ini kalimat yang menggunakan kata baku dan efektif menurut kaidah bahasa Indonesia?',
    options: [
      { id: 'A', text: 'Para guru-guru sedang mengadakan rapat kerja di ruang guru.' },
      { id: 'B', text: 'Seluruh siswa kelas enam mengikuti asesmen digital dengan tertib.' },
      { id: 'C', text: 'Ia sangat rajin sekali belajar demi untuk cita-citanya.' },
      { id: 'D', text: 'Buku itu telah dibaca oleh saya kemarin sore.' },
    ],
    correctAnswer: 'B',
    explanation: 'Kalimat B efektif dan tidak mengalami pemborosan kata (pleonasme) seperti kalimat A dan C.',
  },
  {
    id: 'q-bind-3',
    number: 3,
    type: 'isian',
    points: 25,
    text: 'Lawan kata (antonim) dari kata "modern" adalah...',
    correctAnswer: 'tradisional',
    explanation: 'Antonim kata modern adalah tradisional atau kuno.',
  },
  {
    id: 'q-bind-4',
    number: 4,
    type: 'benar_salah',
    points: 25,
    text: 'Kata hubung "sehingga" dan "karena" termasuk konjungsi kausalitas (sebab-akibat) yang lazim dipakai pada teks eksplanasi ilmiah.',
    correctAnswer: true,
    explanation: 'BENAR. Teks eksplanasi banyak menggunakan konjungsi kausalitas untuk menjelaskan alur sebab dan akibat fenomena.',
  },
];

export const QUESTIONS_PPKN: Question[] = [
  {
    id: 'q-ppkn-1',
    number: 1,
    type: 'pg',
    points: 25,
    text: 'Sikap saling menghormati antarteman yang berbeda suku dan agama, serta menjaga kerukunan di lingkungan madrasah merupakan pengamalan Pancasila sila ke-...',
    options: [
      { id: 'A', text: 'Pertama (Ketuhanan Yang Maha Esa)' },
      { id: 'B', text: 'Kedua (Kemanusiaan yang Adil dan Beradab)' },
      { id: 'C', text: 'Ketiga (Persatuan Indonesia)' },
      { id: 'D', text: 'Kelima (Keadilan Sosial bagi Seluruh Rakyat Indonesia)' },
    ],
    correctAnswer: 'C',
    explanation: 'Menjaga persatuan dan kerukunan di tengah keberagaman suku bangsa dan latar belakang adalah perwujudan Sila ke-3: Persatuan Indonesia.',
  },
  {
    id: 'q-ppkn-2',
    number: 2,
    type: 'pg',
    points: 25,
    text: 'Ketika memilih ketua kelas melalui musyawarah dan mufakat, keputusan yang telah disepakati bersama harus dijalankan dengan...',
    options: [
      { id: 'A', text: 'Rasa terpaksa demi menghormati wali kelas' },
      { id: 'B', text: 'Iktikad baik dan penuh tanggung jawab' },
      { id: 'C', text: 'Mengeluh jika usulannya tidak terpilih' },
      { id: 'D', text: 'Menolak menjalankan bila merasa tidak cocok' },
    ],
    correctAnswer: 'B',
    explanation: 'Sila ke-4 menegaskan bahwa hasil musyawarah harus ditaati dan dilaksanakan dengan penuh iktikad baik dan tanggung jawab moral.',
  },
  {
    id: 'q-ppkn-3',
    number: 3,
    type: 'isian',
    points: 25,
    text: 'Simbol lambang sila kedua Pancasila yang bermakna hubungan manusia yang saling membutuhkan dan bersatu adalah...',
    correctAnswer: 'rantai',
    explanation: 'Lambang sila kedua adalah Rantai Emas (lingkaran dan persegi yang saling mengait).',
  },
  {
    id: 'q-ppkn-4',
    number: 4,
    type: 'benar_salah',
    points: 25,
    text: 'Mendapatkan pengajaran yang bermutu dari guru merupakan salah satu HAK siswa di madrasah, sedangkan menjaga kebersihan kelas adalah KEWAJIBAN siswa.',
    correctAnswer: true,
    explanation: 'BENAR. Pengajaran adalah hak siswa, sementara memelihara ketertiban dan kebersihan adalah kewajiban yang harus ditunaikan.',
  },
];

export const QUESTIONS_SBDP: Question[] = [
  {
    id: 'q-sbdp-1',
    number: 1,
    type: 'pg',
    points: 25,
    text: 'Tangga nada diatonis mayor memiliki susunan jarak nada (interval) 1 - 1 - 1/2 - 1 - 1 - 1 - 1/2. Ciri umum lagu bertangga nada diatonis mayor adalah...',
    options: [
      { id: 'A', text: 'Bersifat riang gembira dan penuh semangat' },
      { id: 'B', text: 'Bersifat sedih dan mengharukan' },
      { id: 'C', text: 'Biasanya diawali dan diakhiri dengan nada La' },
      { id: 'D', text: 'Memiliki tempo yang sangat lambat' },
    ],
    correctAnswer: 'A',
    explanation: 'Tangga nada diatonis mayor umumnya bernuansa ceria, bersemangat, dan diawali/diakhiri nada Do (misal lagu Maju Tak Gentar, Hari Merdeka).',
  },
  {
    id: 'q-sbdp-2',
    number: 2,
    type: 'pg',
    points: 25,
    text: 'Pola lantai tari kelompok yang membentuk formasi garis mendatar dari kiri ke kanan disebut pola lantai...',
    options: [
      { id: 'A', text: 'Vertikal' },
      { id: 'B', text: 'Horizontal' },
      { id: 'C', text: 'Diagonal' },
      { id: 'D', text: 'Melingkar' },
    ],
    correctAnswer: 'B',
    explanation: 'Pola lantai horizontal membentuk barisan sejajar mendatar (seperti pada Tari Saman dari Aceh).',
  },
  {
    id: 'q-sbdp-3',
    number: 3,
    type: 'isian',
    points: 25,
    text: 'Karya seni rupa yang dibuat dengan menempelkan bermacam-macam bahan alam seperti biji-bijian, daun kering, dan cangkang kerang pada bidang gambar disebut teknik...',
    correctAnswer: 'kolase',
    explanation: 'Kolase adalah karya seni rupa dua dimensi yang dibuat dengan teknik menempel bahan-bahan beraneka ragam ke media dasar.',
  },
  {
    id: 'q-sbdp-4',
    number: 4,
    type: 'benar_salah',
    points: 25,
    text: 'Karya seni patung digolongkan sebagai seni rupa tiga dimensi (3D) karena memiliki ukuran panjang, lebar, volume, serta dapat dinikmati dari berbagai arah sudut pandang.',
    correctAnswer: true,
    explanation: 'BENAR. Patung memiliki ruang volume nyata sehingga merupakan representasi karya seni tiga dimensi.',
  },
];

// Initial Exams
// Initial Exams covering all 5 subjects and 4 categories (Kelas 6 / Fase C)
export const INITIAL_EXAMS: Exam[] = [
  {
    id: 'exam-mat-6c',
    title: 'Sumatif Akhir BAB: Volume Bangun Ruang & Analisis Data',
    category: 'sumatif_akhir_bab',
    subject: 'Matematika',
    gradeLevel: 'Kelas 6 / Fase C',
    token: 'MAT-6C',
    description: 'Penilaian Sumatif Akhir BAB Matematika Kelas 6 Fase C: Menghitung volume bangun ruang balok & kubus, modus data, pecahan desimal, dan pemecahan masalah ekonomi sederhana.',
    instructions: '1. Berdoalah sebelum memulai pengerjaan.\n2. Waktu ujian adalah 40 menit.\n3. Ujian berjalan dalam Mode Layar Penuh (Exam Mode).\n4. Dilarang berpindah aplikasi atau tab peramban.\n5. Jawaban tersimpan otomatis secara berkala.',
    questions: QUESTIONS_MATEMATIKA,
    settings: {
      durationMinutes: 40,
      kkm: 75,
      maxViolations: 3,
      warningGracePeriodSec: 10,
      supervisorPin: '8899',
      shuffleQuestions: false,
      shuffleOptions: false,
      showResultsImmediately: true,
      allowBackNavigation: true,
      scheduleStart: '2026-10-01T07:00:00Z',
      scheduleEnd: '2026-10-31T17:00:00Z',
      questionSelectionCount: 5,
    },
    createdAt: '2026-10-01T08:00:00Z',
    isActive: true,
  },
  {
    id: 'exam-ipas-6c',
    title: 'Sumatif Akhir Semester: Sistem Tata Surya & Pelestarian Energi',
    category: 'sumatif_akhir_semester',
    subject: 'IPAS',
    gradeLevel: 'Kelas 6 / Fase C',
    token: 'IPAS-6C',
    description: 'Asesmen Sumatif Akhir Semester (SAS) IPAS Kelas 6 Fase C: Tata surya, keseimbangan ekosistem dan rantai makanan, sistem pernapasan manusia, dan energi terbarukan.',
    instructions: '1. Periksa kelengkapan soal sebelum menjawab.\n2. Kerjakan soal yang lebih mudah terlebih dahulu.\n3. Laporkan kendala teknis kepada pengawas ruang Dzakirul Husni, S.Pd.',
    questions: QUESTIONS_IPAS,
    settings: {
      durationMinutes: 45,
      kkm: 75,
      maxViolations: 3,
      warningGracePeriodSec: 10,
      supervisorPin: '8899',
      shuffleQuestions: false,
      shuffleOptions: false,
      showResultsImmediately: true,
      allowBackNavigation: true,
      scheduleStart: '2026-10-01T07:00:00Z',
      scheduleEnd: '2026-10-31T17:00:00Z',
      questionSelectionCount: 5,
    },
    createdAt: '2026-10-02T08:30:00Z',
    isActive: true,
  },
  {
    id: 'exam-bind-6c',
    title: 'Asesmen Formatif: Memahami Teks Eksplanasi & Kalimat Efektif',
    category: 'formatif',
    subject: 'Bahasa Indonesia',
    gradeLevel: 'Kelas 6 / Fase C',
    token: 'BIND-6C',
    description: 'Asesmen formatif harian Bahasa Indonesia untuk mengukur daya analisis ide pokok bacaan eksplanasi, sinonim/antonim, dan kalimat efektif.',
    instructions: 'Asesmen Formatif diagnostik mandiri. Nilai dan pembahasan dapat dilihat langsung setelah konfirmasi pengiriman selesai.',
    questions: QUESTIONS_BIND,
    settings: {
      durationMinutes: 25,
      kkm: 70,
      maxViolations: 3,
      warningGracePeriodSec: 10,
      supervisorPin: '8899',
      shuffleQuestions: false,
      shuffleOptions: false,
      showResultsImmediately: true,
      allowBackNavigation: true,
      scheduleStart: '2026-10-01T07:00:00Z',
      scheduleEnd: '2026-10-31T17:00:00Z',
      questionSelectionCount: 4,
    },
    createdAt: '2026-10-03T09:00:00Z',
    isActive: true,
  },
  {
    id: 'exam-ppkn-6c',
    title: 'Sumatif Akhir Semester: Pengamalan Nilai Pancasila & Kebinekaan',
    category: 'sumatif_akhir_semester',
    subject: 'Pendidikan Pancasila',
    gradeLevel: 'Kelas 6 / Fase C',
    token: 'PPKN-6C',
    description: 'Asesmen Sumatif Akhir Semester Pendidikan Pancasila: Nilai persatuan, musyawarah mufakat, hak & kewajiban di madrasah, dan lambang garuda Pancasila.',
    instructions: 'Kerjakan dengan jujur dan teliti mencerminkan nilai integritas insan madrasah berakhlak mulia.',
    questions: QUESTIONS_PPKN,
    settings: {
      durationMinutes: 35,
      kkm: 75,
      maxViolations: 3,
      warningGracePeriodSec: 10,
      supervisorPin: '8899',
      shuffleQuestions: false,
      shuffleOptions: false,
      showResultsImmediately: false,
      allowBackNavigation: true,
      scheduleStart: '2026-10-01T07:00:00Z',
      scheduleEnd: '2026-10-31T17:00:00Z',
      questionSelectionCount: 4,
    },
    createdAt: '2026-10-04T07:45:00Z',
    isActive: true,
  },
  {
    id: 'exam-sbdp-6c',
    title: 'Sumatif Akhir Tahun (SAT): Apresiasi Musik, Tari, & Seni Rupa 3D',
    category: 'sumatif_akhir_tahun',
    subject: 'SBDP',
    gradeLevel: 'Kelas 6 / Fase C',
    token: 'SBDP-6C',
    description: 'Penilaian Sumatif Akhir Tahun (SAT) SBDP Kelas 6 Fase C: Tangga nada diatonis mayor/minor, pola lantai tari Nusantara, teknik kolase, dan karya patung 3D.',
    instructions: '1. Ujian kelulusan akhir tahun resmi MI Negeri 1 Paser.\n2. Patuhi tata tertib Kiosk Mode.\n3. Hasil kelulusan akan diumumkan resmi pihak madrasah.',
    questions: QUESTIONS_SBDP,
    settings: {
      durationMinutes: 45,
      kkm: 75,
      maxViolations: 3,
      warningGracePeriodSec: 10,
      supervisorPin: '8899',
      shuffleQuestions: false,
      shuffleOptions: false,
      showResultsImmediately: false,
      allowBackNavigation: true,
      scheduleStart: '2026-10-01T07:00:00Z',
      scheduleEnd: '2026-10-31T17:00:00Z',
      questionSelectionCount: 4,
    },
    createdAt: '2026-10-05T08:15:00Z',
    isActive: true,
  },
];

// Initial preloaded sessions for demonstration and analytics
export const INITIAL_SESSIONS: StudentExamSession[] = [
  {
    id: 'sess-001',
    examId: 'exam-mat-6c',
    studentId: 'student-2',
    studentName: 'Farah Annisa',
    studentNisn: '0122345678',
    className: 'Kelas VI-A',
    tokenUsed: 'MAT-6C',
    startedAt: '2026-10-07T08:00:00Z',
    submittedAt: '2026-10-07T08:24:12Z',
    deadlineAt: '2026-10-07T08:40:00Z',
    status: 'submitted',
    answers: {
      'q-mat-1': { questionId: 'q-mat-1', answer: 'A', flagged: false, answeredAt: '2026-10-07T08:05:00Z', isCorrect: true },
      'q-mat-2': { questionId: 'q-mat-2', answer: 'B', flagged: false, answeredAt: '2026-10-07T08:09:00Z', isCorrect: true },
      'q-mat-3': { questionId: 'q-mat-3', answer: '1.25', flagged: false, answeredAt: '2026-10-07T08:14:00Z', isCorrect: true },
      'q-mat-4': { questionId: 'q-mat-4', answer: true, flagged: false, answeredAt: '2026-10-07T08:17:00Z', isCorrect: true },
      'q-mat-5': {
        questionId: 'q-mat-5',
        answer: 'Harga sebelum diskon = 6 x 5.000 = Rp 30.000. Diskon 10% = 3.000. Total bayar = Rp 27.000. Uang kembalian = 50.000 - 27.000 = Rp 23.000.',
        flagged: false,
        answeredAt: '2026-10-07T08:22:00Z',
        essayScore: 25,
        essayFeedback: 'Langkah pengerjaan sangat rapi dan hasil perhitungan akurat sempurna.',
      }
    },
    violationsCount: 0,
    violationLogs: [],
    calculatedScore: 100,
    maxScore: 100,
    isPassed: true,
    teacherReviewed: true,
  },
  {
    id: 'sess-002',
    examId: 'exam-ipas-6c',
    studentId: 'student-3',
    studentName: 'Dimas Wahyu Pratama',
    studentNisn: '0123456789',
    className: 'Kelas VI-B',
    tokenUsed: 'IPAS-6C',
    startedAt: '2026-10-07T08:05:00Z',
    submittedAt: '2026-10-07T08:29:45Z',
    deadlineAt: '2026-10-07T08:50:00Z',
    status: 'submitted',
    answers: {
      'q-ipas-1': { questionId: 'q-ipas-1', answer: 'B', flagged: false, answeredAt: '2026-10-07T08:07:00Z', isCorrect: true },
      'q-ipas-2': { questionId: 'q-ipas-2', answer: 'A', flagged: false, answeredAt: '2026-10-07T08:12:00Z', isCorrect: true },
      'q-ipas-3': { questionId: 'q-ipas-3', answer: 'alveolus', flagged: false, answeredAt: '2026-10-07T08:16:00Z', isCorrect: true },
      'q-ipas-4': { questionId: 'q-ipas-4', answer: true, flagged: false, answeredAt: '2026-10-07T08:20:00Z', isCorrect: true },
      'q-ipas-5': {
        questionId: 'q-ipas-5',
        answer: '1. Mematikan lampu kelas saat istirahat. 2. Mematikan kipas angin jika kelas kosong. 3. Memanfaatkan sinar matahari.',
        flagged: false,
        answeredAt: '2026-10-07T08:27:00Z',
        essayScore: 23,
        essayFeedback: 'Tiga contoh upaya penghematan energi sangat tepat.',
      }
    },
    violationsCount: 1,
    violationLogs: [
      {
        id: 'v-01',
        timestamp: '08:15:33 WIB',
        type: 'tab_switch',
        typeName: 'Berpindah Tab / Browser',
        details: 'Halaman ujian kehilangan fokus (visibilityState: hidden). Durasi: 2 detik.',
        violationNumber: 1,
      }
    ],
    calculatedScore: 98,
    maxScore: 100,
    isPassed: true,
    teacherReviewed: true,
  }
];

class StorageService {
  // Initialize datasets
  constructor() {
    this.ensureInitialized();
  }

  ensureInitialized() {
    if (!localStorage.getItem(STORAGE_KEYS.EXAMS)) {
      localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(INITIAL_EXAMS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SESSIONS)) {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(INITIAL_SESSIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(DEFAULT_USERS));
    }
  }

  // User auth state
  getCurrentUser(): User | null {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  setCurrentUser(user: User | null) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  // Exams
  getExams(): Exam[] {
    this.ensureInitialized();
    const raw = localStorage.getItem(STORAGE_KEYS.EXAMS);
    return raw ? JSON.parse(raw) : INITIAL_EXAMS;
  }

  getExamById(id: string): Exam | undefined {
    return this.getExams().find(e => e.id === id);
  }

  getExamByToken(token: string): Exam | undefined {
    const cleanToken = token.trim().toUpperCase();
    return this.getExams().find(e => e.token.toUpperCase() === cleanToken && e.isActive);
  }

  saveExam(exam: Exam): Exam {
    const exams = this.getExams();
    const index = exams.findIndex(e => e.id === exam.id);
    if (index >= 0) {
      exams[index] = exam;
    } else {
      exams.unshift(exam);
    }
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
    return exam;
  }

  deleteExam(id: string) {
    const exams = this.getExams().filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
  }

  // Sessions
  getSessions(): StudentExamSession[] {
    this.ensureInitialized();
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    return raw ? JSON.parse(raw) : INITIAL_SESSIONS;
  }

  getSession(id: string): StudentExamSession | undefined {
    return this.getSessions().find(s => s.id === id);
  }

  getSessionsByExam(examId: string): StudentExamSession[] {
    return this.getSessions().filter(s => s.examId === examId);
  }

  getStudentSession(examId: string, studentId: string): StudentExamSession | undefined {
    return this.getSessions().find(s => s.examId === examId && s.studentId === studentId);
  }

  saveSession(session: StudentExamSession): StudentExamSession {
    const sessions = this.getSessions();
    const index = sessions.findIndex(s => s.id === session.id);
    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.unshift(session);
    }
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    return session;
  }

  // Calculate score helper
  calculateSessionScore(session: StudentExamSession, exam: Exam): { totalScore: number; maxScore: number; isPassed: boolean } {
    let earnedPoints = 0;
    let totalPoints = 0;

    exam.questions.forEach(q => {
      totalPoints += q.points;
      const studentAns = session.answers[q.id];
      if (!studentAns) return;

      if (q.type === 'pg') {
        const isCorrect = String(studentAns.answer).trim().toUpperCase() === String(q.correctAnswer).trim().toUpperCase();
        studentAns.isCorrect = isCorrect;
        if (isCorrect) earnedPoints += q.points;
      } else if (q.type === 'benar_salah') {
        const isCorrect = studentAns.answer === q.correctAnswer;
        studentAns.isCorrect = isCorrect;
        if (isCorrect) earnedPoints += q.points;
      } else if (q.type === 'isian') {
        // Tolerant text matching (case insensitive, trimmed)
        const userClean = String(studentAns.answer || '').trim().toLowerCase();
        const expectedClean = String(q.correctAnswer).trim().toLowerCase();
        const isCorrect = userClean === expectedClean;
        studentAns.isCorrect = isCorrect;
        if (isCorrect) earnedPoints += q.points;
      } else if (q.type === 'uraian') {
        if (typeof studentAns.essayScore === 'number') {
          earnedPoints += studentAns.essayScore;
        }
      }
    });

    const scaledScore = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const isPassed = scaledScore >= exam.settings.kkm;

    return { totalScore: scaledScore, maxScore: 100, isPassed };
  }

  // Student Management Methods
  getStudents(): User[] {
    this.ensureInitialized();
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    const allUsers: User[] = raw ? JSON.parse(raw) : DEFAULT_USERS;
    return allUsers.filter(u => u.role === 'siswa');
  }

  saveStudent(student: User): User {
    this.ensureInitialized();
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    let allUsers: User[] = raw ? JSON.parse(raw) : DEFAULT_USERS;
    const index = allUsers.findIndex(u => u.id === student.id || (student.nisn && u.nisn === student.nisn));

    if (index >= 0) {
      allUsers[index] = { ...allUsers[index], ...student };
    } else {
      allUsers.push(student);
    }

    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(allUsers));
    return student;
  }

  importStudentsBatch(
    newStudents: Omit<User, 'id' | 'role'>[],
    schoolName = 'MI Negeri 1 Paser'
  ): { addedCount: number; updatedCount: number } {
    this.ensureInitialized();
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    let allUsers: User[] = raw ? JSON.parse(raw) : DEFAULT_USERS;

    let addedCount = 0;
    let updatedCount = 0;

    newStudents.forEach(item => {
      const cleanNisn = (item.nisn || '').trim();
      const cleanName = (item.name || '').trim();
      const cleanClass = (item.className || 'Kelas VI-A').trim();
      if (!cleanNisn || !cleanName) return;

      const existingIndex = allUsers.findIndex(u => u.nisn === cleanNisn);
      if (existingIndex >= 0) {
        allUsers[existingIndex] = {
          ...allUsers[existingIndex],
          name: cleanName,
          className: cleanClass,
          schoolName,
        };
        updatedCount++;
      } else {
        const newStudentUser: User = {
          id: `student-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: cleanName,
          username: cleanNisn,
          role: 'siswa',
          nisn: cleanNisn,
          className: cleanClass,
          schoolName,
        };
        allUsers.push(newStudentUser);
        addedCount++;
      }
    });

    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(allUsers));
    return { addedCount, updatedCount };
  }

  deleteStudent(id: string) {
    this.ensureInitialized();
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    let allUsers: User[] = raw ? JSON.parse(raw) : DEFAULT_USERS;
    allUsers = allUsers.filter(u => u.id !== id);
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(allUsers));
  }

  updateStudent(student: User): User {
    this.ensureInitialized();
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    let allUsers: User[] = raw ? JSON.parse(raw) : DEFAULT_USERS;
    const index = allUsers.findIndex(u => u.id === student.id);
    if (index >= 0) {
      allUsers[index] = { ...allUsers[index], ...student };
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(allUsers));
    } else {
      allUsers.push(student);
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(allUsers));
    }

    // Also update studentName and studentNisn in historical sessions for consistency
    const rawSessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (rawSessions) {
      try {
        const sessions: StudentExamSession[] = JSON.parse(rawSessions);
        let sessionsUpdated = false;
        sessions.forEach(sess => {
          if (sess.studentId === student.id || sess.studentNisn === student.nisn) {
            sess.studentName = student.name;
            if (student.nisn) sess.studentNisn = student.nisn;
            sessionsUpdated = true;
          }
        });
        if (sessionsUpdated) {
          localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
        }
      } catch (err) {
        console.error('Error synchronizing student sessions on edit:', err);
      }
    }

    return student;
  }

  // Reset all to sample data
  resetAllData() {
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(INITIAL_EXAMS));
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(INITIAL_SESSIONS));
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(DEFAULT_USERS));
  }
}

export const storage = new StorageService();
