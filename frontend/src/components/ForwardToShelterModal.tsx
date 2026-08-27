import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import type { Report, ShelterProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Send,
  Building2,
  ShieldCheck,
  MapPin,
  AlertCircle,
  RefreshCw,
  MessageSquare,
  Share2
} from 'lucide-react';

interface ForwardToShelterModalProps {
  report: Report;
  isOpen: boolean;
  onClose: () => void;
}

export const ForwardToShelterModal: React.FC<ForwardToShelterModalProps> = ({
  report,
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedShelterId, setSelectedShelterId] = useState<number | null>(null);
  const [introMessage, setIntroMessage] = useState(
    `Halo pengelola shelter, saya menemukan anabul jalanan "${report.title}" di lokasi: ${report.address_note || 'jalanan'}. Mohon bantuannya untuk koordinasi atau penanganan lebih lanjut.`
  );
  const [error, setError] = useState('');

  // Fetch list of verified shelters
  const { data: sheltersData, isLoading: sheltersLoading } = useQuery({
    queryKey: ['verified-shelters'],
    queryFn: async () => {
      const res = await api.get('/shelters');
      return res.data.data.data as ShelterProfile[];
    },
    enabled: isOpen,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ receiverId, message }: { receiverId: number; message: string }) => {
      const res = await api.post('/messages', {
        receiver_id: receiverId,
        report_id: report.id,
        message,
      });
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      onClose();
      navigate(`/messages?user=${variables.receiverId}&report=${report.id}`);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Gagal mengirim pesan ke shelter.');
    },
  });

  if (!isOpen) return null;

  const shelters = sheltersData || [];
  const primaryImage = report.images?.[0]?.thumbnail_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=300&auto=format&fit=crop&q=60';

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login', { state: { from: `/reports/${report.id}` } });
      return;
    }
    if (!selectedShelterId) {
      setError('Silakan pilih salah satu shelter penerima laporan.');
      return;
    }
    const targetShelter = shelters.find((s) => s.id === selectedShelterId);
    if (!targetShelter?.user_id) {
      setError('Data kontak shelter tidak ditemukan.');
      return;
    }

    sendMessageMutation.mutate({
      receiverId: targetShelter.user_id,
      message: introMessage.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="clay-card max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 relative space-y-4">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <span className="px-3 py-1 clay-badge bg-brand-100 text-brand-800 text-[11px] font-black uppercase tracking-wider">
            Direct Rescue Message
          </span>
          <h3 className="font-black text-xl text-slate-900 mt-2">Laporkan Temuan ke Shelter</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
            Kirimkan kartu anabul ini langsung ke pesan internal shelter terdekat untuk koordinasi penyelamatan atau penampungan.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Pet Card Preview */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex gap-3 items-center">
          <img
            src={primaryImage}
            alt={report.title}
            className="w-16 h-16 rounded-xl object-cover shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="px-2 py-0.5 rounded-md bg-brand-100 text-brand-800 text-[10px] font-black uppercase">
                {report.pet_type === 'cat' ? 'Kucing' : 'Anjing'}
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                {report.condition === 'critical' ? 'Darurat' : report.condition === 'injured' ? 'Terluka' : 'Sehat'}
              </span>
            </div>
            <h4 className="font-black text-xs sm:text-sm text-slate-900 truncate">{report.title}</h4>
            <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-brand-600 shrink-0" />
              <span>{report.address_note || 'Lokasi jalanan'}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSend} className="space-y-4 text-left">
          {/* Shelter Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Pilih Shelter Penerima Laporan *
            </label>
            {sheltersLoading ? (
              <div className="p-4 text-center text-xs text-slate-400">
                <RefreshCw className="w-4 h-4 animate-spin inline mr-1" /> Memuat daftar shelter terverifikasi...
              </div>
            ) : shelters.length === 0 ? (
              <p className="text-xs text-slate-400">Belum ada shelter terverifikasi terdaftar di area ini.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {shelters.map((sh) => (
                  <div
                    key={sh.id}
                    onClick={() => setSelectedShelterId(sh.id)}
                    className={`p-3 rounded-2xl cursor-pointer transition border flex items-center justify-between gap-3 ${
                      selectedShelterId === sh.id
                        ? 'bg-brand-50 border-brand-500 shadow-sm ring-2 ring-brand-300'
                        : 'bg-white border-slate-200 hover:border-brand-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl clay-badge bg-brand-50 flex items-center justify-center font-black text-brand-700 text-xs shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h5 className="font-black text-xs text-slate-900 truncate">{sh.shelter_name}</h5>
                          {sh.is_verified && (
                            <ShieldCheck className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 truncate">{sh.address}</p>
                      </div>
                    </div>

                    <input
                      type="radio"
                      name="selected_shelter"
                      checked={selectedShelterId === sh.id}
                      onChange={() => setSelectedShelterId(sh.id)}
                      className="w-4 h-4 accent-brand-600"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Intro Message Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Pesan Koordinasi untuk Shelter
            </label>
            <textarea
              rows={3}
              value={introMessage}
              onChange={(e) => setIntroMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 clay-input text-xs font-medium text-slate-800"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 clay-btn-secondary text-xs font-bold text-slate-700"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={sendMessageMutation.isPending || !selectedShelterId}
              className="px-6 py-3 clay-btn-primary text-white font-black text-xs shadow-md hover:scale-102 transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sendMessageMutation.isPending ? 'Mengirim...' : 'Kirim Card ke Shelter via Chat'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
