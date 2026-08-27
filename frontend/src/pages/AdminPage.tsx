import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../api/client';
import type { ShelterProfile, Report, User, Advertisement } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  ShieldAlert,
  Check,
  X,
  Eye,
  EyeOff,
  Building2,
  AlertTriangle,
  RefreshCw,
  Users,
  Heart,
  FileText,
  Trash2,
  Search,
  Filter,
  ExternalLink,
  MapPin,
  CheckCircle2,
  Ban,
  Lock,
  UserCheck,
  Activity,
  Megaphone,
  PlusCircle,
  MousePointerClick,
  Sparkles
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<'overview' | 'shelters' | 'flags' | 'reports' | 'users' | 'ads'>('overview');

  // Filter & Search States for Reports Tab
  const [reportSearch, setReportSearch] = useState('');
  const [reportStatusFilter, setReportStatusFilter] = useState('all');
  const [reportTypeFilter, setReportTypeFilter] = useState('all');

  // Filter & Search States for Users Tab
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  // Advertisement Form States
  const [showAddAdModal, setShowAddAdModal] = useState(false);
  const [adBrandName, setAdBrandName] = useState('');
  const [adTitle, setAdTitle] = useState('');
  const [adDescription, setAdDescription] = useState('');
  const [adBannerUrl, setAdBannerUrl] = useState('');
  const [adTargetUrl, setAdTargetUrl] = useState('');
  const [adPlacement, setAdPlacement] = useState<'explore_sidebar' | 'report_detail' | 'landing_sponsor'>('explore_sidebar');
  const [adCtaText, setAdCtaText] = useState('Kunjungi Partner');
  const [adFormError, setAdFormError] = useState('');

  // 1. Fetch System-wide Analytics Stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await api.get('/admin/stats');
      return res.data.data;
    },
    enabled: user?.role === 'admin',
  });

  // 2. Fetch Pending & All Shelters
  const { data: shelterData, isLoading: shelterLoading } = useQuery({
    queryKey: ['admin-shelters'],
    queryFn: async () => {
      const res = await api.get('/admin/shelters/pending');
      return res.data.data;
    },
    enabled: user?.role === 'admin' && (tab === 'shelters' || tab === 'overview'),
  });

  // 3. Fetch Flagged Reports
  const { data: flagData, isLoading: flagLoading } = useQuery({
    queryKey: ['admin-flags'],
    queryFn: async () => {
      const res = await api.get('/admin/reports/flagged');
      return res.data.data;
    },
    enabled: user?.role === 'admin' && (tab === 'flags' || tab === 'overview'),
  });

  // 4. Fetch All Reports with Filters
  const { data: allReportsData, isLoading: reportsLoading } = useQuery({
    queryKey: ['admin-all-reports', reportSearch, reportStatusFilter, reportTypeFilter],
    queryFn: async () => {
      const res = await api.get('/admin/reports', {
        params: {
          q: reportSearch || undefined,
          status: reportStatusFilter !== 'all' ? reportStatusFilter : undefined,
          type: reportTypeFilter !== 'all' ? reportTypeFilter : undefined,
        },
      });
      return res.data.data;
    },
    enabled: user?.role === 'admin' && tab === 'reports',
  });

  // 5. Fetch All Users
  const { data: allUsersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-all-users', userSearch, userRoleFilter],
    queryFn: async () => {
      const res = await api.get('/admin/users', {
        params: {
          q: userSearch || undefined,
          role: userRoleFilter !== 'all' ? userRoleFilter : undefined,
        },
      });
      return res.data.data;
    },
    enabled: user?.role === 'admin' && tab === 'users',
  });

  // 6. Fetch Advertisements
  const { data: allAdsData, isLoading: adsLoading } = useQuery({
    queryKey: ['admin-all-ads'],
    queryFn: async () => {
      const res = await api.get('/admin/ads');
      return res.data.data;
    },
    enabled: user?.role === 'admin' && tab === 'ads',
  });

  // MUTATIONS
  const createAdMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/admin/ads', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-ads'] });
      setShowAddAdModal(false);
      setAdBrandName('');
      setAdTitle('');
      setAdDescription('');
      setAdBannerUrl('');
      setAdTargetUrl('');
      alert('Iklan kampanye brand berhasil dipasang!');
    },
    onError: (err: any) => {
      setAdFormError(err.response?.data?.message || 'Gagal menyimpan iklan');
    },
  });

  const toggleAdMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: number; is_active: boolean }) => {
      const res = await api.patch(`/admin/ads/${id}`, { is_active });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-ads'] });
    },
  });

  const deleteAdMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/admin/ads/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-ads'] });
      alert('Iklan brand berhasil dihapus.');
    },
  });

  // MUTATIONS
  const verifyMutation = useMutation({
    mutationFn: async ({ id, is_verified }: { id: number; is_verified: boolean }) => {
      const res = await api.post(`/admin/shelters/${id}/verify`, { is_verified });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shelters'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      alert('Status verifikasi shelter berhasil diperbarui!');
    },
  });

  const moderateMutation = useMutation({
    mutationFn: async ({ id, is_hidden }: { id: number; is_hidden: boolean }) => {
      const res = await api.patch(`/admin/reports/${id}/moderate`, { is_hidden });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-flags'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-reports'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });

  const deleteReportMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/admin/reports/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-flags'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-reports'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      alert('Laporan anabul berhasil dihapus permanen.');
    },
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: number; role: string }) => {
      const res = await api.patch(`/admin/users/${id}/role`, { role });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      alert('Role pengguna berhasil diperbarui!');
    },
  });

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto my-16 p-8 clay-card text-center space-y-3">
        <div className="w-14 h-14 rounded-3xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto shadow-sm">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-slate-900">Akses Terbatas Administrator</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Halaman ini khusus untuk Administrator internal StreetPet. Silakan masuk menggunakan akun admin berwenang.
        </p>
        <Link to="/login" className="inline-block mt-2 px-6 py-2.5 clay-btn-primary text-white font-black text-xs">
          Masuk Akun Admin
        </Link>
      </div>
    );
  }

  const stats = statsData || {};
  const shelters: ShelterProfile[] = shelterData?.data || [];
  const flaggedReports: Report[] = flagData?.data || [];
  const allReports: Report[] = allReportsData?.data || [];
  const allUsers: User[] = allUsersData?.data || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-12 space-y-6">
      {/* Header Banner */}
      <div className="clay-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-3xl clay-card-brand bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider">
                System Control Center
              </span>
              <span className="text-xs text-slate-400 font-bold">• Pet Finder Network v2.0</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Admin System Panel & Moderasi
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Kelola verifikasi shelter, moderasi kebijakan anti jual-beli, data laporan anabul, dan hak akses pengguna.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
              queryClient.invalidateQueries({ queryKey: ['admin-shelters'] });
              queryClient.invalidateQueries({ queryKey: ['admin-flags'] });
              queryClient.invalidateQueries({ queryKey: ['admin-all-reports'] });
              queryClient.invalidateQueries({ queryKey: ['admin-all-users'] });
            }}
            className="px-3.5 py-2 rounded-xl clay-btn-secondary text-slate-700 text-xs font-bold flex items-center gap-1.5 hover:text-brand-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Segarkan Data</span>
          </button>
        </div>
      </div>

      {/* System Scoreboard */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="clay-card p-4 text-center">
          <span className="text-[11px] font-bold text-slate-500 block">Total Pengguna</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {statsLoading ? '...' : stats.total_users || 0}
          </span>
        </div>
        <div className="clay-card p-4 text-center border-b-2 border-b-brand-500">
          <span className="text-[11px] font-bold text-brand-700 block">Total Shelter</span>
          <span className="text-2xl font-black text-brand-700 mt-1 block">
            {statsLoading ? '...' : stats.total_shelters || 0}
          </span>
        </div>
        <div className="clay-card p-4 text-center border-b-2 border-b-emerald-500">
          <span className="text-[11px] font-bold text-emerald-700 block">Shelter Verified</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">
            {statsLoading ? '...' : stats.verified_shelters || 0}
          </span>
        </div>
        <div className="clay-card p-4 text-center border-b-2 border-b-blue-500">
          <span className="text-[11px] font-bold text-blue-700 block">Laporan Anabul</span>
          <span className="text-2xl font-black text-blue-700 mt-1 block">
            {statsLoading ? '...' : stats.total_reports || 0}
          </span>
        </div>
        <div className="clay-card p-4 text-center border-b-2 border-b-purple-500">
          <span className="text-[11px] font-bold text-purple-700 block">Terselamatkan</span>
          <span className="text-2xl font-black text-purple-700 mt-1 block">
            {statsLoading ? '...' : stats.rescued_count || 0}
          </span>
        </div>
        <div className="clay-card p-4 text-center border-b-2 border-b-rose-500 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold text-rose-700 block">Flag Pelanggaran</span>
          <span className="text-2xl font-black text-rose-700 mt-1 block">
            {statsLoading ? '...' : stats.flagged_count || 0}
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setTab('overview')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
            tab === 'overview'
              ? 'clay-btn-primary text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Ringkasan & Aksi Cepat</span>
        </button>

        <button
          onClick={() => setTab('shelters')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
            tab === 'shelters'
              ? 'clay-btn-primary text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Verifikasi Shelter ({stats.pending_shelters || 0} Menunggu)</span>
          {stats.pending_shelters > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          )}
        </button>

        <button
          onClick={() => setTab('flags')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
            tab === 'flags'
              ? 'clay-btn-primary text-white bg-rose-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Moderasi Pelanggaran ({flaggedReports.length})</span>
          {flaggedReports.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          )}
        </button>

        <button
          onClick={() => setTab('reports')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
            tab === 'reports'
              ? 'clay-btn-primary text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Semua Laporan Anabul</span>
        </button>

        <button
          onClick={() => setTab('users')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
            tab === 'users'
              ? 'clay-btn-primary text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Kelola Pengguna</span>
        </button>

        <button
          onClick={() => setTab('ads')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
            tab === 'ads'
              ? 'clay-btn-primary text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Iklan & Sponsor Brand</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & QUICK ACTIONS */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Urgent Shelter Verifications */}
          <div className="clay-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-brand-700" />
                <span>Pengajuan Verifikasi Shelter Terbaru</span>
              </h3>
              <button
                onClick={() => setTab('shelters')}
                className="text-xs font-bold text-brand-700 hover:underline"
              >
                Lihat Semua ({shelters.length})
              </button>
            </div>

            {shelterLoading ? (
              <p className="text-xs text-slate-400 py-4 text-center">Memuat shelter...</p>
            ) : shelters.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Tidak ada permohonan shelter.</p>
            ) : (
              <div className="space-y-3">
                {shelters.slice(0, 3).map((sh) => (
                  <div key={sh.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-xs text-slate-900">{sh.shelter_name}</h4>
                        {sh.is_verified ? (
                          <span className="px-2 py-0.5 rounded-full bg-brand-100 text-brand-900 text-[10px] font-black">
                            Verified
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                            Menunggu Review
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{sh.address}</p>
                    </div>
                    {!sh.is_verified && (
                      <button
                        onClick={() => verifyMutation.mutate({ id: sh.id, is_verified: true })}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shrink-0 shadow-xs"
                      >
                        Setujui
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Urgent Content Moderation */}
          <div className="clay-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Postingan Dilaporkan Warga (Zero Commercial)</span>
              </h3>
              <button
                onClick={() => setTab('flags')}
                className="text-xs font-bold text-rose-700 hover:underline"
              >
                Lihat Semua ({flaggedReports.length})
              </button>
            </div>

            {flagLoading ? (
              <p className="text-xs text-slate-400 py-4 text-center">Memuat laporan...</p>
            ) : flaggedReports.length === 0 ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center text-emerald-800 text-xs font-bold">
                ✓ Sistem Bersih! Tidak ada indikasi pelanggaran atau komersialisasi hewan.
              </div>
            ) : (
              <div className="space-y-3">
                {flaggedReports.slice(0, 3).map((r) => (
                  <div key={r.id} className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-black">
                          {r.report_flags_count}x Flags
                        </span>
                        <h4 className="font-black text-xs text-slate-900 truncate">{r.title}</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">Pembuat: {r.user?.name}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => moderateMutation.mutate({ id: r.id, is_hidden: !r.is_hidden })}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-bold"
                      >
                        {r.is_hidden ? 'Buka' : 'Hide'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SHELTERS VERIFICATION */}
      {tab === 'shelters' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base text-slate-900">
              Daftar Permohonan & Profil Shelter ({shelters.length})
            </h3>
          </div>

          {shelterLoading ? (
            <div className="p-8 text-center text-xs text-slate-400">Memuat data shelter...</div>
          ) : shelters.length === 0 ? (
            <div className="p-8 clay-card text-center text-xs text-slate-400 font-medium">
              Belum ada shelter yang mendaftar.
            </div>
          ) : (
            <div className="space-y-3">
              {shelters.map((shelter) => (
                <div
                  key={shelter.id}
                  className="clay-card p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        shelter.is_verified ? 'bg-brand-100 text-brand-900' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {shelter.is_verified ? 'Verified Shelter' : 'Menunggu Review Admin'}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        Akun: <strong className="text-slate-700">{shelter.user?.name}</strong> ({shelter.user?.email})
                      </span>
                    </div>

                    <h4 className="font-black text-base text-slate-900">{shelter.shelter_name}</h4>
                    <p className="text-xs text-slate-600 font-medium">Alamat: {shelter.address}</p>

                    {shelter.description && (
                      <p className="text-xs text-slate-500 italic">"{shelter.description}"</p>
                    )}

                    {shelter.donation_link && (
                      <p className="text-xs text-brand-700 font-bold flex items-center gap-1">
                        <span>Donasi:</span>
                        <a href={shelter.donation_link} target="_blank" rel="noreferrer" className="underline truncate max-w-sm">
                          {shelter.donation_link}
                        </a>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      to={`/shelters/${shelter.id}`}
                      className="px-3.5 py-2.5 rounded-xl clay-btn-secondary text-slate-700 font-bold text-xs flex items-center gap-1 hover:text-brand-700"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Lihat Profil</span>
                    </Link>

                    {!shelter.is_verified ? (
                      <button
                        onClick={() => verifyMutation.mutate({ id: shelter.id, is_verified: true })}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 shadow-sm transition"
                      >
                        <Check className="w-4 h-4" />
                        <span>Verifikasi & Beri Badge</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => verifyMutation.mutate({ id: shelter.id, is_verified: false })}
                        className="px-4 py-2.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs flex items-center gap-1.5 transition"
                      >
                        <X className="w-4 h-4" />
                        <span>Cabut Verifikasi</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: FLAGS & COMMUNITY MODERATION */}
      {tab === 'flags' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base text-slate-900">
              Postingan dengan Indikasi Pelanggaran ({flaggedReports.length})
            </h3>
          </div>

          {flagLoading ? (
            <div className="p-8 text-center text-xs text-slate-400">Memuat laporan pelanggaran...</div>
          ) : flaggedReports.length === 0 ? (
            <div className="p-8 clay-card text-center text-xs text-slate-400 font-medium">
              Belum ada postingan yang dilaporkan oleh warga.
            </div>
          ) : (
            <div className="space-y-3">
              {flaggedReports.map((r) => (
                <div
                  key={r.id}
                  className="clay-card p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black">
                        {r.report_flags_count} Laporan Pelanggaran
                      </span>
                      {r.is_hidden && (
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-white text-[10px] font-black">
                          Postingan Tersembunyi (Hidden)
                        </span>
                      )}
                      <span className="text-xs text-slate-400 font-medium">
                        Pembuat: <strong className="text-slate-700">{r.user?.name}</strong> ({r.user?.email})
                      </span>
                    </div>

                    <h4 className="font-black text-base text-slate-900">{r.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{r.description}</p>
                    <p className="text-[11px] text-slate-500 font-medium">Lokasi: {r.address_note || 'Jalanan'}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      to={`/reports/${r.id}`}
                      className="px-3.5 py-2.5 rounded-xl clay-btn-secondary text-slate-700 font-bold text-xs flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Cek Post</span>
                    </Link>

                    <button
                      onClick={() => moderateMutation.mutate({ id: r.id, is_hidden: !r.is_hidden })}
                      className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition ${
                        r.is_hidden
                          ? 'clay-btn-primary text-white'
                          : 'bg-slate-800 hover:bg-slate-900 text-white'
                      }`}
                    >
                      {r.is_hidden ? (
                        <>
                          <Eye className="w-4 h-4" /> Buka Kembali
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-4 h-4" /> Sembunyikan
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Hapus permanen laporan "${r.title}"?`)) {
                          deleteReportMutation.mutate(r.id);
                        }
                      }}
                      className="p-2.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 transition"
                      title="Hapus Permanen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ALL REPORTS MANAGER */}
      {tab === 'reports' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <h3 className="font-black text-base text-slate-900">
              Kelola Seluruh Laporan Anabul ({allReports.length})
            </h3>

            {/* Search & Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Cari judul / lokasi..."
                  value={reportSearch}
                  onChange={(e) => setReportSearch(e.target.value)}
                  className="pl-8 pr-3 py-2 clay-input text-xs font-medium w-48 sm:w-60"
                />
              </div>

              <select
                value={reportTypeFilter}
                onChange={(e) => setReportTypeFilter(e.target.value)}
                className="px-3 py-2 clay-input text-xs font-bold text-slate-700"
              >
                <option value="all">Semua Tipe</option>
                <option value="street">Hewan Jalanan</option>
                <option value="shelter">Asuhan Shelter</option>
              </select>

              <select
                value={reportStatusFilter}
                onChange={(e) => setReportStatusFilter(e.target.value)}
                className="px-3 py-2 clay-input text-xs font-bold text-slate-700"
              >
                <option value="all">Semua Status</option>
                <option value="available">Tersedia / Di Lokasi</option>
                <option value="screening">Skrining</option>
                <option value="rescued">Diamankan</option>
                <option value="adopted">Diadopsi</option>
              </select>
            </div>
          </div>

          {reportsLoading ? (
            <div className="p-8 text-center text-xs text-slate-400">Memuat laporan...</div>
          ) : allReports.length === 0 ? (
            <div className="p-8 clay-card text-center text-xs text-slate-400 font-medium">
              Tidak ada laporan anabul yang cocok dengan filter pencarian.
            </div>
          ) : (
            <div className="space-y-3">
              {allReports.map((r) => (
                <div
                  key={r.id}
                  className="clay-card p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-brand-100 text-brand-900 text-[10px] font-black uppercase">
                        {r.pet_type === 'cat' ? 'Kucing' : 'Anjing'}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                        Status: {r.status}
                      </span>
                      {r.managed_by_shelter_id ? (
                        <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-900 text-[10px] font-black">
                          Shelter: {r.managed_by_shelter?.shelter_name || 'Resmi'}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold">
                          Jalanan
                        </span>
                      )}
                      {r.is_hidden && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-black">
                          Hidden
                        </span>
                      )}
                    </div>

                    <h4 className="font-black text-sm text-slate-900">{r.title}</h4>
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                      <span>{r.address_note || 'Lokasi jalanan'}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      to={`/reports/${r.id}`}
                      className="px-3 py-2 rounded-xl clay-btn-secondary text-slate-700 font-bold text-xs flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Lihat</span>
                    </Link>

                    <button
                      onClick={() => moderateMutation.mutate({ id: r.id, is_hidden: !r.is_hidden })}
                      className={`px-3 py-2 rounded-xl font-bold text-xs transition ${
                        r.is_hidden ? 'bg-brand-500 text-white' : 'bg-slate-800 text-white'
                      }`}
                    >
                      {r.is_hidden ? 'Buka' : 'Hide'}
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Hapus permanen laporan "${r.title}"?`)) {
                          deleteReportMutation.mutate(r.id);
                        }
                      }}
                      className="p-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 transition"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: USER ACCOUNTS & ROLES */}
      {tab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <h3 className="font-black text-base text-slate-900">
              Daftar Pengguna Terdaftar ({allUsers.length})
            </h3>

            {/* Search & Filter */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Cari nama / email / HP..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-8 pr-3 py-2 clay-input text-xs font-medium w-48 sm:w-60"
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-3 py-2 clay-input text-xs font-bold text-slate-700"
              >
                <option value="all">Semua Role</option>
                <option value="reporter">Warga (Citizen)</option>
                <option value="shelter">Shelter</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {usersLoading ? (
            <div className="p-8 text-center text-xs text-slate-400">Memuat pengguna...</div>
          ) : allUsers.length === 0 ? (
            <div className="p-8 clay-card text-center text-xs text-slate-400 font-medium">
              Tidak ada pengguna ditemukan.
            </div>
          ) : (
            <div className="space-y-3">
              {allUsers.map((u) => (
                <div
                  key={u.id}
                  className="clay-card p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-black text-xs text-slate-700">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-sm text-slate-900">{u.name}</h4>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                            u.role === 'admin'
                              ? 'bg-amber-100 text-amber-900'
                              : u.role === 'shelter'
                              ? 'bg-brand-100 text-brand-900'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {u.role}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                          {u.email} {u.phone ? `• ${u.phone}` : ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-slate-500">Ubah Role:</span>
                    <select
                      value={u.role}
                      onChange={(e) => updateUserRoleMutation.mutate({ id: u.id, role: e.target.value })}
                      disabled={updateUserRoleMutation.isPending || u.id === user.id}
                      className="px-3 py-1.5 clay-input text-xs font-bold text-slate-800 rounded-xl"
                    >
                      <option value="reporter">Warga (Citizen)</option>
                      <option value="shelter">Shelter</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: ADVERTISEMENTS & BRAND SPONSORSHIPS */}
      {tab === 'ads' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <span>Kampanye Iklan & Sponsor Brand</span>
                <span className="px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-900 text-[10px] font-black">
                  Pet Care Ecosystem
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pasang banner promosi brand terpercaya (pakan, nutrisi, klinik vet, perlengkapan) untuk mendukung operasional platform rescue.
              </p>
            </div>

            <button
              onClick={() => {
                setAdBrandName('');
                setAdTitle('');
                setAdDescription('');
                setAdBannerUrl('');
                setAdTargetUrl('');
                setAdPlacement('explore_sidebar');
                setAdCtaText('Kunjungi Partner');
                setAdFormError('');
                setShowAddAdModal(true);
              }}
              className="px-4 py-2.5 rounded-xl clay-btn-primary text-white text-xs font-black flex items-center gap-1.5 shadow-md hover:scale-105 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Pasang Iklan Brand Baru</span>
            </button>
          </div>

          {adsLoading ? (
            <div className="p-8 text-center text-xs text-slate-400">Memuat data kampanye iklan...</div>
          ) : !allAdsData?.data || allAdsData.data.length === 0 ? (
            <div className="p-10 clay-card text-center space-y-3">
              <Megaphone className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-black text-sm text-slate-800">Belum Ada Iklan Brand Terpasang</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Mulai pasang kemitraan dengan brand pakan, klinik hewan, atau toko perlengkapan rescue anabul.
              </p>
              <button
                onClick={() => setShowAddAdModal(true)}
                className="px-4 py-2 rounded-xl clay-btn-primary text-white text-xs font-black"
              >
                Buat Kampanye Pertama
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allAdsData.data.map((ad: Advertisement) => (
                <div key={ad.id} className="clay-card p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-2.5">
                    {/* Header: Brand name & Status */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-black uppercase">
                        {ad.brand_name}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        ad.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {ad.is_active ? 'Aktif Tayang' : 'Nonaktif'}
                      </span>
                    </div>

                    {/* Banner Image */}
                    <div className="relative aspect-16/9 rounded-xl overflow-hidden bg-slate-100">
                      <img src={ad.banner_url} alt={ad.title} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-white text-[9px] font-black uppercase">
                          Slot: {ad.placement}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-black text-xs sm:text-sm text-slate-900 line-clamp-1">{ad.title}</h4>
                      {ad.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{ad.description}</p>
                      )}
                    </div>

                    {/* Metrics: Impressions & Clicks */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 grid grid-cols-2 gap-2 text-center">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block">Tayangan (Impresi)</span>
                        <span className="text-xs font-black text-slate-800">{ad.impression_count || 0}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-brand-700 font-bold block">Klik Masuk</span>
                        <span className="text-xs font-black text-brand-700 flex items-center justify-center gap-1">
                          <MousePointerClick className="w-3 h-3" />
                          {ad.click_count || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => toggleAdMutation.mutate({ id: ad.id, is_active: !ad.is_active })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        ad.is_active
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          : 'clay-btn-primary text-white'
                      }`}
                    >
                      {ad.is_active ? 'Jeda Tayang' : 'Aktifkan'}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={ad.target_url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-slate-400 hover:text-brand-700 transition"
                        title="Buka Tautan Tujuan"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus iklan brand "${ad.brand_name}"?`)) {
                            deleteAdMutation.mutate(ad.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                        title="Hapus Iklan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: TAMBAH IKLAN BRAND BARU */}
      {showAddAdModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="clay-card p-6 md:p-8 max-w-lg w-full my-8 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-lg text-slate-900">Pasang Iklan Brand Partner</h3>
                <p className="text-xs text-brand-700 font-bold">Kemitraan Relevan Ekosistem Pet Care</p>
              </div>
              <button
                onClick={() => setShowAddAdModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {adFormError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{adFormError}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createAdMutation.mutate({
                  brand_name: adBrandName,
                  title: adTitle,
                  description: adDescription,
                  banner_url: adBannerUrl,
                  target_url: adTargetUrl,
                  placement: adPlacement,
                  cta_text: adCtaText,
                });
              }}
              className="space-y-3.5 text-left"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Brand / Partner *</label>
                <input
                  type="text"
                  placeholder="Contoh: Royal Canin Indonesia / Halodoc Vet Care"
                  value={adBrandName}
                  onChange={(e) => setAdBrandName(e.target.value)}
                  className="w-full px-3.5 py-2.5 clay-input text-xs font-medium text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Promosi / Headline *</label>
                <input
                  type="text"
                  placeholder="Contoh: Diskon 20% Paket Nutrisi Kitten & Street Cat"
                  value={adTitle}
                  onChange={(e) => setAdTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 clay-input text-xs font-medium text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  placeholder="Tuliskan pesan ajakan atau keunggulan produk/layanan..."
                  value={adDescription}
                  onChange={(e) => setAdDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 clay-input text-xs font-medium text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Slot Penempatan *</label>
                  <select
                    value={adPlacement}
                    onChange={(e: any) => setAdPlacement(e.target.value)}
                    className="w-full px-3 py-2.5 clay-input text-xs font-bold text-slate-800"
                  >
                    <option value="landing_highlight">Beranda (Highlight di Bawah Hero)</option>
                    <option value="landing_sponsor">Beranda (Mitra & Brand Partner)</option>
                    <option value="explore_sidebar">Jelajah Peta (Sidebar)</option>
                    <option value="report_detail">Detail Anabul</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Teks Tombol CTA</label>
                  <input
                    type="text"
                    value={adCtaText}
                    onChange={(e) => setAdCtaText(e.target.value)}
                    className="w-full px-3 py-2.5 clay-input text-xs font-bold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">URL Gambar Banner *</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... atau URL banner CDN"
                  value={adBannerUrl}
                  onChange={(e) => setAdBannerUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 clay-input text-xs font-medium text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">URL Tautan Tujuan (Website / Toko Online) *</label>
                <input
                  type="url"
                  placeholder="https://tokopedia.com/brand atau https://royalcanin.com"
                  value={adTargetUrl}
                  onChange={(e) => setAdTargetUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 clay-input text-xs font-medium text-slate-800"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAdModal(false)}
                  className="flex-1 py-2.5 clay-btn-secondary text-slate-700 font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createAdMutation.isPending}
                  className="flex-1 py-2.5 clay-btn-primary text-white font-black text-xs shadow-md"
                >
                  {createAdMutation.isPending ? 'Menyimpan...' : 'Simpan & Publikasikan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
