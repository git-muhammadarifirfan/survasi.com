import { useState } from 'react';
import { Mail, Send, XCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiClient } from '../../../shared/services/api-client';
import CustomSelect from '../../../shared/components/CustomSelect';

interface NotificationManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationManagerModal({ isOpen, onClose }: NotificationManagerModalProps) {
  const [judul, setJudul] = useState('');
  const [pesan, setPesan] = useState('');
  const [targetRole, setTargetRole] = useState<'all' | 'admin' | 'pengawas' | 'sekolah'>('all');
  const [tipe, setTipe] = useState<'system' | 'reminder' | 'report' | 'alert'>('system');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const res = await apiClient.notifikasi.sendBroadcast({
        target_role: targetRole === 'all' ? undefined : targetRole,
        judul: judul.trim(),
        pesan: pesan.trim(),
        tipe,
      });

      if (res.success) {
        setSuccess(res.message || 'Notifikasi berhasil dikirim!');
        setTimeout(() => {
          setJudul('');
          setPesan('');
          setSuccess('');
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal mengirim notifikasi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-lg bg-surface rounded-2xl p-6 shadow-2xl border border-border space-y-4 animate-scale-in">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="font-bold font-display text-text-primary text-base flex items-center space-x-2">
            <Mail className="h-5 w-5 text-accent" />
            <span>Buat & Broadcast Notifikasi System</span>
          </h3>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-600">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-text-secondary uppercase">Target Penerima</label>
            <div className="grid grid-cols-4 gap-1.5 mt-1">
              <button
                type="button"
                onClick={() => setTargetRole('all')}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                  targetRole === 'all' ? 'bg-accent text-white border-accent' : 'bg-bg text-text-secondary hover:text-text-primary'
                }`}
              >
                Semua User
              </button>
              <button
                type="button"
                onClick={() => setTargetRole('admin')}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                  targetRole === 'admin' ? 'bg-teal-600 text-white border-teal-600' : 'bg-bg text-text-secondary hover:text-text-primary'
                }`}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => setTargetRole('pengawas')}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                  targetRole === 'pengawas' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-bg text-text-secondary hover:text-text-primary'
                }`}
              >
                Pengawas
              </button>
              <button
                type="button"
                onClick={() => setTargetRole('sekolah')}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                  targetRole === 'sekolah' ? 'bg-amber-600 text-white border-amber-600' : 'bg-bg text-text-secondary hover:text-text-primary'
                }`}
              >
                Sekolah
              </button>
            </div>
          </div>

          <div>
            <CustomSelect
              label="Kategori Notifikasi"
              options={[
                { value: 'system', label: 'Pemberitahuan Sistem (System Announcement)' },
                { value: 'reminder', label: 'Pengingat Waktu / Deadline (Reminder)' },
                { value: 'report', label: 'Hasil Laporan & Progress (Report)' },
                { value: 'alert', label: 'Peringatan Penting (Alert)' },
              ]}
              value={tipe}
              onChange={(val) => setTipe(val)}
              size="md"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-text-secondary uppercase">Judul Notifikasi</label>
            <input
              type="text"
              required
              placeholder="Contoh: Perpanjangan Batas Waktu Survei BSAN"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              className="w-full rounded-xl border border-border bg-bg p-2.5 text-xs text-text-primary mt-1 focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-text-secondary uppercase">Isi Pesan Notifikasi</label>
            <textarea
              required
              rows={3}
              placeholder="Tuliskan detail informasi pesan notifikasi di sini..."
              value={pesan}
              onChange={(e) => setPesan(e.target.value)}
              className="w-full rounded-xl border border-border bg-bg p-2.5 text-xs text-text-primary mt-1 focus:border-primary focus:outline-none resize-none"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-border text-xs font-bold text-text-secondary hover:bg-bg"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-dark disabled:bg-accent/60 text-white text-xs font-bold shadow-md shadow-accent/20 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isLoading ? 'Kirim...' : 'Kirim Broadcast'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
