import React, { useState } from 'react';
import api from '../api/client';
import { X, ShieldAlert, AlertCircle } from 'lucide-react';

interface ReportFlagModalProps {
  reportId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReportFlagModal: React.FC<ReportFlagModalProps> = ({
  reportId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [reason, setReason] = useState('commercial_selling');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {20
      await api.post('/moderation/flag', {
        report_id: reportId,
        reason,
        details: notes,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal melaporkan postingan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="clay-card max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl clay-badge bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-lg text-slate-900 leading-tight">Laporkan Pelanggaran</h3>
            <p className="text-xs text-rose-600 font-bold">Penegakan Kebijakan Anti-Komersialisasi</p>
          </div>
        </div>

        <p className="text-xs text-slate-500 mb-4 font-medium leading-relaxed">
          Bantu kami menjaga komunitas tetap aman. Postingan yang menerima 3 laporan atau terindikasi jual-beli ilegal akan otomatis disembunyikan untuk ditinjau admin.
        </p>

        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Alasan Pelaporan *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 clay-input text-xs font-bold text-slate-700"
            >
              <option value="commercial_selling">Indikasi Jual Beli / Komersialisasi Ilegal</option>
              <option value="fake_report">Laporan Palsu / Hoaks / Foto dari Internet</option>
              <option value="spam">Spam / Postingan Duplikat Berulang</option>
              <option value="animal_abuse">Konten Kekerasan Terhadap Hewan</option>
              <option value="other">Alasan Lainnya</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Detail Keterangan Pelanggaran (Opsional)
            </label>
            <textarea
              rows={3}
              placeholder="Berikan rincian bukti atau kronologi kecurigaan Anda..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 clay-input text-xs font-medium text-slate-800"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 clay-btn-secondary text-xs font-bold text-slate-600"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-2xl bg-rose-600 text-white font-black text-xs hover:bg-rose-700 disabled:opacity-50 transition"
            >
              {submitting ? 'Mengirim...' : 'Kirim Laporan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
