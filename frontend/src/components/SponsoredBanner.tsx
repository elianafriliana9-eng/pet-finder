import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import type { Advertisement } from '../types';
import { ExternalLink, Sparkles, Megaphone, ArrowUpRight } from 'lucide-react';

interface SponsoredBannerProps {
  placement?: string;
  variant?: 'highlight' | 'standard' | 'compact';
  className?: string;
}

export const SponsoredBanner: React.FC<SponsoredBannerProps> = ({
  placement = 'explore_sidebar',
  variant = 'standard',
  className = '',
}) => {
  const { data: adsData } = useQuery({
    queryKey: ['ads', placement],
    queryFn: async () => {
      const res = await api.get('/ads', { params: { placement } });
      return res.data.data as Advertisement[];
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 mins
  });

  const ads = adsData || [];
  if (ads.length === 0) return null;

  const ad = ads[0]; // Pick current prominent sponsored partner

  const handleClick = () => {
    // Fire & forget tracking
    api.post(`/ads/${ad.id}/click`).catch(() => {});
  };

  // 1. HIGHLIGHT VARIANT (Below Hero Banner)
  if (variant === 'highlight') {
    return (
      <div
        className={`clay-card p-5 sm:p-6 bg-gradient-to-r from-amber-50/70 via-white to-brand-50/60 border-2 border-amber-200/80 rounded-3xl relative overflow-hidden group shadow-md ${className}`}
      >
        {/* Ambient Decorative Blurs */}
        <div aria-hidden className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-amber-200/30 blur-2xl pointer-events-none" />
        <div aria-hidden className="absolute -left-12 -bottom-12 w-40 h-40 rounded-full bg-brand-200/30 blur-2xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-center justify-between gap-5">
          {/* Banner Image */}
          <div className="w-full md:w-56 h-36 md:h-32 rounded-2xl overflow-hidden bg-slate-100 shrink-0 shadow-sm relative">
            <img
              src={ad.banner_url}
              alt={ad.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-xs text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-amber-400" />
              Sponsor Pilihan
            </div>
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0 text-left space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-950 text-[10px] font-black uppercase tracking-wider">
                {ad.brand_name}
              </span>
              <span className="text-[11px] text-brand-700 font-bold">• Mitra Resmi Komunitas Rescue</span>
            </div>

            <h3 className="font-display text-base sm:text-lg font-black text-slate-900 leading-snug">
              {ad.title}
            </h3>

            {ad.description && (
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
                {ad.description}
              </p>
            )}
          </div>

          {/* Action Button */}
          <div className="w-full md:w-auto shrink-0 flex items-center justify-end">
            <a
              href={ad.target_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClick}
              className="w-full md:w-auto px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black transition shadow-md hover:scale-105 flex items-center justify-center gap-2"
            >
              <span>{ad.cta_text || 'Lihat Program Partner'}</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 2. STANDARD VARIANT (Sidebar & Content Area)
  return (
    <div
      className={`clay-card p-4 bg-gradient-to-br from-white to-slate-50 border border-brand-200/70 overflow-hidden relative group ${className}`}
    >
      {/* Sponsor Label */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-950 text-[10px] font-black tracking-wider flex items-center gap-1 uppercase">
          <Sparkles className="w-3 h-3 text-amber-600" />
          Partner Peduli Anabul
        </span>
        <span className="text-[10px] text-slate-400 font-bold">{ad.brand_name}</span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="w-full sm:w-24 h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0">
          <img
            src={ad.banner_url}
            alt={ad.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        </div>

        <div className="flex-1 min-w-0 text-left">
          <h4 className="font-black text-xs sm:text-sm text-slate-900 leading-snug line-clamp-2">
            {ad.title}
          </h4>
          {ad.description && (
            <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
              {ad.description}
            </p>
          )}

          <a
            href={ad.target_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className="inline-flex items-center gap-1 mt-2.5 px-3 py-1.5 rounded-xl clay-btn-primary text-white text-[11px] font-black hover:scale-105 transition shadow-xs"
          >
            <span>{ad.cta_text || 'Kunjungi Partner'}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
