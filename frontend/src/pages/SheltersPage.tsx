import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../api/client';
import type { ShelterProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { useSEO } from '../hooks/useSEO';
import { Building2, ShieldCheck, Heart, ExternalLink, PlusCircle, RefreshCw, AlertCircle } from 'lucide-react';

export const SheltersPage: React.FC = () => {
  useSEO({
    title: 'Daftar Shelter Terverifikasi & Komunitas Rescue',
    description: 'Direktori resmi shelter dan kelompok penyelamat hewan yang telah melewati verifikasi dokumen identitas, fasilitas penampungan, dan komitmen adopsi bebas biaya.',
    url: 'https://streetpet.org/shelters',
    keywords: 'shelter kucing jakarta, shelter anjing indonesia, shelter hewan terverifikasi, donasi shelter anabul',
  });

  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['shelters'],
    queryFn: async () => {
      const res = await api.get('/shelters');
      return res.data.data;
    },
  });

  const shelters: ShelterProfile[] = data?.data || [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-28 md:pb-12">
      {/* Header Banner */}
      <div className="clay-card p-6 md:p-8 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 clay-badge bg-brand-100 text-brand-800 text-[11px] font-black">
              Direktori Komunitas
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-2">Verified Shelter & Komunitas Rescue</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Daftar shelter dan kelompok penyelamat hewan yang telah melewati verifikasi dokumen resmi identitas pengelola dan fasilitas penampungan.
          </p>
        </div>

        {user && (
          <Link
            to="/shelters/apply"
            className="px-5 py-3.5 clay-btn-primary text-white font-black text-xs hover:scale-105 transition shrink-0 flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" /> Daftarkan Shelter Anda
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <RefreshCw className="w-8 h-8 text-brand-500 animate-spin mb-2" />
          <p className="text-xs text-slate-500">Memuat daftar shelter terverifikasi...</p>
        </div>
      ) : shelters.length === 0 ? (
        <div className="clay-card p-10 text-center max-w-md mx-auto">
          <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="font-bold text-slate-900 text-base">Belum Ada Shelter Terverifikasi</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Apakah Anda pengelola shelter atau komunitas rescue? Ajukan verifikasi fasilitas Anda.
          </p>
          <Link
            to="/shelters/apply"
            className="px-5 py-2.5 clay-btn-primary text-white font-bold text-xs"
          >
            Ajukan Verifikasi Sekarang
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {shelters.map((shelter) => (
            <Link
              key={shelter.id}
              to={`/shelters/${shelter.id}`}
              className="clay-card p-6 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-13 h-13 rounded-2xl clay-badge bg-brand-50 text-brand-700 flex items-center justify-center font-black text-xl">
                      {shelter.shelter_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-base flex items-center gap-1.5">
                        {shelter.shelter_name}
                        {shelter.is_verified && (
                          <span title="Verified Shelter">
                            <ShieldCheck className="w-4 h-4 text-brand-700 shrink-0" />
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-1">{shelter.address || 'Jabodetabek'}</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                  {shelter.description || 'Penyelamat dan rumah singgah anabul jalanan.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-black text-brand-700">Lihat Profil & Anabul Siap Adopsi &rarr;</span>
                {shelter.donation_link && (
                  <span className="text-slate-400 text-[11px] font-bold flex items-center gap-1">
                    <ExternalLink className="w-3.5 h-3.5" /> Donasi Resmi
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
