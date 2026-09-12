/**
 * @module features/auth/components
 * @description Interactive visual preview component for Brevo HTML Transactional Email Templates (OTP Verification & Password Reset)
 */

import { useState } from 'react';
import { Mail, ShieldCheck, Copy, Check } from 'lucide-react';
import { notifyToast } from '../../../shared/components/NotificationToast';

interface BrevoEmailTemplateProps {
  recipientEmail?: string;
  recipientName?: string;
  otpCode?: string;
  type?: 'verification' | 'reset_password';
}

export default function BrevoEmailTemplate({
  recipientEmail = 'user@survasi.com',
  recipientName = 'Sahabat Survasi',
  otpCode = '849201',
  type = 'verification',
}: BrevoEmailTemplateProps) {
  const [templateType, setTemplateType] = useState<'verification' | 'reset_password'>(type);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(otpCode);
    setCopied(true);
    notifyToast({
      type: 'info',
      title: 'Kode Disalin',
      message: `Kode OTP ${otpCode} disalin ke clipboard.`,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto rounded-3xl bg-surface border border-border shadow-2xl overflow-hidden animate-fade-in">
      {/* Header Toolbar — Soft Clean Theme */}
      <div className="bg-slate-100 text-slate-800 p-4 px-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200">
        <div className="flex items-center space-x-2.5">
          <div className="h-7 w-7 rounded-lg bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-bold text-xs border border-emerald-600/20">
            <Mail className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <span>Pratinjau Email Kode Verifikasi</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-600/10 text-emerald-700 border border-emerald-600/20">
                Email Otomatis
              </span>
            </h4>
            <p className="text-[10px] text-slate-500">Penerima: <strong className="text-slate-700">{recipientEmail}</strong></p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <button
            type="button"
            onClick={() => setTemplateType('verification')}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer text-[11px] ${templateType === 'verification'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
          >
            Verifikasi Kode
          </button>
          <button
            type="button"
            onClick={() => setTemplateType('reset_password')}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer text-[11px] ${templateType === 'reset_password'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
          >
            Reset Sandi
          </button>
        </div>
      </div>

      {/* HTML Email Canvas Body (Simulating Email Client Box) */}
      <div className="p-6 sm:p-10 bg-slate-50 border-b border-border font-sans">
        <div className="max-w-md mx-auto bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
          {/* Email Header Banner — Simple Clean Green */}
          <div className="bg-emerald-600 p-6 text-white text-center space-y-1.5">
            <h2 className="text-lg font-bold font-display tracking-tight text-white">
              {templateType === 'verification' ? 'Kode Verifikasi Otentikasi' : 'Permintaan Reset Kata Sandi'}
            </h2>
            <p className="text-xs text-emerald-100">Survasi Platform — Layanan Keamanan</p>
          </div>

          {/* Email Content Body */}
          <div className="p-6 sm:p-8 space-y-5 text-slate-700 text-xs leading-relaxed">
            <p className="font-semibold text-slate-900 text-sm">
              Halo, <span className="text-emerald-600 font-bold">{recipientName || 'Pengguna Survasi'}</span>!
            </p>

            {templateType === 'verification' ? (
              <p>
                Terima kasih telah mendaftar di <strong>Survasi System</strong>.
                Gunakan kode otentikasi di bawah ini untuk memverifikasi akun Anda:
              </p>
            ) : (
              <p>
                Kami menerima permintaan untuk mereset kata sandi akun Survasi Anda.
                Gunakan kode reset keamanan 6-digit di bawah ini untuk melanjutkan:
              </p>
            )}

            {/* OTP Code Card Badge */}
            <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-center space-y-2 relative group">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest block">
                Kode Keamanan OTP (Berlaku 30 Menit)
              </span>
              <div className="flex items-center justify-center space-x-2">
                <span className="text-3xl font-extrabold font-mono tracking-[0.25em] text-emerald-950">
                  {otpCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="p-2 rounded-xl bg-white border border-emerald-200 text-emerald-600 hover:bg-emerald-600 hover:text-white transition cursor-pointer shadow-xs"
                  title="Salin Kode OTP"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-900 flex items-start space-x-2.5">
              <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Informasi OTP:</strong> Kode ini berlaku selama 30 menit. Jika masa berlaku habis atau terlewat, Anda dapat melakukan pendaftaran ulang menggunakan alamat email yang sama.
              </span>
            </div>

            <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              Jika Anda tidak merasa melakukan tindakan ini, abaikan pesan email ini secara aman.
            </p>
          </div>

          {/* Email Footer */}
          <div className="bg-slate-50 p-4 text-center border-t border-slate-100 space-y-1">
            <p className="text-[10px] font-bold text-slate-600">Survasi Platform - System Security</p>
            <p className="text-[9px] text-slate-400">Pesan ini dikirim secara otomatis oleh sistem, mohon tidak membalas email ini.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
