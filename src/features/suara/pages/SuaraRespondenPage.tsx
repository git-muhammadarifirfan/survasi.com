/**
 * @module features/suara/pages
 * @description Komentar narasi dari responden, filter sentimen, word cloud
 * @tables suara_responden, jawaban_survey (Q33, Q35, Q36), modul_bsan
 * @queries database/queries/suara_responden.sql → semua query
 * @api GET /api/suara?sentimen=&modul_id=&page=&limit=
 */

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { database } from '../../../shared/data/data-source';
import { Search, Filter, Smile, Meh, Frown, Tag, MessageSquareQuote, Calendar, ChevronLeft, ChevronRight, Send, CheckCircle2 } from 'lucide-react';
import CustomSelect from '../../../shared/components/CustomSelect';

interface SuaraRespondenProps {
  activeKecamatan: string | null;
  userRole?: 'admin' | 'pengawas';
}

interface LocalFeedback {
  id: string;
  schoolName: string;
  kecamatan: string;
  modul: string;
  sentiment: 'positif' | 'netral' | 'negatif';
  comment: string;
  date: string;
}

export default function SuaraResponden({ activeKecamatan, userRole = 'admin' }: SuaraRespondenProps) {
  // Common states
  const [showToast, setShowToast] = useState<string | null>(null);

  // Admin states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSentiment, setSelectedSentiment] = useState<string>('');
  const [selectedModul, setSelectedModul] = useState<string>('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // School states
  const [schoolModul, setSchoolModul] = useState('Modul 1: Literasi & Numerasi');
  const [schoolSentiment, setSchoolSentiment] = useState<'positif' | 'netral' | 'negatif'>('positif');
  const [schoolComment, setSchoolComment] = useState('');
  const [schoolFeedbacks, setSchoolFeedbacks] = useState<LocalFeedback[]>([]);

  const tags = ['Perangkat Digital', 'Internet', 'Buku Ajar', 'KKG Guru', 'Wali Murid', 'Pelatihan'];

  const { data: feedbackData = [], isLoading } = useQuery({
    queryKey: ['suaraResponden', activeKecamatan],
    queryFn: () => database.getSuaraRespondenData({ kecamatan: activeKecamatan || undefined })
  });

  // Load school specific feedback from localStorage + defaults
  useEffect(() => {
    if (userRole === 'pengawas') {
      const stored = localStorage.getItem('bsan_school_feedbacks');
      if (stored) {
        setSchoolFeedbacks(JSON.parse(stored));
      } else {
        const defaults: LocalFeedback[] = [
          {
            id: 'fb-def-1',
            schoolName: 'SDN Candi 1 Sidoarjo',
            kecamatan: 'Kec. Candi',
            modul: 'Modul 1: Literasi & Numerasi',
            sentiment: 'positif',
            comment: 'Penerapan modul literasi kelas awal sangat terbantu dengan adanya media interaktif kartu kata yang kami buat mandiri.',
            date: '24 Ags 2026'
          },
          {
            id: 'fb-def-2',
            schoolName: 'SDN Candi 1 Sidoarjo',
            kecamatan: 'Kec. Candi',
            modul: 'Modul 4: Lingkungan Belajar',
            sentiment: 'negatif',
            comment: 'Kami masih terkendala penyediaan Chromebook yang memadai untuk 2 kelas paralel sekaligus.',
            date: '18 Ags 2026'
          }
        ];
        setSchoolFeedbacks(defaults);
        localStorage.setItem('bsan_school_feedbacks', JSON.stringify(defaults));
      }
    }
  }, [userRole]);

  const handleSchoolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolComment.trim()) return;

    const newFb: LocalFeedback = {
      id: 'fb-' + Date.now(),
      schoolName: 'SDN Candi 1 Sidoarjo',
      kecamatan: 'Kec. Candi',
      modul: schoolModul,
      sentiment: schoolSentiment,
      comment: schoolComment.trim(),
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    };

    const updated = [newFb, ...schoolFeedbacks];
    setSchoolFeedbacks(updated);
    localStorage.setItem('bsan_school_feedbacks', JSON.stringify(updated));
    setSchoolComment('');

    // Toast
    setShowToast('Umpan balik berhasil dikirim ke Dinas Pendidikan');
    setTimeout(() => setShowToast(null), 3000);
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positif': return <Smile className="h-5 w-5 text-status-sudah" />;
      case 'netral': return <Meh className="h-5 w-5 text-status-sebagian" />;
      case 'negatif': return <Frown className="h-5 w-5 text-status-belum" />;
      default: return null;
    }
  };

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'positif': return <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-status-sudah/10 text-status-sudah border border-status-sudah/20">Positif</span>;
      case 'netral': return <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-status-sebagian/10 text-status-sebagian border border-status-sebagian/20">Netral</span>;
      case 'negatif': return <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-status-belum/10 text-status-belum border border-status-belum/20">Kritik</span>;
      default: return null;
    }
  };

  // Filter feedback for admin
  const filteredFeedback = feedbackData.filter(item => {
    const matchesSearch = item.comment.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.schoolName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSentiment = selectedSentiment ? item.sentiment === selectedSentiment : true;
    const matchesModul = selectedModul ? item.modul.includes(selectedModul) : true;
    const matchesTag = activeTag ? item.comment.toLowerCase().includes(activeTag.toLowerCase()) : true;

    return matchesSearch && matchesSentiment && matchesModul && matchesTag;
  });

  const totalPages = Math.max(1, Math.ceil(filteredFeedback.length / itemsPerPage));
  const currentItems = filteredFeedback.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getPageRange = () => {
    const range: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) range.push(i);
    return range;
  };

  // ---------------------------------------------------
  // SCHOOL USER VIEW: SUBMISSION FORM & SUBMITTED LIST
  // ---------------------------------------------------
  if (userRole === 'pengawas') {
    return (
      <div className="space-y-6">
        {showToast && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 rounded-xl bg-status-sudah text-white px-4 py-3 shadow-xl text-xs font-semibold">
            <CheckCircle2 className="h-4 w-4" />
            <span>{showToast}</span>
          </div>
        )}

        {/* Header */}
        <div className="rounded-card bg-surface p-6 shadow-card border border-border">
          <h2 className="text-xl font-bold font-display text-text-primary">Kirim Umpan Balik dan Kendala</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Sampaikan kritik, saran, hambatan, atau cerita perubahan baik dari implementasi modul BSAN sekolah Anda. Umpan balik Anda dibaca langsung oleh tim evaluasi Dinas Pendidikan.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Submission Form Card */}
          <div className="lg:col-span-1 rounded-card bg-surface p-6 shadow-card border border-border h-fit space-y-4">
            <h3 className="font-bold text-sm text-text-primary border-b border-border pb-3 flex items-center space-x-2">
              <Send className="h-4 w-4 text-primary" />
              <span>Form Ulasan Sekolah</span>
            </h3>

            <form onSubmit={handleSchoolSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-text-secondary uppercase">Pilih Modul Instrumen</label>
                <CustomSelect
                  value={schoolModul}
                  onChange={(val) => setSchoolModul(val)}
                  options={[
                    { value: 'Modul 1: Literasi & Numerasi', label: 'Modul 1: Literasi & Numerasi' },
                    { value: 'Modul 2: Pengembangan Karakter', label: 'Modul 2: Pengembangan Karakter' },
                    { value: 'Modul 3: Kepemimpinan Instruksional', label: 'Modul 3: Kepemimpinan Instruksional' },
                    { value: 'Modul 4: Lingkungan Belajar', label: 'Modul 4: Lingkungan Belajar' },
                    { value: 'Modul 5: Kemitraan Orang Tua', label: 'Modul 5: Kemitraan Orang Tua' },
                  ]}
                  placeholder="Pilih Modul Instrumen"
                  size="md"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-text-secondary uppercase">Sentiment Ulasan</label>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    { id: 'positif', label: 'Positif', icon: Smile, color: 'text-status-sudah border-status-sudah/20 bg-status-sudah/5' },
                    { id: 'netral', label: 'Netral', icon: Meh, color: 'text-status-sebagian border-status-sebagian/20 bg-status-sebagian/5' },
                    { id: 'negatif', label: 'Kritik / Kendala', icon: Frown, color: 'text-status-belum border-status-belum/20 bg-status-belum/5' }
                  ].map((s) => {
                    const Icon = s.icon;
                    const isSelected = schoolSentiment === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSchoolSentiment(s.id as any)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all duration-300 ${
                          isSelected ? `${s.color} border-2 ring-2 ring-primary/10 font-bold scale-[1.02]` : 'border-border bg-bg/50 hover:bg-bg text-text-secondary'
                        }`}
                      >
                        <Icon className="h-5 w-5 mb-1" />
                        <span className="text-[10px] whitespace-nowrap">{s.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-text-secondary uppercase">Teks Narasi Ulasan</label>
                <textarea
                  required
                  rows={5}
                  value={schoolComment}
                  onChange={(e) => setSchoolComment(e.target.value)}
                  placeholder="Ketik ulasan, pengalaman, kendala sarana, atau saran perbaikan Anda di sini..."
                  className="w-full rounded-xl border border-border bg-bg p-3.5 text-text-primary placeholder-text-secondary/50 focus:border-primary focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold shadow-md hover:scale-[1.01] active:scale-[0.99] transition-smooth cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Kirim Ulasan Anda</span>
              </button>
            </form>
          </div>

          {/* Submitted Feedbacks History Card */}
          <div className="lg:col-span-2 rounded-card bg-surface p-6 shadow-card border border-border space-y-4">
            <h3 className="font-bold text-sm text-text-primary border-b border-border pb-3 flex items-center justify-between">
              <span>Riwayat Ulasan SDN Candi 1 Sidoarjo</span>
              <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">{schoolFeedbacks.length} Terkirim</span>
            </h3>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {schoolFeedbacks.map((item) => (
                <div key={item.id} className="rounded-2xl bg-bg/40 p-4 border border-border flex flex-col space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 rounded-full bg-surface border border-border/50">
                        {getSentimentIcon(item.sentiment)}
                      </div>
                      <div>
                        <span className="font-semibold text-primary bg-primary/5 px-2.5 py-0.5 rounded-md text-[10px]">
                          {item.modul}
                        </span>
                        <p className="text-[10px] text-text-secondary mt-1 flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{item.date}</span>
                        </p>
                      </div>
                    </div>
                    {getSentimentBadge(item.sentiment)}
                  </div>

                  <p className="text-text-primary text-xs leading-relaxed italic bg-surface p-3.5 rounded-xl border border-border/40 font-medium">
                    "{item.comment}"
                  </p>
                </div>
              ))}

              {schoolFeedbacks.length === 0 && (
                <div className="text-center py-12 text-text-secondary text-xs">
                  Belum ada umpan balik yang terkirim. Silakan isi form di sebelah kiri.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------
  // ADMIN DINAS VIEW: SEARCH, FILTER & RESPONDENTS LIST
  // ---------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-card bg-surface p-6 shadow-card border border-border">
        <h2 className="text-xl font-bold font-display text-text-primary">Suara Responden (Narasi Teks Bebas)</h2>
        <p className="text-xs text-text-secondary mt-0.5">
          Rekapitulasi kritik, saran, dan umpan balik langsung dari operator dan kepala sekolah terkait implementasi BSAN.
        </p>
      </div>

      {/* Filter and tags bar */}
      <div className="rounded-card bg-surface p-6 shadow-card border border-border space-y-4">
        {/* Search & dropdown filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Cari kata kunci dalam narasi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg py-2.5 pl-9 pr-4 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-smooth"
            />
          </div>

          <div>
            <CustomSelect
              value={selectedSentiment}
              onChange={(val) => setSelectedSentiment(val)}
              options={[
                { value: '', label: 'Semua Sentiment' },
                { value: 'positif', label: 'Ulasan Positif' },
                { value: 'netral', label: 'Ulasan Netral' },
                { value: 'negatif', label: 'Ulasan Kritik / Masalah' },
              ]}
              placeholder="Semua Sentiment"
              size="md"
            />
          </div>

          <div>
            <CustomSelect
              value={selectedModul}
              onChange={(val) => setSelectedModul(val)}
              options={[
                { value: '', label: 'Semua Modul' },
                { value: 'Modul 1', label: 'Modul 1: Literasi & Numerasi' },
                { value: 'Modul 2', label: 'Modul 2: Pengembangan Karakter' },
                { value: 'Modul 3', label: 'Modul 3: Kepemimpinan Instruksional' },
                { value: 'Modul 4', label: 'Modul 4: Lingkungan Belajar' },
                { value: 'Modul 5', label: 'Modul 5: Kemitraan Orang Tua' },
              ]}
              placeholder="Semua Modul"
              size="md"
            />
          </div>
        </div>

        {/* Tag Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60">
          <span className="text-xs font-bold text-text-secondary uppercase mr-1.5 flex items-center space-x-1">
            <Tag className="h-3.5 w-3.5" />
            <span>Topik Utama:</span>
          </span>
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => { setActiveTag(activeTag === tag ? null : tag); setCurrentPage(1); }}
              className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-smooth ${
                activeTag === tag
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-bg text-text-secondary border border-border hover:bg-border/40'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback Grid */}
      {isLoading ? (
        <div className="h-64 flex items-center justify-center text-sm text-text-secondary animate-pulse">
          Menganalisis dan memuat ulasan narasi sekolah...
        </div>
      ) : filteredFeedback.length === 0 ? (
        <div className="rounded-card bg-surface p-12 text-center text-sm text-text-secondary border border-border">
          Tidak ditemukan ulasan narasi sekolah yang sesuai filter.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {currentItems.map((item) => (
              <div 
                key={item.id} 
                className="rounded-2xl bg-surface p-6 shadow-sm border border-border flex flex-col h-full animate-fade-in-up"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-full bg-bg border border-border/50">
                      {getSentimentIcon(item.sentiment)}
                    </div>
                    <div>
                      <h3 className="font-bold text-text-primary text-sm leading-tight">{item.schoolName}</h3>
                      <div className="flex items-center text-[10px] text-text-secondary mt-0.5 space-x-1.5">
                        <Calendar className="h-3 w-3" />
                        <span>{item.date}</span>
                        <span>•</span>
                        <span>{item.kecamatan}</span>
                      </div>
                    </div>
                  </div>
                  {getSentimentBadge(item.sentiment)}
                </div>

                <div className="flex-1 bg-bg/50 rounded-xl p-4 border border-border/40 relative">
                  <MessageSquareQuote className="absolute top-3 right-3 h-8 w-8 text-border/40" />
                  <p className="text-text-primary text-sm leading-relaxed relative z-10 font-medium">
                    "{item.comment}"
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/50 flex justify-between items-center text-[10px]">
                  <span className="font-semibold text-primary bg-primary/5 px-2.5 py-1 rounded-md">{item.modul}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 rounded-2xl bg-surface border border-border shadow-sm">
              <p className="text-[11px] text-text-secondary font-medium">
                Menampilkan {Math.min(currentItems.length, itemsPerPage)} dari {filteredFeedback.length} suara responden
              </p>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg p-1.5 text-text-secondary hover:bg-bg disabled:opacity-30 transition-smooth"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {getPageRange().map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`h-7 w-7 rounded-lg text-xs font-bold transition-smooth ${
                      currentPage === p ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:bg-bg'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg p-1.5 text-text-secondary hover:bg-bg disabled:opacity-30 transition-smooth"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
