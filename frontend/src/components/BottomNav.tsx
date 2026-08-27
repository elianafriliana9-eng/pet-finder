import React from 'react';
import { NavLink } from 'react-router-dom';
import { Heart, MapPin, PlusCircle, Building2, ClipboardList, MessageSquare, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';

export const BottomNav: React.FC = () => {
  const { user } = useAuth();

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

  const navItems = [
    { to: '/', label: 'Beranda', icon: Heart },
    { to: '/explore', label: 'Jelajah', icon: MapPin },
    { to: '/report', label: 'Lapor', icon: PlusCircle, highlight: true },
    { to: '/shelters', label: 'Shelter', icon: Building2 },
    { to: '/pipeline', label: 'Adopsi', icon: ClipboardList },
    { to: '/messages', label: 'Pesan', icon: MessageSquare, badge: unreadCount },
  ];

  if (user?.role === 'admin') {
    navItems.push({ to: '/admin', label: 'Admin', icon: Shield });
  }

  return (
    <nav className="fixed bottom-3 left-3 right-3 z-40 clay-card px-3 py-2 md:hidden">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition ${
                  item.highlight
                    ? 'text-brand-700 font-black -mt-6'
                    : isActive
                    ? 'text-brand-700 font-bold clay-badge bg-brand-50 px-3'
                    : 'text-slate-500 font-medium hover:text-slate-800'
                }`
              }
            >
              {item.highlight ? (
                <div className="w-13 h-13 rounded-full clay-btn-primary flex items-center justify-center text-white shadow-lg">
                  <Icon className="w-7 h-7" />
                </div>
              ) : (
                <div className="relative">
                  <Icon className="w-5 h-5 mb-0.5" />
                  {Boolean(item.badge && item.badge > 0) && (
                    <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[8px] font-black animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
              <span className="text-[10px] leading-tight mt-0.5">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
