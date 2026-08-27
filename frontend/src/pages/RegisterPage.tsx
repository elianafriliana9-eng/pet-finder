import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Heart, AlertCircle, Building2, User, UserPlus, ShieldCheck } from 'lucide-react';
import logoImg from '../assets/logo.png';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'reporter' | 'shelter'>('reporter');
  const [shelterName, setShelterName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirmation) {
      setError('Konfirmasi password tidak cocok dengan password yang dimasukkan.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/register', {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
        phone: phone || undefined,
        role,
        shelter_name: role === 'shelter' ? shelterName : undefined,
      });
      login(res.data.token, res.data.user);
      navigate(role === 'shelter' ? '/shelters/apply' : '/');
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const errorList = Object.values(err.response.data.errors).flat() as string[];
        setError(errorList.join('. '));
      } else {
        setError(err.response?.data?.message || 'Pendaftaran gagal. Periksa kembali kelengkapan data.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 pb-28 md:pb-12">
      <div className="clay-card p-6 md:p-8 text-center">
        <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-3 overflow-hidden">
          <img src={logoImg} alt="StreetPet Logo" className="w-full h-full object-contain drop-shadow-md" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Bergabung Bersama Kami</h1>
        <p className="text-xs text-slate-500 mt-1 mb-6 font-medium">
          Selamatkan anabul terlantar secara terbuka dan saling peduli bersama warga.
        </p>

        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 text-left font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Role selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Daftar Sebagai:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('reporter')}
                className={`py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
                  role === 'reporter'
                    ? 'clay-btn-primary text-white'
                    : 'clay-btn-secondary text-slate-700'
                }`}
              >
                Warga / Komunitas
              </button>
              <button
                type="button"
                onClick={() => setRole('shelter')}
                className={`py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
                  role === 'shelter'
                    ? 'clay-btn-primary text-white'
                    : 'clay-btn-secondary text-slate-700'
                }`}
              >
                Shelter / Rescue
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-1.5 font-medium leading-relaxed">
              {role === 'reporter'
                ? 'Satu akun serbaguna: Anda dapat melaporkan hewan jalanan, mengajukan adopsi, maupun sekadar mencatat aksi memberi makan (street feeding).'
                : 'Akun khusus organisasi/shelter untuk mengelola shelter, mengklaim penanganan laporan, dan proteksi masking lokasi.'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap *</label>
            <input
              type="text"
              placeholder="Nama Anda"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 clay-input text-xs font-medium text-slate-800"
              required
            />
          </div>

          {role === 'shelter' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Shelter / Komunitas *</label>
              <input
                type="text"
                placeholder="Contoh: Shelter Peduli Anabul"
                value={shelterName}
                onChange={(e) => setShelterName(e.target.value)}
                className="w-full px-3.5 py-2.5 clay-input text-xs font-medium text-slate-800"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Email *</label>
            <input
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 clay-input text-xs font-medium text-slate-800"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nomor WhatsApp / Kontak (Opsional)</label>
            <input
              type="tel"
              placeholder="0812xxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 clay-input text-xs font-medium text-slate-800"
            />
            <p className="text-[10px] text-slate-400 mt-1 font-medium">Nomor kontak tidak akan ditampilkan ke publik.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password (Min. 8 karakter) *</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 clay-input text-xs font-medium text-slate-800"
              required
              minLength={8}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Konfirmasi Password *</label>
            <input
              type="password"
              placeholder="••••••••"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              className="w-full px-3.5 py-2.5 clay-input text-xs font-medium text-slate-800"
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 clay-btn-primary text-white font-black text-sm hover:scale-102 transition flex items-center justify-center gap-2"
          >
            {loading ? 'Mendaftarkan...' : <><UserPlus className="w-4 h-4" /> Buat Akun Gratis</>}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-xs text-slate-500">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-black text-brand-700 hover:underline">
            Masuk Sekarang
          </Link>
        </div>
      </div>
    </div>
  );
};
