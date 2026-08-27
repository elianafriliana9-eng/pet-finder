import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import type { Report, ReportActivity } from '../types';
import { useAuth } from '../context/AuthContext';
import { AdoptionModal } from '../components/AdoptionModal';
import { ReportFlagModal } from '../components/ReportFlagModal';
import { CommunityCheckInModal } from '../components/CommunityCheckInModal';
import { ForwardToShelterModal } from '../components/ForwardToShelterModal';
import { SponsoredBanner } from '../components/SponsoredBanner';
import { useSEO } from '../hooks/useSEO';
import {
  MapPin, ShieldCheck, Heart, MessageSquare, Share2, ShieldAlert,
  Calendar, ArrowLeft, RefreshCw, Utensils, Eye, Stethoscope, Home,
  CheckCircle2, Clock, Building2, Send, Navigation, Compass, Check,
  Activity, Info
} from 'lucide-react';

export const ReportDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'timeline' | 'status' | 'shelter'>('timeline');
  const [showAdoptionModal, setShowAdoptionModal] = useState(false);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showForwardShelterModal, setShowForwardShelterModal] = useState(false);
  const [checkInInitialType, setCheckInInitialType] = useState<'fed' | 'secured'>('fed');
  const [copied, setCopied] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['report', id],
    queryFn: async () => {
      const res = await api.get(`/reports/${id}`);
      return res.data.report as Report;
    },
  });

  const report = data;
  const primaryImage =
    report?.images?.find((img) => img.is_primary)?.image_url ||
    report?.images?.[0]?.image_url ||
    'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800&auto=format&fit=crop&q=80';

  useSEO({
    title: report ? `${report.title} (${report.pet_type === 'cat' ? 'Kucing' : 'Anjing'})` : 'Detail Anabul',
    description: report
      ? `${report.description || 'Laporan anabul di ' + (report.address_note || 'jalanan')} - Status: ${report.status}.`
      : undefined,
    image: primaryImage,
    url: id ? `https://streetpet.org/reports/${id}` : undefined,
  });

  const claimMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/reports/${id}/claim`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report', id] });
      alert('Laporan berhasil Anda klaim dan dialihkan ke shelter Anda.');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Gagal klaim laporan.');
    },
  });

  const statusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const res = await api.patch(`/reports/${id}/status`, { status: newStatus });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report', id] });
    },
  });

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: report?.title,
        text: `Bantu rawat/rescue/adopsi: ${report?.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'fed':
        return <Utensils className="w-4 h-4 text-amber-600" />;
      case 'sighted':
        return <Eye className="w-4 h-4 text-blue-600" />;
      case 'treated':
        return <Stethoscope className="w-4 h-4 text-brand-700" />;
      case 'secured':
      case 'adopted':
        return <Home className="w-4 h-4 text-purple-600" />;
      default:
        return <MapPin className="w-4 h-4 text-slate-500" />;
    }
  };

  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'fed':
        return 'Memberi Makan (Street Feeding)';
      case 'sighted':
        return 'Mengecek Lokasi (Terpantau)';
      case 'treated':
        return 'Membantu Merawat / Mengobati';
      case 'secured':
        return 'Mengamankan Anabul ke Tempat Aman';
      case 'adopted':
        return 'Resmi Mengadopsi Anabul';
      default:
        return 'Update Informasi';
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 text-brand-500 animate-spin mb-2" />
        <p className="text-sm text-slate-500 font-medium">Memuat detail anabul...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 clay-card text-center">
        <h3 className="text-lg font-black text-slate-900">Laporan Tidak Ditemukan</h3>
        <p className="text-xs text-slate-500 mt-1 mb-6 font-medium">
          Postingan mungkin telah dihapus atau disembunyikan oleh sistem moderasi.
        </p>
        <Link to="/explore" className="px-5 py-2.5 clay-btn-primary text-white text-xs font-black">
          Kembali ke Jelajah
        </Link>
      </div>
    );
  }

  const isShelterPet = !!report.managed_by_shelter_id || report.user?.role === 'shelter' || !!report.managed_by_shelter;
  const canClaim = user && user.role === 'shelter' && user.shelter_profile?.is_verified && report.managed_by_shelter_id !== user.shelter_profile.id;
  const images = report.images?.length > 0
    ? report.images.map((img) => img.image_url)
    : ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop&q=80'];

  const activities: ReportActivity[] = report.activities || [];

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 md:py-6 pb-32 md:pb-12 space-y-4 sm:space-y-6">
      {/* Top Bar: Navigation & Quick Share */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 clay-btn-secondary text-xs font-bold text-slate-700 transition hover:scale-105"
        >
          <ArrowLeft className="w-4 h-4 text-brand-700" />
          <span>Kembali</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 clay-btn-secondary text-xs font-bold text-slate-700 hover:text-brand-700 transition"
            title="Bagikan Tautan Anabul"
          >
            <Share2 className="w-3.5 h-3.5 text-brand-600" />
            <span>{copied ? 'Tersalin!' : 'Bagikan'}</span>
          </button>

          <button
            onClick={() => {
              if (!user) navigate('/login', { state: { from: `/reports/${report.id}` } });
              else setShowFlagModal(true);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-slate-400 hover:text-rose-600 text-xs font-semibold rounded-xl hover:bg-rose-50 transition"
            title="Laporkan Konten"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN TWO-COLUMN COMPACT HERO CARD                                         */}
      {/* ========================================================================= */}
      <div className="clay-card overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0 border border-slate-200 shadow-xl rounded-3xl">
        
        {/* Left Column: Visual Gallery & Location Mini-Card (lg:col-span-5) */}
        <div className="lg:col-span-5 p-4 sm:p-5 bg-slate-50/70 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col justify-between gap-3.5">
          <div>
            {/* Primary Image with Badges */}
            <div className="relative aspect-4/3 sm:aspect-square w-full rounded-2xl overflow-hidden shadow-md bg-slate-200">
              <img
                src={images[activeImageIndex]}
                alt={report.title}
                className="w-full h-full object-cover"
              />

              {/* Floating Image Badges */}
              <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                <span className="px-2.5 py-0.5 rounded-lg bg-black/65 backdrop-blur-md text-white text-[11px] font-black uppercase">
                  {report.pet_type === 'cat' ? 'Kucing' : 'Anjing'}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-black/65 backdrop-blur-md text-white text-[11px] font-black capitalize">
                  {report.condition === 'critical' ? 'Darurat / Kritis' : report.condition === 'injured' ? 'Terluka' : 'Sehat'}
                </span>
              </div>

              {report.is_masked && (
                <span className="absolute bottom-2.5 left-2.5 right-2.5 px-2.5 py-1 rounded-xl bg-slate-950/80 backdrop-blur text-white text-[10px] font-bold flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                  <span>Radius Shelter Resmi (Privasi Terjaga)</span>
                </span>
              )}
            </div>

            {/* Thumbnail Carousel */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto mt-2.5 pb-1">
                {images.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 transition border-2 ${
                      activeImageIndex === i ? 'border-brand-500 scale-95 shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt="Thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Location & Mini Map Jump Link */}
          <div className="p-3 bg-white border border-slate-200/80 rounded-2xl flex items-center justify-between gap-2.5 shadow-2xs">
            <div className="flex items-start gap-2 min-w-0 text-left">
              <MapPin className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-xs font-black text-slate-800 truncate">
                  {report.address_note || 'Lokasi Jalanan'}
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                </p>
              </div>
            </div>

            <Link
              to={`/explore?focus=${report.id}`}
              className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-black shrink-0 flex items-center gap-1 transition"
            >
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              <span>Buka di Peta</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Information, Rescue Pipeline & Smart Action Grid (lg:col-span-7) */}
        <div className="lg:col-span-7 p-4 sm:p-6 lg:p-7 flex flex-col justify-between gap-4 text-left bg-white">
          <div>
            {/* Top Metadata Tags */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="px-2.5 py-0.5 rounded-md bg-brand-100 text-brand-900 text-xs font-black capitalize">
                  {report.pet_type === 'cat' ? 'Kucing' : 'Anjing'}
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-bold">
                  {report.age_group === 'kitten_puppy' ? 'Anak' : report.age_group === 'senior' ? 'Senior' : 'Dewasa'}
                </span>
                {isShelterPet ? (
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-900 text-[11px] font-black flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-indigo-700" /> Shelter Resmi
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[11px] font-bold">
                    Hewan Jalanan
                  </span>
                )}
              </div>

              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(report.created_at).toLocaleDateString('id-ID')}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 leading-snug tracking-tight">
              {report.title}
            </h1>

            {/* Compact Pipeline Status Stepper */}
            <div className="my-3 p-2.5 bg-slate-50 border border-slate-200/70 rounded-2xl">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1.5 px-1">
                <span className="uppercase font-black text-slate-600">Status Penyelamatan:</span>
                <span className="text-brand-700 font-extrabold capitalize">
                  {report.status === 'available'
                    ? isShelterPet ? 'Siap Adopsi' : 'Di Lokasi Jalanan'
                    : report.status === 'screening'
                    ? 'Proses Skrining'
                    : report.status === 'rescued'
                    ? 'Sudah Diamankan'
                    : 'Resmi Diadopsi'}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1 text-center">
                {[
                  { key: 'available', label: isShelterPet ? 'Siap Adopsi' : 'Di Lokasi' },
                  { key: 'screening', label: 'Skrining' },
                  { key: 'rescued', label: 'Diamankan' },
                  { key: 'adopted', label: 'Diadopsi' },
                ].map((st) => {
                  const active = report.status === st.key;
                  return (
                    <div
                      key={st.key}
                      className={`py-1 rounded-lg text-[10px] font-black transition ${
                        active
                          ? 'bg-brand-500 text-white shadow-xs'
                          : 'bg-slate-200/50 text-slate-400'
                      }`}
                    >
                      {st.label}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Description Note */}
            <div className="p-3 bg-slate-50/60 rounded-2xl border border-slate-100 text-xs text-slate-600 font-medium leading-relaxed">
              <span className="font-black text-slate-800 block text-[11px] uppercase tracking-wider mb-1">
                Keterangan & Kondisi:
              </span>
              <p className="whitespace-pre-line">
                {report.description || 'Tidak ada catatan tambahan untuk laporan ini.'}
              </p>
            </div>
          </div>

          {/* =============================================================== */}
          {/* SMART ACTION HUB (INTEGRATED & COMPACT)                           */}
          {/* =============================================================== */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            
            {/* 1. Primary Action: Rescue (Street) vs Formal Adopt (Shelter) */}
            {report.status !== 'adopted' ? (
              isShelterPet ? (
                <button
                  onClick={() => {
                    if (!user) navigate('/login', { state: { from: `/reports/${report.id}` } });
                    else setShowAdoptionModal(true);
                  }}
                  className="w-full py-3 px-4 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-black text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-md shadow-brand-500/25 active:scale-98"
                >
                  <Heart className="w-4 h-4 fill-current" />
                  <span>Ajukan Skrining Adopsi Resmi Shelter</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (!user) navigate('/login', { state: { from: `/reports/${report.id}` } });
                    else {
                      setCheckInInitialType('secured');
                      setShowCheckInModal(true);
                    }
                  }}
                  className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 active:scale-98"
                >
                  <Home className="w-4 h-4" />
                  <span>Saya Mau Rescue / Amankan Anabul Ini</span>
                </button>
              )
            ) : (
              <div className="p-2.5 rounded-xl bg-purple-100 text-purple-900 text-center font-black text-xs">
                Anabul ini telah resmi diadopsi / diselamatkan!
              </div>
            )}

            {/* 2. Secondary Supporting Actions (Grid 3 Columns) */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {/* Street Feeding Button */}
              {!isShelterPet && report.status !== 'adopted' && (
                <button
                  onClick={() => {
                    if (!user) navigate('/login', { state: { from: `/reports/${report.id}` } });
                    else {
                      setCheckInInitialType('fed');
                      setShowCheckInModal(true);
                    }
                  }}
                  className="py-2.5 px-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-black text-[11px] flex items-center justify-center gap-1 transition shadow-2xs"
                  title="Catat Pemberian Pakan"
                >
                  <Utensils className="w-3.5 h-3.5 text-amber-600" />
                  <span className="truncate">Street Feed</span>
                </button>
              )}

              {/* Chat Reporter / Shelter Button */}
              <Link
                to={`/messages?user=${report.user_id}&report=${report.id}`}
                className="py-2.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-black text-[11px] flex items-center justify-center gap-1 transition shadow-2xs"
                title="Kirim Pesan Langsung"
              >
                <MessageSquare className="w-3.5 h-3.5 text-brand-600" />
                <span className="truncate">Kirim Chat</span>
              </Link>

              {/* Forward to Shelter Button */}
              {!isShelterPet ? (
                <button
                  onClick={() => {
                    if (!user) navigate('/login', { state: { from: `/reports/${report.id}` } });
                    else setShowForwardShelterModal(true);
                  }}
                  className="py-2.5 px-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 font-black text-[11px] flex items-center justify-center gap-1 transition shadow-2xs"
                  title="Teruskan ke Shelter Terdekat"
                >
                  <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="truncate">Ke Shelter</span>
                </button>
              ) : (
                <Link
                  to={`/shelters/${report.managed_by_shelter_id || report.user_id}`}
                  className="py-2.5 px-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 font-black text-[11px] flex items-center justify-center gap-1 transition shadow-2xs"
                >
                  <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="truncate">Profil Shelter</span>
                </Link>
              )}
            </div>

            {/* Claim Shelter Action if Applicable */}
            {canClaim && (
              <button
                onClick={() => claimMutation.mutate()}
                disabled={claimMutation.isPending}
                className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{claimMutation.isPending ? 'Memproses...' : 'Klaim / Tampung ke Shelter Anda'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TABBED SECTIONS (TIMELINE / UPDATE STATUS / SHELTER INFO)                 */}
      {/* ========================================================================= */}
      <div className="clay-card p-4 sm:p-6 border border-slate-200 shadow-lg rounded-3xl">
        {/* Tab Headers */}
        <div className="flex items-center gap-1.5 border-b border-slate-200 pb-3 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'timeline'
                ? 'bg-brand-500 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Linimasa Warga ({activities.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('status')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'status'
                ? 'bg-brand-500 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Update Status Penyelamatan</span>
          </button>

          {isShelterPet && (
            <button
              onClick={() => setActiveTab('shelter')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 shrink-0 ${
                activeTab === 'shelter'
                  ? 'bg-brand-500 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Info Shelter Resmi</span>
            </button>
          )}
        </div>

        {/* Tab 1: Timeline & Street-Feeding Logs */}
        {activeTab === 'timeline' && (
          <div className="pt-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-slate-500 font-medium">
                Catatan warga sekitar yang telah memberi makan atau memantau kondisi anabul ini.
              </p>
              <button
                onClick={() => {
                  if (!user) navigate('/login', { state: { from: `/reports/${report.id}` } });
                  else setShowCheckInModal(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shrink-0 flex items-center gap-1 shadow-2xs"
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>Tambah Check-In</span>
              </button>
            </div>

            {activities.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs text-slate-400 font-medium">
                  Belum ada catatan check-in warga. Jadilah yang pertama memberi makan atau mengecek kondisi anabul di lokasi!
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {activities.map((act) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100 flex flex-col sm:flex-row items-start justify-between gap-2 text-left"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-2xs">
                        {getActivityIcon(act.activity_type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-xs text-slate-900">
                            {act.user?.name || 'Penyayang Hewan'}
                          </span>
                          <span className="px-2 py-0.2 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-700">
                            {getActivityLabel(act.activity_type)}
                          </span>
                        </div>
                        {act.notes && (
                          <p className="text-xs text-slate-600 font-medium mt-0.5">
                            "{act.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {act.photo_url && (
                        <img
                          src={act.photo_url}
                          alt="Bukti"
                          className="w-9 h-9 rounded-lg object-cover bg-white"
                        />
                      )}
                      <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(act.created_at).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Status Update Controls */}
        {activeTab === 'status' && (
          <div className="pt-4 text-left space-y-3">
            <p className="text-xs text-slate-500 font-medium">
              Bantu perbarui status terbaru penyelamatan jika anabul sudah diamankan, sedang skrining, atau telah resmi diadopsi warga.
            </p>

            {user ? (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="font-black text-xs text-slate-800 block mb-2.5">
                  Pilih Status Penyelamatan Terkini:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['available', 'screening', 'rescued', 'adopted'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => statusMutation.mutate(s)}
                      disabled={statusMutation.isPending}
                      className={`py-2 px-2.5 rounded-xl text-xs font-black capitalize transition flex items-center justify-center gap-1.5 ${
                        report.status === s
                          ? 'bg-brand-500 text-white shadow-sm'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {report.status === s && <Check className="w-3.5 h-3.5" />}
                      <span>{s === 'available' ? 'Di Lokasi' : s === 'screening' ? 'Skrining' : s === 'rescued' ? 'Diamankan' : 'Diadopsi'}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
                <p className="text-xs text-slate-600 font-bold">
                  Silakan masuk ke akun Anda untuk memperbarui status penyelamatan.
                </p>
                <button
                  onClick={() => navigate('/login', { state: { from: `/reports/${report.id}` } })}
                  className="px-4 py-2 rounded-xl clay-btn-primary text-white font-black text-xs shadow-xs"
                >
                  Masuk ke Akun
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Shelter Info */}
        {activeTab === 'shelter' && isShelterPet && (
          <div className="pt-4 text-left space-y-2.5">
            <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-black text-sm text-indigo-950">
                  {report.managed_by_shelter?.shelter_name || report.user?.name || 'Shelter Terverifikasi'}
                </h4>
                <p className="text-xs text-indigo-700 font-medium mt-0.5">
                  Anabul ini berada dalam pengawasan dan program perawatan shelter resmi.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <Link
                    to={`/shelters/${report.managed_by_shelter_id || report.user_id}`}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-black shadow-xs hover:bg-indigo-700 transition"
                  >
                    Kunjungi Shelter
                  </Link>
                  <Link
                    to={`/messages?user=${report.user_id}&report=${report.id}`}
                    className="px-3 py-1.5 rounded-xl bg-white border border-indigo-200 text-indigo-900 text-xs font-bold hover:bg-indigo-50 transition"
                  >
                    Hubungi Pengurus
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sponsored Partner Banner */}
      <SponsoredBanner placement="report_detail" className="mt-4" />

      {/* ========================================================================= */}
      {/* MOBILE STICKY BOTTOM ACTION BAR                                           */}
      {/* ========================================================================= */}
      <div className="md:hidden fixed bottom-16 left-3 right-3 z-30 animate-in slide-in-from-bottom-3 duration-200">
        <div className="clay-card p-2.5 bg-white/95 backdrop-blur-md border border-brand-200 shadow-2xl rounded-2xl flex items-center gap-2">
          {report.status !== 'adopted' ? (
            isShelterPet ? (
              <button
                onClick={() => {
                  if (!user) navigate('/login', { state: { from: `/reports/${report.id}` } });
                  else setShowAdoptionModal(true);
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-brand-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span>Ajukan Adopsi</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  if (!user) navigate('/login', { state: { from: `/reports/${report.id}` } });
                  else {
                    setCheckInInitialType('secured');
                    setShowCheckInModal(true);
                  }
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Rescue Anabul</span>
              </button>
            )
          ) : (
            <div className="flex-1 py-2 rounded-xl bg-purple-100 text-purple-900 text-center font-black text-xs">
              Diadopsi
            </div>
          )}

          <Link
            to={`/messages?user=${report.user_id}&report=${report.id}`}
            className="p-2.5 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 shrink-0"
            title="Chat"
          >
            <MessageSquare className="w-4 h-4 text-brand-600" />
          </Link>

          {!isShelterPet && (
            <button
              onClick={() => {
                if (!user) navigate('/login', { state: { from: `/reports/${report.id}` } });
                else {
                  setCheckInInitialType('fed');
                  setShowCheckInModal(true);
                }
              }}
              className="p-2.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 shrink-0"
              title="Street Feeding"
            >
              <Utensils className="w-4 h-4 text-amber-600" />
            </button>
          )}
        </div>
      </div>

      {/* Modals */}
      <CommunityCheckInModal
        reportId={report.id}
        isOpen={showCheckInModal}
        initialActivityType={checkInInitialType}
        onClose={() => setShowCheckInModal(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['report', id] });
        }}
      />

      <AdoptionModal
        report={report}
        isOpen={showAdoptionModal}
        onClose={() => setShowAdoptionModal(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['report', id] });
          alert('Pengajuan skrining adopsi Anda berhasil dikirimkan!');
        }}
      />

      <ForwardToShelterModal
        report={report}
        isOpen={showForwardShelterModal}
        onClose={() => setShowForwardShelterModal(false)}
      />

      <ReportFlagModal
        reportId={report.id}
        isOpen={showFlagModal}
        onClose={() => setShowFlagModal(false)}
        onSuccess={() => {
          alert('Terima kasih. Laporan pelanggaran Anda telah kami terima untuk peninjauan admin.');
        }}
      />
    </div>
  );
};
