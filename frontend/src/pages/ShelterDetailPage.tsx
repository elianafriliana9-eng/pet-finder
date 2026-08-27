import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import type { ShelterProfile, Report } from '../types';
import { PetCard } from '../components/PetCard';
import { ShieldCheck, Heart, ExternalLink, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';

export const ShelterDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ['shelter', id],
    queryFn: async () => {
      const res = await api.get(`/shelters/${id}`);
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 text-brand-500 animate-spin mb-2" />
        <p className="text-xs text-slate-500">Memuat profil shelter...</p>
      </div>
    );
  }

  const shelter: ShelterProfile = data?.shelter;
  const pets: Report[] = data?.pets || [];

  if (!shelter) {
    return (
      <div className="p-8 text-center">
        <p className="text-xs text-slate-500">Shelter tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-28 md:pb-12">
      <Link to="/shelters" className="inline-flex items-center gap-1.5 px-3 py-1.5 clay-btn-secondary text-xs font-bold text-slate-700 mb-4 transition hover:scale-105">
        <ArrowLeft className="w-4 h-4 text-brand-700" /> Kembali ke Daftar Shelter
      </Link>

      <div className="clay-card p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl clay-badge bg-brand-50 text-brand-700 flex items-center justify-center font-black text-2xl">
              {shelter.shelter_name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900">{shelter.shelter_name}</h1>
                {shelter.is_verified && (
                  <span className="px-3 py-1 clay-badge bg-brand-100 text-brand-800 text-xs font-black flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-brand-700" /> Verified Shelter
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">{shelter.address}</p>
            </div>
          </div>

          {shelter.donation_link && (
            <a
              href={shelter.donation_link}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3.5 rounded-2xl clay-card-brand text-white font-black text-xs hover:scale-105 transition flex items-center gap-2"
            >
              <Heart className="w-4 h-4 fill-current" /> Dukung Donasi Resmi Shelter <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {shelter.description && (
          <div className="mt-6 pt-6 border-t border-slate-100">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Tentang Shelter</h3>
            <p className="text-xs leading-relaxed text-slate-600 font-medium">{shelter.description}</p>
          </div>
        )}

        {shelter.adoption_policy && (
          <div className="mt-4 p-4 rounded-2xl clay-card bg-brand-50/50">
            <h3 className="text-xs font-black text-brand-900 uppercase tracking-wider mb-1">Kebijakan & Syarat Adopsi Shelter</h3>
            <p className="text-xs leading-relaxed text-brand-800 font-medium">{shelter.adoption_policy}</p>
          </div>
        )}
      </div>

      {/* Ready Pets List */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          Anabul yang Siap Diadopsi di Shelter Ini ({pets.length})
        </h2>

        {pets.length === 0 ? (
          <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center">
            <p className="text-xs text-slate-500">Saat ini belum ada anabul yang terdaftar di shelter ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {pets.map((pet) => (
              <PetCard key={pet.id} report={pet} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
