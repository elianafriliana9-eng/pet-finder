import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Heart, Lock, Mail, AlertCircle, ArrowRight, Sparkles, LogIn } from 'lucide-react';
import logoImg from '../assets/logo.png';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login gagal. Periksa kembali email dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 pb-28 md:pb-12">
      <div className="clay-card p-6 md:p-8 text-center">
        <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-3 overflow-hidden">
          <img src={logoImg} alt="StreetPet Logo" className="w-full h-full object-contain drop-shadow-md" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Masuk ke StreetPet</h1>
        <p className="text-xs text-slate-500 mt-1 mb-6 font-medium">
          Platform kepedulian, penyelamatan, dan adopsi hewan jalanan bersama warga.
        </p>

        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 text-left font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
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
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 clay-input text-xs font-medium text-slate-800"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 clay-btn-primary text-white font-black text-sm hover:scale-102 transition flex items-center justify-center gap-2"
          >
            {loading ? 'Memproses...' : <><LogIn className="w-4 h-4" /> Masuk</>}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-xs text-slate-500">
          Belum punya akun?{' '}
          <Link to="/register" className="font-black text-brand-700 hover:underline">
            Daftar Sekarang
          </Link>
        </div>

        {/* Demo Accounts Quick Fill */}
        <div className="mt-6 p-4 rounded-2xl clay-card bg-slate-50 text-left">
          <p className="text-[11px] font-black text-slate-700 mb-2">Akun Uji Coba Cepat:</p>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <button
              type="button"
              onClick={() => { setEmail('warga@gmail.com'); setPassword('password123'); }}
              className="p-2 clay-btn-primary text-white font-bold text-left truncate hover:scale-102 col-span-2 flex items-center justify-between"
            >
              <span>Warga 1 (Lapor / Adopt / Feeding)</span>
              <span className="text-[9px] opacity-80">warga@gmail.com</span>
            </button>
            <button
              type="button"
              onClick={() => { setEmail('adopter@gmail.com'); setPassword('password123'); }}
              className="p-2 clay-btn-secondary font-bold text-slate-800 text-left truncate hover:scale-102 col-span-2 flex items-center justify-between"
            >
              <span>Warga 2 (Lapor / Adopt / Feeding)</span>
              <span className="text-[9px] text-slate-500">adopter@gmail.com</span>
            </button>
            <button
              type="button"
              onClick={() => { setEmail('shelter@pedulianabul.org'); setPassword('shelter12345'); }}
              className="p-2 clay-btn-secondary font-bold text-slate-800 text-left truncate hover:scale-102"
            >
              Verified Shelter
            </button>
            <button
              type="button"
              onClick={() => { setEmail('admin@streetpet.org'); setPassword('admin12345'); }}
              className="p-2 clay-btn-secondary font-bold text-slate-800 text-left truncate hover:scale-102"
            >
              System Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
