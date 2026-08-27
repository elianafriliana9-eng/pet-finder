import React from 'react';
import { Link } from 'react-router-dom';
import type { Report } from '../types';
import { MapPin, ShieldCheck, AlertCircle, Heart } from 'lucide-react';

interface PetCardProps {
  report: Report;
}

export const PetCard: React.FC<PetCardProps> = ({ report }) => {
  const primaryImage = report.images?.find((img) => img.is_primary)?.thumbnail_url ||
    report.images?.[0]?.thumbnail_url ||
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&auto=format&fit=crop&q=60';

  const formatDistance = (meters?: number) => {
    if (meters === undefined || meters === null) return null;
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <span className="px-3 py-1 clay-badge bg-brand-100 text-brand-800 text-[11px] font-bold">Tersedia</span>;
      case 'screening':
        return <span className="px-3 py-1 clay-badge bg-amber-100 text-amber-900 text-[11px] font-bold">Dalam Skrining</span>;
      case 'rescued':
        return <span className="px-3 py-1 clay-badge bg-blue-100 text-blue-900 text-[11px] font-bold">Diamankan Shelter</span>;
      case 'adopted':
        return <span className="px-3 py-1 clay-badge bg-purple-100 text-purple-900 text-[11px] font-bold">Berhasil Diadopsi</span>;
      default:
        return null;
    }
  };

  const getConditionBadge = (condition: string) => {
    switch (condition) {
      case 'critical':
        return <span className="px-2.5 py-1 rounded-xl bg-rose-100 text-rose-800 text-xs font-bold flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Butuh Bantuan Darurat</span>;
      case 'injured':
        return <span className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-800 text-xs font-bold">Terluka</span>;
      default:
        return <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">Sehat</span>;
    }
  };

  return (
    <Link
      to={`/reports/${report.id}`}
      className="group clay-card p-3 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
    >
      <div className="relative aspect-4/3 w-full rounded-2xl bg-slate-100 overflow-hidden shadow-inner">
        <img
          src={primaryImage}
          alt={report.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
          {getStatusBadge(report.status)}
        </div>
        <div className="absolute top-2.5 right-2.5">
          <span className="px-2.5 py-1 clay-badge bg-white/90 backdrop-blur text-slate-800 text-xs font-bold">
            {report.pet_type === 'cat' ? 'Kucing' : 'Anjing'}
          </span>
        </div>
      </div>

      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            {getConditionBadge(report.condition)}
            {report.is_masked && (
              <span className="px-2.5 py-1 rounded-xl bg-indigo-100 text-indigo-800 text-xs font-bold">
                Lokasi Shelter
              </span>
            )}
          </div>

          <h3 className="font-black text-slate-800 text-base line-clamp-1 group-hover:text-brand-700 transition">
            {report.title}
          </h3>

          <p className="text-slate-500 text-xs line-clamp-2 mt-1 leading-relaxed">
            {report.description || 'Laporan penemuan hewan jalanan yang membutuhkan adopter atau pertolongan.'}
          </p>

          {/* Latest P2P Check-in Info */}
          {report.latest_activity && (
            <div className="mt-2 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-100 text-[10px] text-amber-900 font-bold flex items-center gap-1.5 truncate">
              <span className="truncate">
                {report.latest_activity.activity_type === 'fed' ? 'Baru saja diberi makan' : 'Terpantau di lokasi'} oleh {report.latest_activity.user?.name || 'Warga'}
              </span>
            </div>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1 line-clamp-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-brand-700 shrink-0" />
            <span className="truncate">{report.address_note || 'Lokasi jalanan'}</span>
          </div>

          {report.distance_meters !== undefined && (
            <span className="font-black text-brand-700 shrink-0 ml-2">
              {formatDistance(report.distance_meters)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};
