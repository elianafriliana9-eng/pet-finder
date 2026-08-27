import React, { useState } from 'react';
import api from '../api/client';
import type { ActivityType } from '../types';
import { X, Utensils, Eye, Stethoscope, Home, MapPin, Camera, Navigation, RefreshCw, AlertCircle, Check } from 'lucide-react';

interface CommunityCheckInModalProps {
  reportId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialActivityType?: ActivityType;
}

export const CommunityCheckInModal: React.FC<CommunityCheckInModalProps> = ({
  reportId,
  isOpen,
  onClose,
  onSuccess,
  initialActivityType = 'fed',
}) => {
  const [activityType, setActivityType] = useState<ActivityType>(initialActivityType);

  // Sync initialActivityType when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setActivityType(initialActivityType);
    }
  }, [isOpen, initialActivityType]);
  const [notes, setNotes] = useState('');
  const [addressNote, setAddressNote] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setUseCurrentLocation(true);
        setLocating(false);
      },
      () => {
        setLocating(false);
        alert('Gagal mendeteksi koordinat GPS.');
      },
      { timeout: 8000 }
    );
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const formData = new FormData();
    formData.append('activity_type', activityType);
    if (notes) formData.append('notes', notes);
    if (photo) formData.append('photo', photo);
    if (useCurrentLocation && latitude && longitude) {
      formData.append('latitude', String(latitude));
      formData.append('longitude', String(longitude));
    }
    if (addressNote) formData.append('address_note', addressNote);

    try {
      await api.post(`/reports/${reportId}/activity`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menyimpan check-in.');
    } finally {
      setSubmitting(false);
    }
  };

  const activityOptions: { type: ActivityType; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      type: 'fed',
      label: 'Beri Makan / Street Feeding',
      icon: <Utensils className="w-5 h-5 text-amber-600" />,
      desc: 'Bantu beri pakan atau air minum bersih untuk anabul',
    },
    {
      type: 'sighted',
      label: 'Cek Lokasi / Masih Terpantau',
      icon: <Eye className="w-5 h-5 text-blue-600" />,
      desc: 'Konfirmasi anabul masih berada di titik koordinat ini',
    },
    {
      type: 'treated',
      label: 'Bantu Rawat / Obati',
      icon: <Stethoscope className="w-5 h-5 text-brand-700" />,
      desc: 'Beri obat luka, vitamin, atau bawa sementara ke klinik',
    },
    {
      type: 'secured',
      label: 'Diamankan / Bawa Pulang',
      icon: <Home className="w-5 h-5 text-purple-600" />,
      desc: 'Anabul sudah Anda evakuasi/bawa ke tempat aman / adopsi',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="clay-card max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <span className="px-3 py-1 clay-badge bg-brand-100 text-brand-800 text-[11px] font-black uppercase tracking-wider">
            People to People Care
          </span>
          <h3 className="font-black text-xl text-slate-900 mt-2">Update Kondisi & Check-In Anabul</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
            Semua orang bisa berkontribusi! Beritahu komunitas sekitar jika Anda baru saja memberi makan, mengecek kondisi, atau mengevakuasi anabul ini.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Action Types */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {activityOptions.map((opt) => {
              const active = activityType === opt.type;
              return (
                <button
                  type="button"
                  key={opt.type}
                  onClick={() => setActivityType(opt.type)}
                  className={`p-3 rounded-2xl text-left transition flex items-start gap-2.5 ${
                    active ? 'clay-btn-primary text-white scale-102' : 'clay-btn-secondary text-slate-800'
                  }`}
                >
                  <div className={`p-2 rounded-xl shrink-0 ${active ? 'bg-white/20 text-white' : 'bg-slate-100'}`}>
                    {opt.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-black leading-tight">{opt.label}</h4>
                    <p className={`text-[10px] mt-0.5 leading-snug ${active ? 'text-brand-100' : 'text-slate-500'}`}>
                      {opt.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Catatan untuk Warga & Komunitas Lain
            </label>
            <textarea
              rows={2}
              placeholder={
                activityType === 'fed'
                  ? 'Contoh: Sudah dikasih dry food dan air bersih di dekat tiang listrik, anabul makan lahap...'
                  : activityType === 'secured'
                  ? 'Contoh: Sudah saya bawa ke rumah sementara di RT 03, silakan kontak jika ingin adopsi...'
                  : 'Tuliskan kondisi anabul yang Anda temukan di lokasi...'
              }
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 clay-input text-xs font-medium text-slate-800"
            />
          </div>

          {/* Photo upload (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Foto Bukti / Kondisi Terkini (Opsional)
            </label>
            <div className="flex items-center gap-3">
              {photoPreview ? (
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden clay-badge p-1 bg-white shrink-0">
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                  <button
                    type="button"
                    onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center text-[10px]"
                  >
                    &times;
                  </button>
                </div>
              ) : (
                <label className="px-4 py-2.5 clay-btn-secondary text-slate-700 text-xs font-bold flex items-center gap-2 cursor-pointer">
                  <Camera className="w-4 h-4 text-brand-700" /> Ambil / Upload Foto
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Update Location checkbox */}
          <div className="clay-card p-3.5 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useCurrentLocation}
                  onChange={(e) => {
                    if (e.target.checked && !latitude) detectLocation();
                    else setUseCurrentLocation(e.target.checked);
                  }}
                  className="accent-brand-600 w-4 h-4 rounded"
                />
                Perbarui Titik Lokasi GPS Terkini
              </label>

              {useCurrentLocation && (
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={locating}
                  className="px-2 py-1 clay-btn-secondary text-[10px] font-bold text-brand-700 flex items-center gap-1"
                >
                  <Navigation className={`w-3 h-3 ${locating ? 'animate-spin' : ''}`} />
                  {locating ? 'Mencari...' : 'GPS Saya'}
                </button>
              )}
            </div>

            {useCurrentLocation && (
              <input
                type="text"
                placeholder="Patokan titik baru (misal: pindah ke depan ruko laundry)"
                value={addressNote}
                onChange={(e) => setAddressNote(e.target.value)}
                className="w-full px-3 py-2 clay-input text-xs font-medium text-slate-800"
              />
            )}
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
              {submitting ? 'Menyimpan Check-in...' : 'Simpan Update Check-In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
