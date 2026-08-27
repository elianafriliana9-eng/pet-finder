import React, { useState } from 'react';
import type { Report } from '../types';
import api from '../api/client';
import { X, Check, Heart, AlertCircle } from 'lucide-react';

interface AdoptionModalProps {
  report: Report;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdoptionModal: React.FC<AdoptionModalProps> = ({
  report,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [housingType, setHousingType] = useState('Rumah Pribadi');
  const [housingPermit, setHousingPermit] = useState(true);
  const [petHistory, setPetHistory] = useState('');
  const [financialReadiness, setFinancialReadiness] = useState(true);
  const [sterilizationCommitment, setSterilizationCommitment] = useState(true);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!petHistory.trim()) {
      setError('Mohon jelaskan riwayat pengalaman memelihara hewan Anda.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api.post('/adoptions/submit', {
        report_id: report.id,
        screening_answers: {
          housing_type: housingType,
          housing_permit: housingPermit,
          pet_history: petHistory,
          financial_readiness: financialReadiness,
          sterilization_commitment: sterilizationCommitment,
        },
        notes,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengirim formulir skrining adopsi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="clay-card max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl clay-btn-primary flex items-center justify-center text-white shrink-0">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h3 className="font-black text-lg text-slate-900 leading-tight">Formulir Skrining Calon Adopter</h3>
            <p className="text-xs text-brand-700 font-bold">100% Gratis & Bertanggung Jawab</p>
          </div>
        </div>

        <p className="text-xs text-slate-500 mb-5 font-medium leading-relaxed">
          Menjawab 5 pertanyaan komitmen di bawah ini membantu pelapor / shelter memastikan anabul mendapatkan lingkungan yang aman dan penyayang seumur hidup.
        </p>

        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Question 1: Housing Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              1. Tipe Tempat Tinggal Saat Ini *
            </label>
            <select
              value={housingType}
              onChange={(e) => setHousingType(e.target.value)}
              className="w-full px-3.5 py-2.5 clay-input text-xs font-bold text-slate-700"
            >
              <option value="Rumah Pribadi">Rumah Pribadi</option>
              <option value="Rumah Kontrakan/Sewa">Rumah Kontrakan / Sewa</option>
              <option value="Apartemen">Apartemen</option>
              <option value="Kost">Kost / Kamar Sewa</option>
            </select>
          </div>

          {/* Question 2: Housing Permit */}
          <div className="clay-card p-4 bg-slate-50 space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              2. Apakah pemilik hunian / keluarga mengizinkan hewan peliharaan? *
            </label>
            <div className="flex gap-4 pt-1">
              <label className="inline-flex items-center gap-2 text-xs font-bold cursor-pointer">
                <input
                  type="radio"
                  name="permit"
                  checked={housingPermit === true}
                  onChange={() => setHousingPermit(true)}
                  className="accent-brand-600 w-4 h-4"
                />
                Ya, sudah berizin resmi
              </label>
              <label className="inline-flex items-center gap-2 text-xs font-bold cursor-pointer">
                <input
                  type="radio"
                  name="permit"
                  checked={housingPermit === false}
                  onChange={() => setHousingPermit(false)}
                  className="accent-brand-600 w-4 h-4"
                />
                Belum pasti / Menunggu izin
              </label>
            </div>
          </div>

          {/* Question 3: Pet Experience */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              3. Riwayat & Pengalaman Memelihara Hewan *
            </label>
            <textarea
              rows={2}
              placeholder="Ceritakan pengalaman Anda sebelumnya dalam merawat hewan..."
              value={petHistory}
              onChange={(e) => setPetHistory(e.target.value)}
              className="w-full px-3.5 py-2.5 clay-input text-xs font-medium text-slate-800"
              required
            />
          </div>

          {/* Question 4: Financial Readiness */}
          <div className="clay-card p-4 bg-slate-50 space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              4. Kesiapan Finansial Medis (Vaksin, Makanan, Steril, Vet Darurat) *
            </label>
            <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={financialReadiness}
                onChange={(e) => setFinancialReadiness(e.target.checked)}
                className="accent-brand-600 w-4 h-4 rounded"
              />
              Saya sanggup membiayai pakan bergizi & kebutuhan medis veteriner
            </label>
          </div>

          {/* Question 5: Sterilization Commitment */}
          <div className="clay-card p-4 bg-slate-50 space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              5. Komitmen Sterilisasi (Mencegah Overpopulasi Liar) *
            </label>
            <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={sterilizationCommitment}
                onChange={(e) => setSterilizationCommitment(e.target.checked)}
                className="accent-brand-600 w-4 h-4 rounded"
              />
              Saya berkomitmen melakukan sterilisasi jika anabul belum disteril
            </label>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Catatan Tambahan untuk Pemilik / Shelter (Opsional)
            </label>
            <textarea
              rows={2}
              placeholder="Pesan khusus mengenai komitmen adopsi Anda..."
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
              className="px-6 py-3 clay-btn-primary text-white text-xs font-black hover:scale-105 disabled:opacity-50 transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              {submitting ? 'Mengirim Formulir...' : 'Kirim Pengajuan Skrining'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
