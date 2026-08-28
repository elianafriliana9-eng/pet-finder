import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { Contributor } from '../types';
import {
  Heart,
  MapPin,
  ShieldCheck,
  PlusCircle,
  ArrowRight,
  ArrowUpRight,
  Shield,
  Building2,
  HeartHandshake,
  Compass,
  Soup,
  Navigation,
  Sparkles,
  Camera,
  MessagesSquare,
  Trophy,
  Medal,
  Award,
} from 'lucide-react';
import heroPet from '../assets/hero-cat.webp';
import logoImg from '../assets/logo.png';
import { SponsoredBanner } from '../components/SponsoredBanner';
import { useSEO } from '../hooks/useSEO';


const tickerItems = [
  { icon: Soup, text: 'Rina memberi makan 3 kucing di Tebet' },
  { icon: Navigation, text: 'Titik anabul diperbarui di Kemang' },
  { icon: ShieldCheck, text: 'Shelter Peduli Anabul terverifikasi' },
  { icon: HeartHandshake, text: 'Bruno dirawat luka ringannya' },
  { icon: Heart, text: 'Molly resmi diadopsi keluarga baru' },
  { icon: Camera, text: 'Laporan baru masuk dari Bintaro' },
];

const pillars = [
  {
    n: '01',
    title: 'Lapor dalam hitungan detik',
    body: 'Potret anabul yang Anda jumpai. Koordinat GPS terdeteksi otomatis dan foto dikompresi di perangkat, jadi laporan langsung tayang di peta publik.',
    note: 'Deteksi GPS presisi & kompresi foto',
    icon: Camera,
    surface: 'clay-btn-primary',
    tilt: '-rotate-2',
  },
  {
    n: '02',
    title: 'Peduli tanpa harus adopsi',
    body: 'Belum bisa memelihara di rumah? Tetap membantu: beri makan di lokasi, cek kondisi fisiknya, lalu catat di linimasa agar warga lain tahu giliran berikutnya.',
    note: 'Check-in street feeding warga',
    icon: Soup,
    surface: 'clay-btn-lilac',
    tilt: 'rotate-1',
  },
  {
    n: '03',
    title: 'Adopsi gratis, bertanggung jawab',
    body: 'Isi skrining adopsi digital, lalu berkomunikasi lewat chat internal dengan pelapor atau shelter—tanpa perlu membagikan nomor telepon pribadi.',
    note: 'Skrining terstruktur & chat aman',
    icon: MessagesSquare,
    surface: 'clay-btn-primary',
    tilt: '-rotate-1',
  },
];

const stats = [
  { value: '1–50', unit: 'km', label: 'Radius pencarian GPS' },
  { value: '100', unit: '%', label: 'Bebas biaya adopsi' },
  { value: '0', unit: 'Rp', label: 'Biaya adopsi anabul' },
  { value: '24', unit: 'jam', label: 'Peta selalu aktif' },
];

export const LandingPage: React.FC = () => {
  useSEO({
    title: 'Platform Penyelamatan & Adopsi Hewan Jalanan',
    description: 'Temukan, laporkan, beri makan (street-feeding), dan adopsi anabul jalanan terdekat di peta interaktif real-time secara bebas biaya.',
    url: 'https://streetpet.org/',
  });

  const { data: leaderboardData } = useQuery<{ status: string; data: Contributor[] }>({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const res = await api.get('/leaderboard');
      return res.data;
    },
    staleTime: 60000,
  });

  const contributors = leaderboardData?.data || [];

  return (
    <div className="min-h-screen pb-28 md:pb-16 flex flex-col bg-white overflow-x-hidden">

      {/* ============ HERO ============ */}
      <section className="relative px-4 pt-4 pb-10 md:pt-10 md:pb-16">
        {/* atmosphere */}
        <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="clay-blob w-[26rem] h-[26rem] -top-36 -left-28 bg-brand-50 animate-[drift_18s_ease-in-out_infinite]" />
          <div className="clay-blob w-[20rem] h-[20rem] top-6 -right-24 bg-lilac-100 animate-[drift_24s_ease-in-out_infinite_reverse]" />
          <div className="clay-blob w-[14rem] h-[14rem] -bottom-16 left-1/3 bg-brand-100 animate-[drift_30s_ease-in-out_infinite]" />
          <div className="absolute inset-0 dot-grid opacity-40 [mask-image:radial-gradient(75%_60%_at_50%_35%,#000,transparent)]" />
        </div>

        <div className="relative max-w-6xl mx-auto grid lg:grid-cols-12 gap-8 lg:gap-6 items-center">
          {/* copy */}
          <div className="lg:col-span-7">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full clay-badge bg-white text-brand-800 text-[11px] font-extrabold tracking-wide animate-[rise_0.7s_cubic-bezier(0.22,1,0.36,1)_both]"
            >
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex w-full h-full rounded-full bg-brand-400 opacity-70 animate-ping" />
                <span className="relative inline-flex w-2 h-2 rounded-full bg-brand-500" />
              </span>
              Gerakan Peduli Warga · Bebas Biaya Adopsi
            </div>

            <h1
              className="mt-6 font-display text-[2.6rem] leading-[1.02] sm:text-6xl lg:text-[4.4rem] font-black text-slate-900 animate-[rise_0.8s_cubic-bezier(0.22,1,0.36,1)_0.08s_both]"
            >
              Setiap anabul
              <br />
              jalanan punya
              <br />
              <span className="text-accent-brand">satu warga</span>{' '}
              <span className="relative inline-block">
                peduli.
                <svg
                  aria-hidden
                  viewBox="0 0 240 18"
                  className="absolute -bottom-1.5 left-0 w-full h-3 text-lilac-300"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M3 12C60 4 120 4 178 9c22 2 40 2 59-1"
                    stroke="currentColor"
                    strokeWidth="7"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </span>
            </h1>

            <p className="mt-7 text-sm md:text-[15px] text-slate-600 font-medium max-w-xl leading-relaxed animate-[rise_0.8s_cubic-bezier(0.22,1,0.36,1)_0.16s_both]">
              StreetPet menghubungkan warga, pemberi pakan jalanan, dan shelter terverifikasi
              di satu peta presisi. Laporkan temuan, catat kepedulian harian, dan antarkan
              anabul menuju rumah barunya—tanpa sepeser pun biaya.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 animate-[rise_0.8s_cubic-bezier(0.22,1,0.36,1)_0.24s_both]">
              <Link
                to="/explore"
                className="group px-7 py-4 clay-btn-primary text-white font-extrabold text-sm flex items-center justify-center gap-2"
              >
                <Compass className="w-4 h-4" />
                Jelajahi Peta Anabul
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/report"
                className="group px-7 py-4 clay-btn-secondary text-slate-800 font-extrabold text-sm flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4 text-brand-500" />
                Laporkan Temuan
              </Link>
            </div>

            {/* trust row */}
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 animate-[rise_0.8s_cubic-bezier(0.22,1,0.36,1)_0.32s_both]">
              <div className="flex -space-x-2.5">
                {['R', 'A', 'D', 'S'].map((c, i) => (
                  <div
                    key={c}
                    className={`w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-[11px] font-black text-white shadow-md ${
                      i % 2 === 0
                        ? 'bg-brand-500'
                        : 'bg-lilac-400'
                    }`}
                  >
                    {c}
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 font-semibold max-w-[15rem] leading-snug">
                Warga, komunitas, dan shelter bergerak bersama di lingkungan Anda.
              </p>
            </div>
          </div>

          {/* clay collage */}
          <div className="lg:col-span-5 relative animate-[pop_0.9s_cubic-bezier(0.34,1.56,0.64,1)_0.2s_both]">
            <div className="relative mx-auto max-w-sm lg:max-w-none">
              {/* backing blob */}
              <div
                aria-hidden
                className="absolute inset-4 bg-lilac-300 rotate-6 rounded-[3rem]"
              />

              {/* main card */}
              <div className="relative clay-card grain-overlay overflow-hidden rounded-[2.25rem] p-5 -rotate-2 [--tilt:-2deg] animate-float">
                <div className="relative rounded-[1.5rem] overflow-hidden bg-brand-50 aspect-4/3">
                  <img
                    src={heroPet}
                    alt="Seekor kucing jalanan meringkuk di bangku trotoar dengan sepotong roti di sampingnya"
                    className="absolute inset-0 w-full h-full object-cover object-[54%_62%]"
                    width={1400}
                    height={933}
                    loading="eager"
                    fetchPriority="high"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/92 backdrop-blur clay-badge text-[10px] font-black text-brand-800">
                    <MapPin className="w-3 h-3" /> 0,8 km dari Anda
                  </div>
                  <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-lilac-500 text-white text-[10px] font-black shadow-lg">
                    Butuh bantuan
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/92 backdrop-blur clay-badge">
                    <span className="relative flex w-2 h-2 shrink-0">
                      <span className="absolute inline-flex w-full h-full rounded-full bg-lilac-400 opacity-70 animate-ping" />
                      <span className="relative inline-flex w-2 h-2 rounded-full bg-lilac-500" />
                    </span>
                    <p className="text-[10px] font-black text-slate-800 leading-tight">
                      Laporan warga · 12 menit lalu
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-xl font-black text-slate-900 leading-tight">Kiko</p>
                    <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                      Kucing dewasa · Tebet, Jakarta Selatan
                    </p>
                  </div>
                  <div className="shrink-0 px-3 py-1.5 rounded-xl clay-badge bg-brand-50 text-[10px] font-black text-brand-800">
                    Tersedia
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center gap-2 text-[11px] font-bold text-slate-600">
                  <Soup className="w-3.5 h-3.5 text-lilac-500 shrink-0" />
                  Diberi makan 2 jam lalu oleh Rina
                </div>
              </div>

              {/* floating chip: check-in */}
              <div className="absolute -left-3 sm:-left-7 bottom-16 clay-card rounded-2xl px-3.5 py-2.5 flex items-center gap-2.5 [--tilt:4deg] rotate-4 animate-float-slow">
                <div className="w-9 h-9 rounded-xl clay-btn-lilac flex items-center justify-center text-white">
                  <HeartHandshake className="w-4.5 h-4.5" />
                </div>
                <div className="leading-tight">
                  <p className="text-[10px] font-black text-slate-900">Check-in warga</p>
                  <p className="text-[10px] text-slate-500 font-semibold">+12 hari ini</p>
                </div>
              </div>

              {/* floating chip: verified */}
              <div className="absolute -right-1 sm:-right-5 top-8 clay-card rounded-2xl px-3.5 py-2.5 flex items-center gap-2 [--tilt:-5deg] -rotate-5 animate-float">
                <ShieldCheck className="w-4.5 h-4.5 text-brand-500 shrink-0" />
                <p className="text-[10px] font-black text-slate-900 leading-tight">
                  Shelter
                  <br />
                  terverifikasi
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* live ticker */}
        <div className="relative max-w-6xl mx-auto mt-12 md:mt-16">
          <div className="clay-card-soft rounded-2xl py-3 ticker-mask overflow-hidden">
            <div className="ticker-track gap-3">
              {[...tickerItems, ...tickerItems].map((item, i) => {
                const Icon = item.icon;
                return (
                  <span
                    key={i}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/85 text-[11px] font-bold text-slate-600 whitespace-nowrap shadow-sm"
                  >
                    <Icon className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                    {item.text}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* ============ SPOT HIGHLIGHT UTAMA (DI BAWAH HERO) ============ */}
        <div className="relative max-w-6xl mx-auto mt-8">
          <SponsoredBanner placement="landing_highlight" variant="highlight" />
        </div>
      </section>

      {/* ============ STATS BAND ============ */}
      <section className="px-4 py-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {stats.map((s) => (
            <div key={s.label} className="clay-card clay-lift rounded-2xl p-5 text-center">
              <p className="font-display text-3xl md:text-4xl font-black text-slate-900 leading-none">
                {s.value}
                <span className="text-base md:text-lg text-brand-500 align-super ml-0.5">{s.unit}</span>
              </p>
              <p className="mt-2 text-[11px] font-bold text-slate-500 leading-snug">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ PILLARS ============ */}
      <section className="px-4 py-10 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-10 md:mb-14">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-black tracking-[0.18em] uppercase text-lilac-600">
              <Sparkles className="w-3.5 h-3.5" /> Cara kerjanya
            </span>
            <h2 className="mt-3 font-display text-3xl md:text-5xl font-black text-slate-900 leading-[1.05]">
              Tiga langkah, satu jaringan kepedulian.
            </h2>
            <p className="mt-4 text-sm text-slate-500 font-medium leading-relaxed">
              Ekosistem terpadu untuk warga sekitar, calon pengadopsi, dan komunitas penyelamat—
              dirancang mobile-first agar bisa dipakai langsung di lokasi temuan.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 md:gap-6">
            {pillars.map((p) => {
              const Icon = p.icon;
              return (
                <article
                  key={p.n}
                  className="clay-card clay-lift rounded-[2rem] p-6 md:p-7 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-14 h-14 rounded-2xl ${p.surface} ${p.tilt} text-white flex items-center justify-center`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="font-display text-4xl font-black text-slate-100 select-none">
                        {p.n}
                      </span>
                    </div>
                    <h3 className="mt-5 font-display text-xl font-black text-slate-900 leading-snug">
                      {p.title}
                    </h3>
                    <p className="mt-2.5 text-xs text-slate-600 leading-relaxed font-medium">{p.body}</p>
                  </div>
                  <p className="mt-6 pt-4 border-t border-slate-100 text-[11px] font-black text-brand-700">
                    {p.note}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ FEATURE GRID ============ */}
      <section className="px-4 pb-10 md:pb-16">
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
          {[
            { icon: MapPin, title: 'Radius GPS', body: 'Pencarian akurat 1–50 km dari titik Anda berdiri.', tone: 'text-brand-500' },
            { icon: HeartHandshake, title: 'Street Feeding', body: 'Catat kepedulian harian tanpa harus mengadopsi.', tone: 'text-lilac-500' },
            { icon: Building2, title: 'Verified Shelter', body: 'Klaim resmi plus penyamaran lokasi fasilitas.', tone: 'text-brand-600' },
            { icon: Shield, title: 'Zero Commercial', body: 'Bebas jual-beli dan perlindungan anti-penipuan.', tone: 'text-rose-500' },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="clay-card-soft clay-lift rounded-2xl p-5">
                <Icon className={`w-6 h-6 ${f.tone}`} />
                <p className="mt-3 text-sm font-black text-slate-900">{f.title}</p>
                <p className="mt-1.5 text-[11px] text-slate-500 font-semibold leading-relaxed">{f.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============ COMMUNITY LEADERBOARD & BADGES ============ */}
      {contributors.length > 0 && (
        <section className="px-4 pb-12 md:pb-16">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 px-2">
              <div>
                <span className="px-3 py-1 rounded-full bg-lilac-100 text-lilac-900 text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5">
                  <Trophy className="w-3 h-3 text-lilac-600" />
                  Penghargaan Relawan
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                  Warga & Relawan Paling Aktif
                </h3>
              </div>
              <p className="text-xs text-slate-500 font-semibold max-w-sm">
                Apresiasi untuk para pejuang jalanan yang rutin memberi makan, melapor, dan menyelamatkan anabul terlantar.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {contributors.slice(0, 4).map((c, idx) => (
                <div key={c.id} className="clay-card-soft clay-lift rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center font-black text-brand-700 text-lg">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-black text-slate-400">
                      #{idx + 1}
                    </span>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-extrabold text-slate-900 text-sm truncate">{c.name}</h4>
                    <div className="mt-1.5 inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-black bg-brand-100 text-brand-800 border border-brand-200">
                      {c.badge}
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                      <span>{c.total_actions} Aksi Sosial</span>
                      <span className="font-black text-brand-600">{c.points} Poin</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ BRAND PARTNER SPONSORSHIP ============ */}
      <section className="px-4 pb-10 md:pb-14">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex items-center justify-between gap-3 px-2">
            <div>
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-950 text-[10px] font-black uppercase tracking-wider">
                Ekosistem Pet Care
              </span>
              <h3 className="font-display text-xl sm:text-2xl font-black text-slate-900 mt-1">
                Mitra & Brand Pendukung Rescue
              </h3>
            </div>
            <p className="hidden sm:block text-xs text-slate-500 font-semibold max-w-xs text-right">
              Mendukung penyediaan nutrisi, klinik dokter hewan, dan perlengkapan rescue jalanan.
            </p>
          </div>

          <SponsoredBanner placement="landing_sponsor" className="shadow-md" />
        </div>
      </section>

      {/* ============ ZERO COMMERCIAL ============ */}
      <section className="px-4 pb-10">
        <div className="max-w-6xl mx-auto">
          <div className="clay-card-emerald grain-overlay relative overflow-hidden rounded-[2.5rem] p-7 md:p-12 text-white">
            <div aria-hidden className="absolute -right-20 -top-24 w-72 h-72 rounded-full bg-white/12" />
            <div aria-hidden className="absolute -left-16 -bottom-24 w-64 h-64 rounded-full bg-lilac-300/25" />
            <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="max-w-2xl">
                <span className="px-3.5 py-1.5 rounded-full bg-white/25 backdrop-blur text-white text-[10px] font-black uppercase tracking-[0.18em]">
                  Integritas komunitas
                </span>
                <h2 className="font-display text-3xl md:text-[2.75rem] font-black mt-4 leading-[1.08]">
                  Anabul bukan barang dagangan.
                </h2>
                <p className="text-xs md:text-sm text-white/85 font-medium mt-4 leading-relaxed">
                  Kami melarang keras penjualan anabul, uang tebusan terselubung, dan pembiakan liar.
                  Moderasi otomatis menyembunyikan postingan mencurigakan setelah tiga laporan warga,
                  lalu ditinjau langsung oleh admin.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0">
                <Link
                  to="/explore"
                  className="group px-6 py-3.5 rounded-2xl bg-white text-brand-800 font-black text-xs text-center transition hover:-translate-y-0.5 shadow-lg flex items-center justify-center gap-2"
                >
                  Mulai Menjelajah
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
                <Link
                  to="/shelters"
                  className="px-6 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur text-white font-black text-xs text-center transition border border-white/30"
                >
                  Lihat Shelter Terverifikasi
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="mt-4 px-4">
        <div className="max-w-6xl mx-auto pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-5 text-xs text-slate-500 font-semibold pb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
              <img src={logoImg} alt="StreetPet Logo" className="w-full h-full object-contain drop-shadow-xs" />
            </div>
            <div className="leading-tight">
              <p className="font-display font-black text-sm text-slate-900">StreetPet Rescue</p>
              <p className="text-[10px] text-slate-400">People-to-People Animal Care</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <Link to="/explore" className="hover:text-brand-700 transition">Jelajah Peta</Link>
            <Link to="/report" className="hover:text-brand-700 transition">Lapor Hewan</Link>
            <Link to="/shelters" className="hover:text-brand-700 transition">Daftar Shelter</Link>
            <Link to="/register" className="hover:text-brand-700 transition">Daftar Akun</Link>
            <Link to="/login" className="hover:text-brand-700 transition">Masuk</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
