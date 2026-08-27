import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useSEO } from '../hooks/useSEO';
import { Camera, MapPin, Upload, Navigation, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

export const ReportPage: React.FC = () => {
  useSEO({
    title: 'Laporkan Temuan Hewan Jalanan Terlantar',
    description: 'Laporkan titik lokasi penemuan kucing atau anjing terlantar dengan koordinat GPS presisi dan foto terkompresi cepat untuk bantuan warga & shelter.',
    url: 'https://streetpet.org/report',
  });

  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [petType, setPetType] = useState<'cat' | 'dog'>('cat');
  const [ageGroup, setAgeGroup] = useState<'kitten_puppy' | 'adult' | 'senior'>('adult');
  const [condition, setCondition] = useState<'healthy' | 'injured' | 'critical'>('healthy');
  const [petCount, setPetCount] = useState<number>(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [addressNote, setAddressNote] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationName, setLocationName] = useState<string>('Mendeteksi GPS...');
  const [locating, setLocating] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [compressing, setCompressing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch current GPS
  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError('Perangkat Anda tidak mendukung geolokasi GPS.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setLocationName(`Koordinat: ${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
        setLocating(false);
      },
      (err) => {
        setError('Gagal mendeteksi lokasi GPS otomatis: ' + err.message);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    detectLocation();
  }, []);

  // Handle Photo Selection & Client Compression (PRD 4.2 & 6.2)
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (selectedFiles.length + files.length > 5) {
      setError('Maksimal 5 foto untuk satu laporan.');
      return;
    }

    setCompressing(true);
    setError('');

    const compressionOptions = {
      maxSizeMB: 0.8, // Maksimal 800KB sesuai PRD 6.2
      maxWidthOrHeight: 1280,
      useWebWorker: true,
    };

    try {
      const compressedList: File[] = [];
      const previewList: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const compressedFile = await imageCompression(file, compressionOptions);
        compressedList.push(compressedFile);
        previewList.push(URL.createObjectURL(compressedFile));
      }

      setSelectedFiles((prev) => [...prev, ...compressedList]);
      setPreviews((prev) => [...prev, ...previewList]);
    } catch (err: any) {
      setError('Gagal mengompresi gambar: ' + (err.message || 'Error'));
    } finally {
      setCompressing(false);
    }
  };

  const removeImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (selectedFiles.length === 0) {
      setError('Wajib mengunggah minimal 1 foto anabul.');
      return;
    }
    if (latitude === null || longitude === null) {
      setError('Koordinat lokasi GPS belum terdeteksi. Silakan klik tombol deteksi GPS.');
      return;
    }

    setSubmitting(true);
    setError('');

    const formData = new FormData();
    formData.append('pet_type', petType);
    formData.append('age_group', ageGroup);
    formData.append('condition', condition);
    formData.append('pet_count', String(petCount));
    formData.append('title', title || `${petType === 'cat' ? 'Kucing' : 'Anjing'} Terlantar Dekat ${addressNote || 'Jalanan'}`);
    formData.append('description', description);
    formData.append('address_note', addressNote);
    formData.append('latitude', String(latitude));
    formData.append('longitude', String(longitude));

    selectedFiles.forEach((file) => {
      formData.append('images[]', file);
    });

    try {
      const res = await api.post('/reports', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate(`/reports/${res.data.report.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengirim laporan. Pastikan semua data terisi.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!loading && !user) {
    return (
      <div className="max-w-md mx-auto my-12 px-4 py-8 clay-card text-center space-y-4 animate-in fade-in duration-200">
        <div className="w-16 h-16 rounded-3xl clay-badge bg-brand-100 flex items-center justify-center mx-auto text-brand-700">
          <Camera className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 leading-tight">Wajib Masuk Terlebih Dahulu</h2>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Untuk menjaga validitas laporan penemuan dan keamanan komunitas anabul, silakan masuk ke akun Anda sebelum membuat laporan.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button
            onClick={() => navigate('/login', { state: { from: '/report' } })}
            className="w-full py-3 clay-btn-primary text-white font-black text-xs shadow-md transition"
          >
            Masuk ke Akun
          </button>
          <button
            onClick={() => navigate('/register', { state: { from: '/report' } })}
            className="w-full py-3 clay-btn-secondary text-slate-800 font-black text-xs transition"
          >
            Daftar Akun Baru
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-28 md:pb-12">
      <div className="clay-card p-6 md:p-8">
        <div className="mb-6">
          <span className="px-3 py-1 clay-badge bg-brand-100 text-brand-800 text-[11px] font-bold uppercase tracking-wider">
            Modul Pelaporan Hewan Jalanan
          </span>
          <h2 className="text-2xl font-black text-slate-800 mt-2">Buat Laporan Penemuan</h2>
          <p className="text-xs text-slate-500 mt-1">
            Ambil foto langsung di lokasi atau upload dari galeri untuk menghubungkan anabul dengan penolong.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          {/* Photo Upload & Camera Button */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Foto Anabul Jalanan (Maks. 5 Foto) *
            </label>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-2">
              {previews.map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden clay-badge p-1 bg-white group">
                  <img src={url} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center text-xs hover:bg-rose-600 transition"
                  >
                    &times;
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg clay-badge bg-brand-600 text-white text-[9px] font-bold">
                      Utama
                    </span>
                  )}
                </div>
              ))}

              {selectedFiles.length < 5 && (
                <label className="aspect-square rounded-2xl clay-btn-secondary flex flex-col items-center justify-center cursor-pointer p-2 text-center hover:scale-102 transition">
                  <Camera className="w-7 h-7 text-brand-700 mb-1" />
                  <span className="text-[10px] font-bold text-slate-700">Ambil / Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {compressing && (
              <p className="text-[11px] text-brand-700 font-bold flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" /> Mengompresi resolusi foto otomatis...
              </p>
            )}
          </div>

          {/* Type & Age */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Hewan</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPetType('cat')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    petType === 'cat'
                      ? 'clay-btn-primary text-white'
                      : 'clay-btn-secondary text-slate-700'
                  }`}
                >
                  Kucing
                </button>
                <button
                  type="button"
                  onClick={() => setPetType('dog')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    petType === 'dog'
                      ? 'clay-btn-primary text-white'
                      : 'clay-btn-secondary text-slate-700'
                  }`}
                >
                  Anjing
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Perkiraan Usia</label>
              <select
                value={ageGroup}
                onChange={(e: any) => setAgeGroup(e.target.value)}
                className="w-full px-3 py-2.5 clay-input text-xs font-bold text-slate-700"
              >
                <option value="kitten_puppy">Anak (Kitten / Puppy)</option>
                <option value="adult">Dewasa</option>
                <option value="senior">Senior</option>
              </select>
            </div>
          </div>

          {/* Condition & Count */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kondisi Fisik</label>
              <select
                value={condition}
                onChange={(e: any) => setCondition(e.target.value)}
                className="w-full px-3 py-2.5 clay-input text-xs font-bold text-slate-700"
              >
                <option value="healthy">Sehat / Normal</option>
                <option value="injured">Terluka / Sakit</option>
                <option value="critical">Darurat / Kritis (Butuh Rescue Cepat)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Jumlah Ekor</label>
              <input
                type="number"
                min="1"
                max="50"
                value={petCount}
                onChange={(e) => setPetCount(Number(e.target.value))}
                className="w-full px-3 py-2 clay-input text-xs font-bold text-slate-700"
              />
            </div>
          </div>

          {/* Location GPS */}
          <div className="p-4 rounded-2xl clay-card bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <MapPin className="w-4 h-4 text-brand-700" />
                <span>Geolokasi GPS Otomatis</span>
              </div>
              <button
                type="button"
                onClick={detectLocation}
                disabled={locating}
                className="px-3 py-1 clay-btn-secondary text-[11px] font-bold text-slate-700 flex items-center gap-1"
              >
                <Navigation className={`w-3 h-3 ${locating ? 'animate-spin' : ''}`} />
                {locating ? 'Mendeteksi...' : 'Ulangi GPS'}
              </button>
            </div>

            <p className="text-xs text-slate-600 font-mono font-bold">
              {latitude && longitude
                ? `Latitude: ${latitude.toFixed(6)}, Longitude: ${longitude.toFixed(6)}`
                : 'Belum ada koordinat terdeteksi'}
            </p>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Patokan Lokasi Detail (Nama jalan, gedung, warung terdekat) *
              </label>
              <input
                type="text"
                placeholder="Contoh: Di samping Alfamart Jl. Sudirman No. 12, bawah pohon mangga"
                value={addressNote}
                onChange={(e) => setAddressNote(e.target.value)}
                className="w-full px-3.5 py-2.5 clay-input text-xs font-medium text-slate-800"
                required
              />
            </div>
          </div>

          {/* Title & Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Judul Laporan Singkat
            </label>
            <input
              type="text"
              placeholder="Contoh: 2 Anak Kucing Terjebak di Gorong-gorong"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 clay-input text-sm font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Keterangan Tambahan / Kronologi
            </label>
            <textarea
              placeholder="Jelaskan kondisi hewan, warna bulu, apakah agresif atau jinak, dan penanganan sementara yang sudah dilakukan..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 clay-input text-sm font-medium text-slate-800"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || compressing}
            className="w-full py-4 clay-btn-primary text-white font-black text-sm hover:scale-102 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {submitting ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Mengunggah Laporan...</>
            ) : (
              <><CheckCircle className="w-5 h-5" /> Publikasikan Laporan Rescue</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
