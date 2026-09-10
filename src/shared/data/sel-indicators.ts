// ────────────────────────────────────────────────────────────
//  sel-indicators.ts
//  Definisi lengkap semua indikator Instrumen Observasi BSAN-SEL
//  Sesuai dokumen: [Final] Instrumen Observasi BSAN-SEL 03092026.docx
// ────────────────────────────────────────────────────────────

export type SELDimensi = 'kesadaran_diri' | 'regulasi_emosi' | 'kesadaran_sosial' | 'keterampilan_relasi' | 'tanggung_jawab';
export type SELSubjek = 'guru' | 'murid';
export type SELKonteks = 'kelas' | 'lingkungan';
export type SELSkor = 1 | 2 | 3 | 4;

export const SEL_DIMENSI_LABEL: Record<SELDimensi, string> = {
  kesadaran_diri:     'Kesadaran Diri',
  regulasi_emosi:     'Regulasi Emosi',
  kesadaran_sosial:   'Kesadaran Sosial',
  keterampilan_relasi:'Keterampilan Relasi',
  tanggung_jawab:     'Tanggung Jawab',
};

export const SEL_SKOR_LABEL: Record<SELSkor, { label: string; emoji: string; color: string }> = {
  1: { label: 'Tidak Terlihat',   emoji: '❌', color: '#EF4444' },
  2: { label: 'Kadang Terlihat',  emoji: '🌗', color: '#F59E0B' },
  3: { label: 'Sering Terlihat',  emoji: '✅', color: '#10B981' },
  4: { label: 'Konsisten Terlihat', emoji: '🌟', color: '#4A57C4' },
};

// ────────────────────────────────────────────────────────────
//  BSAN Module Framework (CASEL Alignment)
//  3 Modul utama sesuai framework BSAN-SEL
// ────────────────────────────────────────────────────────────

export type BSANModul = 'with_myself' | 'with_others' | 'with_challenges';

export const BSAN_MODUL_ORDER: BSANModul[] = ['with_myself', 'with_others', 'with_challenges'];

export const BSAN_MODUL_LABEL: Record<BSANModul, string> = {
  with_myself:     'With Myself',
  with_others:     'With Others',
  with_challenges: 'With Our Challenges',
};

export const BSAN_MODUL_SUBTITLE: Record<BSANModul, string> = {
  with_myself:     'Understanding and managing emotions',
  with_others:     'Forming and sustaining positive relationships',
  with_challenges: 'Making the most out of life',
};

export const BSAN_MODUL_LABEL_ID: Record<BSANModul, string> = {
  with_myself:     'Dengan Diriku',
  with_others:     'Dengan Orang Lain',
  with_challenges: 'Dengan Tantangan Kita',
};

export const BSAN_MODUL_SUBTITLE_ID: Record<BSANModul, string> = {
  with_myself:     'Memahami dan mengelola emosi',
  with_others:     'Membangun dan menjaga hubungan positif',
  with_challenges: 'Menjadikan hidup lebih bermakna',
};

export const BSAN_MODUL_COLOR: Record<BSANModul, string> = {
  with_myself:     '#4A57C4', // indigo/blue
  with_others:     '#10B981', // emerald/green
  with_challenges: '#F59E0B', // amber/yellow
};

export const BSAN_MODUL_ICON: Record<BSANModul, string> = {
  with_myself:     'brain',
  with_others:     'users',
  with_challenges: 'target',
};

/** General Skills per Modul (sesuai framework CASEL) */
export interface BSANGeneralSkill {
  id: string;
  modul: BSANModul;
  name: string;
  nameId: string;
  description: string;
  descriptionId: string;
  specificSkills: BSANSpecificSkill[];
}

export interface BSANSpecificSkill {
  name: string;
  nameId: string;
  description: string;
  descriptionId: string;
}

export const BSAN_GENERAL_SKILLS: BSANGeneralSkill[] = [
  // ── WITH MYSELF ──
  {
    id: 'self_awareness',
    modul: 'with_myself',
    name: 'Self-Awareness',
    nameId: 'Kesadaran Diri',
    description: 'Knowing, understanding and trusting ourselves',
    descriptionId: 'Mengenal, memahami, dan mempercayai diri sendiri',
    specificSkills: [
      { name: 'Self-concept', nameId: 'Konsep Diri', description: 'What we think about ourselves', descriptionId: 'Apa yang kita pikirkan tentang diri sendiri' },
      { name: 'Self-efficacy', nameId: 'Efikasi Diri', description: 'Trusting our ability to succeed in specific situations', descriptionId: 'Mempercayai kemampuan kita untuk berhasil di situasi tertentu' },
      { name: 'Emotional awareness', nameId: 'Kesadaran Emosional', description: 'Knowing what we are feeling and why', descriptionId: 'Mengetahui apa yang kita rasakan dan mengapa' },
    ],
  },
  {
    id: 'self_regulation',
    modul: 'with_myself',
    name: 'Self-Regulation',
    nameId: 'Regulasi Diri',
    description: 'Governing our impulses and emotions',
    descriptionId: 'Mengelola dorongan dan emosi kita',
    specificSkills: [
      { name: 'Emotional regulation', nameId: 'Regulasi Emosi', description: 'Managing our emotions in harmony with our goals', descriptionId: 'Mengelola emosi selaras dengan tujuan kita' },
      { name: 'Delayed gratification', nameId: 'Penundaan Kepuasan', description: 'Postponing an immediate reward for better outcomes later', descriptionId: 'Menunda imbalan segera untuk hasil yang lebih baik nanti' },
      { name: 'Frustration tolerance', nameId: 'Toleransi Frustrasi', description: 'Facing difficulties without feeling overwhelmed by anger or disappointment', descriptionId: 'Menghadapi kesulitan tanpa merasa kewalahan oleh kemarahan atau kekecewaan' },
    ],
  },

  // ── WITH OTHERS ──
  {
    id: 'social_awareness',
    modul: 'with_others',
    name: 'Social Awareness',
    nameId: 'Kesadaran Sosial',
    description: "Understanding other people's feelings, needs, and concerns",
    descriptionId: 'Memahami perasaan, kebutuhan, dan kekhawatiran orang lain',
    specificSkills: [
      { name: 'Perspective taking', nameId: 'Mengambil Perspektif', description: 'Understanding a given situation from multiple points of view', descriptionId: 'Memahami situasi dari berbagai sudut pandang' },
      { name: 'Empathy', nameId: 'Empati', description: "Putting ourselves in another's place, walking in another's shoes", descriptionId: 'Menempatkan diri di posisi orang lain' },
      { name: 'Prosocial behavior', nameId: 'Perilaku Prososial', description: 'Voluntary actions intended to help or benefit others', descriptionId: 'Tindakan sukarela untuk membantu atau menguntungkan orang lain' },
    ],
  },
  {
    id: 'positive_communication',
    modul: 'with_others',
    name: 'Positive Communication',
    nameId: 'Komunikasi Positif',
    description: 'Interacting with kindness and respect for ourselves and others',
    descriptionId: 'Berinteraksi dengan kebaikan dan rasa hormat terhadap diri sendiri dan orang lain',
    specificSkills: [
      { name: 'Active listening', nameId: 'Mendengar Aktif', description: 'Paying undivided attention to another person with genuine interest and respect', descriptionId: 'Memberikan perhatian penuh kepada orang lain dengan ketertarikan dan rasa hormat yang tulus' },
      { name: 'Assertiveness', nameId: 'Asertivitas', description: 'Advocating for ourselves with confidence, honesty and respect', descriptionId: 'Menyuarakan diri dengan percaya diri, jujur, dan hormat' },
      { name: 'Conflict management', nameId: 'Manajemen Konflik', description: 'Dealing with conflict in a way that enhances learning and group outcomes', descriptionId: 'Menangani konflik dengan cara yang meningkatkan pembelajaran dan hasil kelompok' },
    ],
  },

  // ── WITH OUR CHALLENGES ──
  {
    id: 'determination',
    modul: 'with_challenges',
    name: 'Determination',
    nameId: 'Determinasi',
    description: 'Pursuing goals with resolve and purpose',
    descriptionId: 'Mengejar tujuan dengan tekad dan tujuan yang jelas',
    specificSkills: [
      { name: 'Achievement motivation', nameId: 'Motivasi Berprestasi', description: 'Driving ourselves to succeed', descriptionId: 'Mendorong diri sendiri untuk berhasil' },
      { name: 'Perseverance', nameId: 'Ketekunan', description: 'Keeping up the effort to achieve our goals despite difficulty, delays and failure', descriptionId: 'Terus berusaha mencapai tujuan meski ada kesulitan, keterlambatan, dan kegagalan' },
      { name: 'Stress management', nameId: 'Manajemen Stres', description: "Taking charge so the pressures and tensions of our lives don't break us", descriptionId: 'Mengelola tekanan dan ketegangan hidup agar tidak menghancurkan kita' },
    ],
  },
  {
    id: 'responsible_decision_making',
    modul: 'with_challenges',
    name: 'Responsible Decision-Making',
    nameId: 'Pengambilan Keputusan Bertanggung Jawab',
    description: 'Making constructive and respectful choices',
    descriptionId: 'Membuat pilihan yang konstruktif dan penuh rasa hormat',
    specificSkills: [
      { name: 'Creative thinking', nameId: 'Berpikir Kreatif', description: 'Generating new ideas, solutions or courses of action in the face of challenge', descriptionId: 'Menghasilkan ide, solusi, atau tindakan baru dalam menghadapi tantangan' },
      { name: 'Critical thinking', nameId: 'Berpikir Kritis', description: 'Questioning the assumptions underlying our habitual ways of thinking and acting', descriptionId: 'Mempertanyakan asumsi yang mendasari cara berpikir dan bertindak kita' },
      { name: 'Responsibility', nameId: 'Tanggung Jawab', description: 'Fulfilling our commitments and being accountable for our words and actions', descriptionId: 'Memenuhi komitmen dan bertanggung jawab atas kata-kata dan tindakan kita' },
    ],
  },
];

/** Mapping dimensi SEL observasi (5) → Modul BSAN (3) */
export const SEL_DIMENSI_TO_MODUL: Record<SELDimensi, BSANModul> = {
  kesadaran_diri:      'with_myself',
  regulasi_emosi:      'with_myself',
  kesadaran_sosial:    'with_others',
  keterampilan_relasi: 'with_others',
  tanggung_jawab:      'with_challenges',
};

/** Mapping dimensi SEL observasi → General Skill terdekat */
export const SEL_DIMENSI_TO_GENERAL_SKILL: Record<SELDimensi, string> = {
  kesadaran_diri:      'self_awareness',
  regulasi_emosi:      'self_regulation',
  kesadaran_sosial:    'social_awareness',
  keterampilan_relasi: 'positive_communication',
  tanggung_jawab:      'responsible_decision_making',
};

/** Mapping Alur/Tema survei kuesioner → Modul BSAN */
export const SURVEY_TEMA_TO_MODUL = {
  kelasAwal: {
    with_myself: [
      'Alur 1: Tema 1: Tubuhku Istimewa',
      'Alur 1: Tema 2: Aku Jaga Diri',
      'Alur 1: Tema 3: Perasaanku, Tanggungjawabku',
      'Alur 1: Tema 4: Aku Bisa, Aku Hebat',
      'Alur 1: Tema 5: Aku Gemar Membaca',
    ],
    with_others: [
      'Alur 2: Tema 6: Aku, Kamu, Kita Unik',
      'Alur 2: Tema 7: Tubuhku Bicara, Emosi Bisa Berubah',
    ],
    with_challenges: [
      'Alur 3: Tema 8: Surat Untuk yang tersayang',
      'Alur 3: Tema 9: Jaga Layar, Jaga Diri',
      'Alur 3: Tema 10: Aku Mau Membantu',
    ],
  },
  kelasTinggi: {
    with_myself: [
      'Alur 1: Tema 1: Mengenali Perasaan Diri',
      'Alur 1: Tema 2: Mengelola Perasaan Diri',
      'Alur 1: Tema 3: Peta Tubuh Saya',
      'Alur 1: Tema 4: Afirmasi Positif',
    ],
    with_others: [
      'Alur 2: Tema 5: Lingkaran Persahabatan',
      'Alur 2: Tema 6: Berbagi Persahabatan',
      'Alur 2: Tema 7: Tanggung Jawab Diri',
      'Alur 2: Tema 8: Ayo Bermain Bersama',
      'Alur 2: Tema 9: Aku dan Kamu Istimewa',
    ],
    with_challenges: [
      'Alur 3: Tema 10: Gembira bersama Sahabat',
      'Alur 3: Tema 11: Kampanye Anak Indonesia Hebat',
      'Alur 3: Tema 12: Refleksi dan Tindak Lanjut',
    ],
  },
} as const;

/** Helper: ambil General Skills untuk modul tertentu */
export function getGeneralSkillsByModul(modul: BSANModul): BSANGeneralSkill[] {
  return BSAN_GENERAL_SKILLS.filter(gs => gs.modul === modul);
}

/** Helper: ambil dimensi SEL yang masuk ke modul tertentu */
export function getDimensiByModul(modul: BSANModul): SELDimensi[] {
  return (Object.entries(SEL_DIMENSI_TO_MODUL) as [SELDimensi, BSANModul][])
    .filter(([, m]) => m === modul)
    .map(([d]) => d);
}

export interface SELIndikator {
  id: string;
  dimensi: SELDimensi;
  subjek: SELSubjek;
  konteks: SELKonteks;
  teks: string;
  catatan?: string; // petunjuk tambahan untuk observer
}

export const SEL_INDIKATORS: SELIndikator[] = [
  // ══════════════════════════════════════════════════
  // GURU — Kesadaran Diri
  // ══════════════════════════════════════════════════
  {
    id: 'guru_kd_kls_1',
    dimensi: 'kesadaran_diri',
    subjek: 'guru',
    konteks: 'kelas',
    teks: 'Guru mengajak murid mengenali kekuatan dan kelemahan diri',
  },
  {
    id: 'guru_kd_kls_2',
    dimensi: 'kesadaran_diri',
    subjek: 'guru',
    konteks: 'kelas',
    teks: 'Guru meminta murid menuliskan hal yang mereka kuasai dan hal yang perlu mereka tingkatkan',
  },
  {
    id: 'guru_kd_kls_3',
    dimensi: 'kesadaran_diri',
    subjek: 'guru',
    konteks: 'kelas',
    teks: 'Guru memberi apresiasi atas jawaban murid di kelas',
  },
  {
    id: 'guru_kd_kls_4',
    dimensi: 'kesadaran_diri',
    subjek: 'guru',
    konteks: 'kelas',
    teks: 'Guru memfasilitasi sesi refleksi di akhir pelajaran',
  },
  {
    id: 'guru_kd_lngk_1',
    dimensi: 'kesadaran_diri',
    subjek: 'guru',
    konteks: 'lingkungan',
    teks: 'Guru memberi pujian saat murid berani mencoba hal baru (misal: maju ke depan kelas, menjadi ketua kelas, menjadi petugas upacara)',
    catatan: 'Jika selama observasi tidak ada kegiatan, bisa ditanyakan ke guru (secara umum murid, atau hanya murid tertentu)',
  },
  {
    id: 'guru_kd_lngk_2',
    dimensi: 'kesadaran_diri',
    subjek: 'guru',
    konteks: 'lingkungan',
    teks: 'Guru mengajak diskusi ringan saat istirahat tentang pengalaman mereka hari itu',
    catatan: 'Wawancara guru jika tidak terjadi',
  },

  // ══════════════════════════════════════════════════
  // GURU — Regulasi Emosi
  // ══════════════════════════════════════════════════
  {
    id: 'guru_re_kls_1',
    dimensi: 'regulasi_emosi',
    subjek: 'guru',
    konteks: 'kelas',
    teks: 'Guru mencontohkan teknik pengelolaan emosi (misal: tarik napas)',
  },
  {
    id: 'guru_re_kls_2',
    dimensi: 'regulasi_emosi',
    subjek: 'guru',
    konteks: 'kelas',
    teks: 'Ketika kelas gaduh, guru mencontohkan dan mengajak murid menggunakan regulasi emosi (teknik STOP, afirmasi positif, penggunaan tepuk, dll)',
  },
  {
    id: 'guru_re_kls_3',
    dimensi: 'regulasi_emosi',
    subjek: 'guru',
    konteks: 'kelas',
    teks: 'Guru tetap tenang saat menghadapi situasi yang tak terkendali (misal: kelas gaduh, murid tantrum)',
  },
  {
    id: 'guru_re_lngk_1',
    dimensi: 'regulasi_emosi',
    subjek: 'guru',
    konteks: 'lingkungan',
    teks: 'Guru menunjukkan sikap tenang, tidak berteriak atau membentak saat ada kegaduhan di jam istirahat',
  },
  {
    id: 'guru_re_lngk_2',
    dimensi: 'regulasi_emosi',
    subjek: 'guru',
    konteks: 'lingkungan',
    teks: 'Guru mengingatkan murid dengan kalimat positif saat murid melakukan kesalahan (misal: memecahkan pot, menyerobot antrian, bermain bola di lorong)',
  },
  {
    id: 'guru_re_lngk_3',
    dimensi: 'regulasi_emosi',
    subjek: 'guru',
    konteks: 'lingkungan',
    teks: 'Guru memberi arahan dengan tenang (tidak memarahi atau membentak) ketika ada murid yang datang terlambat',
  },

  // ══════════════════════════════════════════════════
  // GURU — Kesadaran Sosial
  // ══════════════════════════════════════════════════
  {
    id: 'guru_ks_kls_1',
    dimensi: 'kesadaran_sosial',
    subjek: 'guru',
    konteks: 'kelas',
    teks: 'Guru menekankan pentingnya menghargai perbedaan',
  },
  {
    id: 'guru_ks_kls_2',
    dimensi: 'kesadaran_sosial',
    subjek: 'guru',
    konteks: 'kelas',
    teks: 'Guru bersikap terbuka dengan jawaban yang berbeda dalam diskusi',
  },
  {
    id: 'guru_ks_kls_3',
    dimensi: 'kesadaran_sosial',
    subjek: 'guru',
    konteks: 'kelas',
    teks: 'Guru menggunakan bahasa/istilah yang netral saat memberi contoh atau penyampaian materi (GEDSI)',
    catatan: 'Netral: tidak menggunakan bahasa yang mengasosiasikan kelompok tertentu dengan sifat tertentu, misal "anak perempuan rajin, anak laki-laki nakal"',
  },
  {
    id: 'guru_ks_kls_4',
    dimensi: 'kesadaran_sosial',
    subjek: 'guru',
    konteks: 'kelas',
    teks: 'Guru mengatur kelompok secara heterogen (keseimbangan jumlah laki-laki dan perempuan dan/atau kemampuan)',
  },
  {
    id: 'guru_ks_kls_5',
    dimensi: 'kesadaran_sosial',
    subjek: 'guru',
    konteks: 'kelas',
    teks: 'Guru berinteraksi secara merata dengan semua gender siswa, baik perempuan maupun laki-laki',
  },
  {
    id: 'guru_ks_kls_6',
    dimensi: 'kesadaran_sosial',
    subjek: 'guru',
    konteks: 'kelas',
    teks: 'Guru berinteraksi secara merata ke semua posisi duduk siswa (depan, tengah, belakang, kiri, dan kanan)',
  },
  {
    id: 'guru_ks_lngk_1',
    dimensi: 'kesadaran_sosial',
    subjek: 'guru',
    konteks: 'lingkungan',
    teks: 'Guru menyapa semua murid tanpa membeda-bedakan status sosial maupun jenis kelamin',
  },

  // ══════════════════════════════════════════════════
  // GURU — Keterampilan Relasi
  // ══════════════════════════════════════════════════
  {
    id: 'guru_kr_kls_1',
    dimensi: 'keterampilan_relasi',
    subjek: 'guru',
    konteks: 'kelas',
    teks: 'Guru memfasilitasi diskusi kelompok dengan aturan komunikasi positif (menggunakan kata sopan, tidak menyela, memberi kesempatan bergiliran, menghargai perbedaan pendapat)',
  },
  {
    id: 'guru_kr_kls_2',
    dimensi: 'keterampilan_relasi',
    subjek: 'guru',
    konteks: 'kelas',
    teks: 'Guru membimbing/memberikan contoh/memfasilitasi murid dalam menyelesaikan perbedaan pendapat',
  },

  // ══════════════════════════════════════════════════
  // GURU — Tanggung Jawab
  // ══════════════════════════════════════════════════
  {
    id: 'guru_tj_kls_1',
    dimensi: 'tanggung_jawab',
    subjek: 'guru',
    konteks: 'kelas',
    teks: 'Guru datang tepat waktu dan menyiapkan kelas dengan rapi',
  },
  {
    id: 'guru_tj_kls_2',
    dimensi: 'tanggung_jawab',
    subjek: 'guru',
    konteks: 'kelas',
    teks: 'Guru mengingatkan murid untuk menyelesaikan tugas tepat waktu',
  },
  {
    id: 'guru_tj_kls_3',
    dimensi: 'tanggung_jawab',
    subjek: 'guru',
    konteks: 'kelas',
    teks: 'Guru mengajak murid bekerjasama dalam menyelesaikan tugas kelompok/diskusi',
  },
  {
    id: 'guru_tj_kls_4',
    dimensi: 'tanggung_jawab',
    subjek: 'guru',
    konteks: 'kelas',
    teks: 'Guru memberikan kesempatan pada anak untuk mencoba peran dan tanggung jawab yang berbeda dalam kerja/tugas kelompok',
  },
  {
    id: 'guru_tj_lngk_1',
    dimensi: 'tanggung_jawab',
    subjek: 'guru',
    konteks: 'lingkungan',
    teks: 'Guru memberikan contoh untuk ikut menjaga kebersihan lingkungan sekolah (misal: membuang sampah pada tempatnya)',
  },
  {
    id: 'guru_tj_lngk_2',
    dimensi: 'tanggung_jawab',
    subjek: 'guru',
    konteks: 'lingkungan',
    teks: 'Guru menekankan pentingnya menjaga fasilitas sekolah bersama-sama',
  },
  {
    id: 'guru_tj_lngk_3',
    dimensi: 'tanggung_jawab',
    subjek: 'guru',
    konteks: 'lingkungan',
    teks: 'Guru mengajak murid ikut serta dalam kegiatan peduli lingkungan',
  },

  // ══════════════════════════════════════════════════
  // MURID — Kesadaran Diri
  // ══════════════════════════════════════════════════
  {
    id: 'murid_kd_kls_1',
    dimensi: 'kesadaran_diri',
    subjek: 'murid',
    konteks: 'kelas',
    teks: 'Murid dapat menyebutkan/menjelaskan perasaannya saat diminta guru',
  },
  {
    id: 'murid_kd_kls_2',
    dimensi: 'kesadaran_diri',
    subjek: 'murid',
    konteks: 'kelas',
    teks: 'Murid berani menjawab pertanyaan atau presentasi di depan kelas',
  },
  {
    id: 'murid_kd_kls_3',
    dimensi: 'kesadaran_diri',
    subjek: 'murid',
    konteks: 'kelas',
    teks: 'Murid mau mendengarkan pendapat temannya saat diskusi',
  },
  {
    id: 'murid_kd_lngk_1',
    dimensi: 'kesadaran_diri',
    subjek: 'murid',
    konteks: 'lingkungan',
    teks: 'Murid mengungkapkan perasaan kepada teman (misal: sedih saat kalah bermain, sakit ketika tak sengaja terdorong)',
  },
  {
    id: 'murid_kd_lngk_2',
    dimensi: 'kesadaran_diri',
    subjek: 'murid',
    konteks: 'lingkungan',
    teks: 'Murid secara aktif menawarkan diri untuk berkontribusi sesuai kemampuannya saat kegiatan di luar jam pelajaran',
    catatan: 'Wawancara guru jika saat observasi tidak ditemukan peristiwa yang mendukung',
  },
  {
    id: 'murid_kd_lngk_3',
    dimensi: 'kesadaran_diri',
    subjek: 'murid',
    konteks: 'lingkungan',
    teks: 'Murid menyapa guru dengan ramah, atau mengajak teman (termasuk anak disabilitas jika ada) bermain bersama',
  },
  {
    id: 'murid_kd_lngk_4',
    dimensi: 'kesadaran_diri',
    subjek: 'murid',
    konteks: 'lingkungan',
    teks: 'Murid tahu area pribadi yang boleh disentuh dan mengingatkan temannya jika tersentuh/disentuh',
    catatan: 'Bisa ditanyakan guru jika tidak ada peristiwa mendukung',
  },

  // ══════════════════════════════════════════════════
  // MURID — Regulasi Emosi
  // ══════════════════════════════════════════════════
  {
    id: 'murid_re_kls_1',
    dimensi: 'regulasi_emosi',
    subjek: 'murid',
    konteks: 'kelas',
    teks: 'Murid menggunakan teknik regulasi emosi saat merasa kesulitan',
    catatan: 'Jika saat observasi tidak ada peristiwa yang mendukung, bisa ditanyakan kepada murid dan/atau guru',
  },
  {
    id: 'murid_re_kls_2',
    dimensi: 'regulasi_emosi',
    subjek: 'murid',
    konteks: 'kelas',
    teks: 'Murid tidak langsung menangis atau marah saat gagal menjawab atau kelengkapan menulisnya tidak lengkap',
    catatan: 'Jika tidak ada peristiwa yang mendukung bisa ditanyakan ke guru',
  },
  {
    id: 'murid_re_kls_3',
    dimensi: 'regulasi_emosi',
    subjek: 'murid',
    konteks: 'kelas',
    teks: 'Murid kembali mengikuti pembelajaran setelah menenangkan diri',
    catatan: 'Bisa ditanyakan guru jika tidak ada peristiwa yang mendukung selama observasi',
  },
  {
    id: 'murid_re_lngk_1',
    dimensi: 'regulasi_emosi',
    subjek: 'murid',
    konteks: 'lingkungan',
    teks: 'Murid tidak membalas ejekan teman',
  },
  {
    id: 'murid_re_lngk_2',
    dimensi: 'regulasi_emosi',
    subjek: 'murid',
    konteks: 'lingkungan',
    teks: 'Murid bersikap positif saat kalah dalam bermain',
  },

  // ══════════════════════════════════════════════════
  // MURID — Kesadaran Sosial
  // ══════════════════════════════════════════════════
  {
    id: 'murid_ks_kls_1',
    dimensi: 'kesadaran_sosial',
    subjek: 'murid',
    konteks: 'kelas',
    teks: 'Murid mendengarkan pendapat teman tanpa memotong',
  },
  {
    id: 'murid_ks_kls_2',
    dimensi: 'kesadaran_sosial',
    subjek: 'murid',
    konteks: 'kelas',
    teks: 'Murid menerima pendapat yang berbeda tanpa mengejek atau menertawakannya',
  },
  {
    id: 'murid_ks_kls_3',
    dimensi: 'kesadaran_sosial',
    subjek: 'murid',
    konteks: 'kelas',
    teks: 'Murid menghibur atau memberi semangat ketika temannya mengalami kesulitan atau sedih',
  },
  {
    id: 'murid_ks_lngk_1',
    dimensi: 'kesadaran_sosial',
    subjek: 'murid',
    konteks: 'lingkungan',
    teks: 'Murid menenangkan teman yang menangis saat bermain',
  },
  {
    id: 'murid_ks_lngk_2',
    dimensi: 'kesadaran_sosial',
    subjek: 'murid',
    konteks: 'lingkungan',
    teks: 'Murid mau bermain bersama teman yang berbeda (jenis kelamin, kelompok sosial, ras, suku, agama, termasuk anak dengan disabilitas)',
  },

  // ══════════════════════════════════════════════════
  // MURID — Keterampilan Relasi
  // ══════════════════════════════════════════════════
  {
    id: 'murid_kr_1',
    dimensi: 'keterampilan_relasi',
    subjek: 'murid',
    konteks: 'kelas',
    teks: 'Murid tidak berteriak atau mengejek saat konflik muncul',
  },
  {
    id: 'murid_kr_2',
    dimensi: 'keterampilan_relasi',
    subjek: 'murid',
    konteks: 'kelas',
    teks: 'Murid meminta maaf saat berselisih dengan temannya',
  },
  {
    id: 'murid_kr_3',
    dimensi: 'keterampilan_relasi',
    subjek: 'murid',
    konteks: 'kelas',
    teks: 'Murid secara aktif menggunakan 3 kata ajaib (maaf, terima kasih, dan tolong)',
  },
  {
    id: 'murid_kr_4',
    dimensi: 'keterampilan_relasi',
    subjek: 'murid',
    konteks: 'kelas',
    teks: 'Murid tidak membalas dorongan fisik/perilaku kekerasan fisik',
  },
  {
    id: 'murid_kr_5',
    dimensi: 'keterampilan_relasi',
    subjek: 'murid',
    konteks: 'kelas',
    teks: 'Murid bisa berdamai setelah berselisih',
  },

  // ══════════════════════════════════════════════════
  // MURID — Tanggung Jawab
  // ══════════════════════════════════════════════════
  {
    id: 'murid_tj_kls_1',
    dimensi: 'tanggung_jawab',
    subjek: 'murid',
    konteks: 'kelas',
    teks: 'Murid membawa perlengkapan belajar dengan tertib',
  },
  {
    id: 'murid_tj_kls_2',
    dimensi: 'tanggung_jawab',
    subjek: 'murid',
    konteks: 'kelas',
    teks: 'Murid mengumpulkan tugas tepat waktu',
  },
  {
    id: 'murid_tj_kls_3',
    dimensi: 'tanggung_jawab',
    subjek: 'murid',
    konteks: 'kelas',
    teks: 'Murid membantu teman yang kesulitan',
  },
  {
    id: 'murid_tj_kls_4',
    dimensi: 'tanggung_jawab',
    subjek: 'murid',
    konteks: 'kelas',
    teks: 'Murid merapikan meja dan kursi setelah pembelajaran',
  },
  {
    id: 'murid_tj_kls_5',
    dimensi: 'tanggung_jawab',
    subjek: 'murid',
    konteks: 'kelas',
    teks: 'Murid menggunakan seragam sesuai dan rapi',
  },
  {
    id: 'murid_tj_lngk_1',
    dimensi: 'tanggung_jawab',
    subjek: 'murid',
    konteks: 'lingkungan',
    teks: 'Murid bisa mengatur diri sendiri untuk menaati aturan waktu istirahat dan masuk ke kelas tanpa diingatkan guru',
  },
  {
    id: 'murid_tj_lngk_2',
    dimensi: 'tanggung_jawab',
    subjek: 'murid',
    konteks: 'lingkungan',
    teks: 'Murid menghormati area tubuh teman yang boleh disentuh dan tidak',
  },
  {
    id: 'murid_tj_lngk_3',
    dimensi: 'tanggung_jawab',
    subjek: 'murid',
    konteks: 'lingkungan',
    teks: 'Murid menggunakan bahasa positif ketika berbicara dan bermain bersama teman',
  },
  {
    id: 'murid_tj_lngk_4',
    dimensi: 'tanggung_jawab',
    subjek: 'murid',
    konteks: 'lingkungan',
    teks: 'Murid mengingatkan ketika ada teman yang menggunakan bahasa yang negatif atau yang bisa membuat orang lain tidak nyaman',
  },
  {
    id: 'murid_tj_lngk_5',
    dimensi: 'tanggung_jawab',
    subjek: 'murid',
    konteks: 'lingkungan',
    teks: 'Murid menaati kesepakatan kelas dan aturan sekolah',
  },
  {
    id: 'murid_tj_lngk_6',
    dimensi: 'tanggung_jawab',
    subjek: 'murid',
    konteks: 'lingkungan',
    teks: 'Murid menjaga lingkungan sekolah (misal: membuang sampah pada tempatnya, memelihara tanaman kelas)',
  },
];

// ─── Helper Functions ───────────────────────────────────────

/** Ambil indikator berdasarkan dimensi dan/atau subjek */
export function getIndikatorsByFilter(opts: {
  dimensi?: SELDimensi;
  subjek?: SELSubjek;
  konteks?: SELKonteks;
}): SELIndikator[] {
  return SEL_INDIKATORS.filter((ind) => {
    if (opts.dimensi && ind.dimensi !== opts.dimensi) return false;
    if (opts.subjek && ind.subjek !== opts.subjek) return false;
    if (opts.konteks && ind.konteks !== opts.konteks) return false;
    return true;
  });
}

/** Hitung skor rata-rata dari record jawaban untuk satu subjek/dimensi */
export function hitungSkorRata(
  jawaban: Record<string, SELSkor | null>,
  subjek?: SELSubjek,
  dimensi?: SELDimensi,
): number {
  const ids = SEL_INDIKATORS
    .filter(ind => (!subjek || ind.subjek === subjek) && (!dimensi || ind.dimensi === dimensi))
    .map(ind => ind.id);

  const valid = ids.map(id => jawaban[id]).filter((v): v is SELSkor => v !== null && v !== undefined);
  if (valid.length === 0) return 0;
  return Math.round((valid.reduce((a, b) => a + b, 0) / valid.length) * 10) / 10;
}

/** Hitung skor SEL per dimensi dari jawaban */
export function hitungSkorPerDimensi(
  jawaban: Record<string, SELSkor | null>,
  subjek?: SELSubjek,
): Record<SELDimensi, number> {
  const dimensiList: SELDimensi[] = ['kesadaran_diri', 'regulasi_emosi', 'kesadaran_sosial', 'keterampilan_relasi', 'tanggung_jawab'];
  return Object.fromEntries(
    dimensiList.map(d => [d, hitungSkorRata(jawaban, subjek, d)])
  ) as Record<SELDimensi, number>;
}

export const SEL_DIMENSI_ORDER: SELDimensi[] = [
  'kesadaran_diri',
  'regulasi_emosi',
  'kesadaran_sosial',
  'keterampilan_relasi',
  'tanggung_jawab',
];
