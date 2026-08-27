import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../api/client';
import type { AdoptionApplication } from '../types';
import { useAuth } from '../context/AuthContext';
import { ClipboardList, CheckCircle, XCircle, Clock, Heart, RefreshCw, MessageSquare } from 'lucide-react';

export const AdoptionPipelinePage: React.FC = () => {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['my-adoptions'],
    queryFn: async () => {
      const res = await api.get('/adoptions/my');
      return res.data.data;
    },
    enabled: !!user,
  });

  const applications: AdoptionApplication[] = data?.data || [];

  const statusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-3 py-1 clay-badge bg-brand-100 text-brand-800 font-black text-xs flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Disetujui</span>;
      case 'rejected':
        return <span className="px-3 py-1 clay-badge bg-rose-100 text-rose-800 font-black text-xs flex items-center gap-1"><XCircle className="w-4 h-4" /> Belum Lolos</span>;
      default:
        return <span className="px-3 py-1 clay-badge bg-amber-100 text-amber-900 font-black text-xs flex items-center gap-1"><Clock className="w-4 h-4" /> Sedang Ditinjau</span>;
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 clay-card text-center">
        <ClipboardList className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h2 className="text-lg font-black text-slate-900">Masuk untuk Melihat Skrining Adopsi</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          Anda perlu login untuk melihat status permohonan adopsi dan meninjau skrining calon adopter.
        </p>
        <Link to="/login" className="px-6 py-3 clay-btn-primary text-white text-xs font-black">
          Masuk ke Akun
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-28 md:pb-12">
      <div className="mb-6">
        <span className="px-3 py-1 clay-badge bg-brand-100 text-brand-800 text-[11px] font-black uppercase tracking-wider">
          Modul 4: Manajemen & Skrining Adopsi
        </span>
        <h1 className="text-2xl font-black text-slate-900 mt-2">Pelacak Status Permohonan Adopsi</h1>
        <p className="text-xs text-slate-500 mt-1">
          Pantau status pengajuan formulir adopsi anabul yang telah Anda ajukan kepada pelapor / shelter.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <RefreshCw className="w-8 h-8 text-brand-500 animate-spin mb-2" />
          <p className="text-xs text-slate-500">Memuat status pengajuan...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="p-12 clay-card text-center">
          <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-black text-slate-900">Belum Ada Pengajuan Adopsi</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Anda belum pernah mengajukan skrining adopsi hewan. Jelajahi peta untuk menemukan anabul jalanan.
          </p>
          <Link to="/explore" className="px-5 py-3 clay-btn-primary text-white font-black text-xs">
            Cari Anabul untuk Diadopsi
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="clay-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                {app.report?.images?.[0] ? (
                  <img
                    src={app.report.images[0].thumbnail_url}
                    alt="Pet"
                    className="w-20 h-20 rounded-2xl object-cover shrink-0 clay-badge p-1 bg-white"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl clay-badge bg-slate-100 flex items-center justify-center shrink-0">
                    <Heart className="w-8 h-8 text-slate-300" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {statusBadge(app.status)}
                    <span className="text-[11px] text-slate-400 font-medium">
                      Diajukan {new Date(app.created_at).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  <h3 className="font-black text-slate-900 text-base">
                    {app.report?.title || 'Laporan Anabul'}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 font-medium">
                    Hunian: {app.screening_answers?.housing_type} | Izin: {app.screening_answers?.housing_permit ? 'Ya' : 'Tidak'} | Steril: {app.screening_answers?.sterilization_commitment ? 'Komit' : 'Tidak'}
                  </p>
                  {app.notes && (
                    <p className="text-xs text-slate-600 italic mt-1.5 clay-card bg-slate-50 p-2.5 rounded-xl font-medium">
                      "{app.notes}"
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                {app.report && (
                  <Link
                    to={`/reports/${app.report.id}`}
                    className="flex-1 md:flex-none text-center px-4 py-2.5 clay-btn-secondary text-slate-800 font-black text-xs transition"
                  >
                    Lihat Postingan
                  </Link>
                )}
                {app.report?.user_id && (
                  <Link
                    to={`/messages?user=${app.report.user_id}&report=${app.report.id}`}
                    className="flex-1 md:flex-none text-center px-4 py-2.5 clay-btn-primary text-white font-black text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Chat
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
