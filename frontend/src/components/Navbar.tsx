import React from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { ShieldCheck, Heart, LogOut, ShieldAlert, PlusCircle, MessageSquare, ClipboardList, MapPin, Building2, Download, Smartphone } from 'lucide-react';
import logoImg from '../assets/logo.png';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch unread count for badge
  const { data: unreadData } = useQuery({
    queryKey: ['unread-messages-count'],
    queryFn: async () => {
      const res = await api.get('/messages/unread-count');
      return res.data.unread_count as number;
    },
    enabled: !!user,
    refetchInterval: 10000,
  });

  const unreadCount = unreadData || 0;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleTriggerInstall = () => {
    // Dispatch custom event to trigger install prompt modal
    window.dispatchEvent(new Event('streetpet-open-install-guide'));
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-3 sm:px-4 py-2.5">
      <div className="max-w-7xl mx-auto clay-card px-4 sm:px-5 py-2.5 flex items-center justify-between gap-4">
        {/* Brand & Desktop Navigation */}
        <div className="flex items-center gap-4 lg:gap-6">
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden shrink-0">
              <img src={logoImg} alt="StreetPet Logo" className="w-full h-full object-contain drop-shadow-xs" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-800 tracking-tight leading-tight">StreetPet</h1>
              <p className="text-[10px] text-brand-700 font-bold tracking-wide">Rescue & Adopsi Terbuka</p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 pl-3 border-l border-slate-200">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-brand-50 text-brand-800 shadow-xs'
                    : 'text-slate-600 hover:text-brand-700 hover:bg-slate-50'
                }`
              }
            >
              <span>Beranda</span>
            </NavLink>
            <NavLink
              to="/explore"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-brand-50 text-brand-800 shadow-xs'
                    : 'text-slate-600 hover:text-brand-700 hover:bg-slate-50'
                }`
              }
            >
              <MapPin className="w-3.5 h-3.5 text-brand-600" />
              <span>Jelajah Peta</span>
            </NavLink>
            <NavLink
              to="/shelters"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-brand-50 text-brand-800 shadow-xs'
                    : 'text-slate-600 hover:text-brand-700 hover:bg-slate-50'
                }`
              }
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Shelter</span>
            </NavLink>
            <NavLink
              to="/pipeline"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-brand-50 text-brand-800 shadow-xs'
                    : 'text-slate-600 hover:text-brand-700 hover:bg-slate-50'
                }`
              }
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Adopsi</span>
            </NavLink>
            {user && (
              <NavLink
                to="/messages"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 relative ${
                    isActive
                      ? 'bg-brand-50 text-brand-800 shadow-xs'
                      : 'text-slate-600 hover:text-brand-700 hover:bg-slate-50'
                  }`
                }
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Pesan</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-black shrink-0 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </NavLink>
            )}
          </nav>
        </div>

        {/* Right Actions: Install App + Lapor Button + User Auth Info */}
        <div className="flex items-center gap-2">
          {/* Install App Button */}
          <button
            onClick={handleTriggerInstall}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-brand-50 text-slate-700 hover:text-brand-700 text-xs font-bold transition border border-slate-200/80 shadow-2xs"
            title="Pasang Aplikasi ke HP / Desktop"
          >
            <Download className="w-3.5 h-3.5 text-brand-600" />
            <span className="hidden sm:inline">Install App</span>
          </button>

          {/* Lapor Anabul Button (Desktop CTA) */}
          <Link
            to="/report"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl clay-btn-primary text-white text-xs font-black shadow-sm hover:scale-105 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Lapor Anabul</span>
          </Link>

          {user ? (
            <div className="flex items-center gap-2.5">
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 clay-badge text-xs font-bold hover:scale-105 transition"
                >
                  <ShieldAlert className="w-4 h-4 text-amber-700" /> Admin Panel
                </Link>
              )}

              {user.role === 'shelter' && (
                <Link
                  to="/shelter/dashboard"
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500 text-white clay-badge text-xs font-bold hover:scale-105 transition shadow-xs"
                >
                  <Building2 className="w-3.5 h-3.5" /> Panel Shelter
                </Link>
              )}

              <div className="flex items-center gap-2 pl-1">
                <div className="w-8 h-8 rounded-full clay-badge bg-white text-slate-800 flex items-center justify-center font-black text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline text-xs font-bold text-slate-800 max-w-[100px] truncate">{user.name}</span>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                to="/login"
                className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-brand-700 transition"
              >
                Masuk
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-xs font-bold clay-btn-secondary text-slate-800 hover:scale-105 transition"
              >
                Daftar
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

