import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { ShieldCheck, Upload, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

export const ShelterApplyPage: React.FC = () => {
  const navigate = useNavigate();
  const [shelterName, setShelterName] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number>(-6.2731);
  const [longitude, setLongitude] = useState<number>(106.8155);
  const [description, setDescription] = useState('');
  const [donationLink, setDonationLink] = useState('');
  const [adoptionPolicy, setAdoptionPolicy] = useState('');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFile) {
      setError('Wajib mengunggah dokumen identitas pengelola (KTP/SK/Foto Fasilitas).');
      return;
    }

    setSubmitting(true);
    setError('');

    const formData = new FormData();
    formData.append('shelter_name', shelterName);
    formData.append('address', address);
    formData.append('latitude', String(latitude));
    formData.append('longitude', String(longitude));
    formData.append('description', description);
    formData.append('donation_link', donationLink);
    formData.append('adoption_policy', adoptionPolicy);
    formData.append('document', docFile);

    try {
      await api.post('/shelters/verification', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Pengajuan verifikasi shelter Anda berhasil dikirim dan sedang menunggu review tim admin!');
      navigate('/shelters');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengajukan verifikasi shelter.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-28 md:pb-12">
      <div className="clay-card p-6 md:p-8">
        <div className="mb-6">
          <span className="px-3 py-1 clay-badge bg-brand-100 text-brand-800 text-[11px] font-black uppercase tracking-wider">
            Modul 1: Verifikasi Shelter Resmi
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-2">Daftarkan Fasilitas Shelter Anda</h1>
          <p className="text-xs text-slate-500 mt-1">
            Dapatkan badge <strong>Verified Shelter</strong>, fitur <em>claim report</em>, serta keamanan penyamaran koordinat lokasi radius otomatis.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nama Shelter / Komunitas *</label>
            <input
              type="text"
              placeholder="Contoh: Sahabat Anabul Rescue Center"
              value={shelterName}
              onChange={(e) => setShelterName(e.target.value)}
              className="w-full px-3.5 py-2.5 clay-input text-xs font-medium text-slate-800"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Fisik Shelter *</label>
            <textarea
              placeholder="Alamat lengkap fasilitas shelter penampungan..."
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 clay-input text-xs font-medium text-slate-800"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">
              *Catatan Privasi: Alamat presisi shelter akan disamarkan menjadi radius kelurahan pada peta publik demi mencegah pembuangan hewan liar sembarangan.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Dokumen Verifikasi (KTP Pengelola / SK Komunitas / Foto Fasilitas) *
            </label>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setDocFile(e.target.files?.[0] || null)}
              className="w-full px-3.5 py-2.5 clay-input text-xs"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Shelter & Visi Penyelamatan</label>
            <textarea
              placeholder="Jelaskan kapasitas shelter, hewan yang ditampung, dan fokus rescue..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 clay-input text-xs font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tautan Donasi Resmi (Opsional)</label>
            <input
              type="url"
              placeholder="https://kitabisa.com/... atau tautan platform donasi resmi"
              value={donationLink}
              onChange={(e) => setDonationLink(e.target.value)}
              className="w-full px-3.5 py-2.5 clay-input text-xs font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Syarat & Kebijakan Adopsi Shelter</label>
            <textarea
              placeholder="Contoh: Wajib sterilisasi, bersedia dikunjungi berkala oleh relawan..."
              rows={2}
              value={adoptionPolicy}
              onChange={(e) => setAdoptionPolicy(e.target.value)}
              className="w-full px-3.5 py-2.5 clay-input text-xs font-medium text-slate-800"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 clay-btn-primary text-white font-black text-sm hover:scale-102 transition flex items-center justify-center gap-2"
          >
            {submitting ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Mengirimkan Berkas...</>
            ) : (
              <><ShieldCheck className="w-5 h-5" /> Ajukan Verifikasi Shelter</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
