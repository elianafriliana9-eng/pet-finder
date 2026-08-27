import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import type { Message, Conversation } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  MessageSquare,
  Send,
  User,
  RefreshCw,
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCheck,
  Sparkles,
  MapPin,
  Heart,
  ShieldCheck,
  Building2,
  Image as ImageIcon,
  Navigation,
  X,
  Compass,
  ExternalLink,
  Maximize2
} from 'lucide-react';

const QUICK_REPLIES = [
  'Halo, apakah anabul masih berada di titik lokasi tersebut?',
  'Halo, saya tertarik untuk koordinasi adopsi/rescue anabul ini.',
  'Halo, saya sedang menuju lokasi untuk street feeding.',
  'Bisa tolong bagikan patokan alamat/landmark detailnya?',
];

export const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get('user');
  const reportId = searchParams.get('report');
  const queryClient = useQueryClient();

  const [inputMessage, setInputMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [attachedLocation, setAttachedLocation] = useState<{ lat: number; lng: number; name?: string } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch conversations list
  const { data: convData, isLoading: convLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await api.get('/messages/conversations');
      return res.data.data as Conversation[];
    },
    enabled: !!user,
    refetchInterval: 5000,
  });

  // 2. Fetch specific thread if user param exists
  const { data: threadResult, isLoading: threadLoading } = useQuery({
    queryKey: ['thread', targetUserId, reportId],
    queryFn: async () => {
      if (!targetUserId) return null;
      const res = await api.get(`/messages/thread/${targetUserId}`, {
        params: reportId ? { report_id: reportId } : {},
      });
      return {
        messages: (res.data.data || []) as Message[],
        other_user: res.data.other_user,
        report: res.data.report,
      };
    },
    enabled: !!targetUserId && !!user,
    refetchInterval: 3000,
  });

  const threadMeta = threadResult;
  const messages = threadResult?.messages || [];

  const sendMutation = useMutation({
    mutationFn: async (payload: {
      text?: string;
      imageFile?: File | null;
      location?: { lat: number; lng: number; name?: string } | null;
    }) => {
      const formData = new FormData();
      formData.append('receiver_id', String(targetUserId));
      if (reportId) formData.append('report_id', String(reportId));
      if (payload.text) formData.append('message', payload.text);
      if (payload.imageFile) formData.append('attachment', payload.imageFile);
      if (payload.location) {
        formData.append('latitude', String(payload.location.lat));
        formData.append('longitude', String(payload.location.lng));
        if (payload.location.name) formData.append('location_name', payload.location.name);
      }

      const res = await api.post('/messages', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ['thread', targetUserId, reportId] });
      const previousThread = queryClient.getQueryData(['thread', targetUserId, reportId]);

      if (previousThread && user) {
        const optimisticMsg: Message = {
          id: Date.now(),
          sender_id: user.id,
          receiver_id: Number(targetUserId),
          report_id: reportId ? Number(reportId) : undefined,
          message: payload.text,
          attachment_url: imagePreviewUrl || undefined,
          latitude: payload.location?.lat,
          longitude: payload.location?.lng,
          location_name: payload.location?.name,
          is_read: false,
          created_at: new Date().toISOString(),
          sender: user,
        };

        queryClient.setQueryData(['thread', targetUserId, reportId], (old: any) => ({
          ...old,
          messages: [...(old?.messages || []), optimisticMsg],
        }));
      }

      return { previousThread };
    },
    onError: (_err, _payload, context: any) => {
      if (context?.previousThread) {
        queryClient.setQueryData(['thread', targetUserId, reportId], context.previousThread);
      }
      alert('Gagal mengirim pesan atau lampiran.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['thread', targetUserId, reportId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['unread-messages-count'] });
    },
  });

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Ukuran gambar maksimal adalah 10 MB');
        return;
      }
      setSelectedImage(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Browser Anda tidak mendukung deteksi lokasi GPS.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        setAttachedLocation({
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
          name: 'Posisi GPS Terkini',
        });
      },
      (err) => {
        setIsLocating(false);
        console.error('GPS error:', err);
        alert('Gagal mendeteksi lokasi GPS. Pastikan izin akses lokasi aktif pada browser Anda.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSend = (overrideText?: string) => {
    const textToSend = (overrideText || inputMessage).trim();
    const hasContent = textToSend || selectedImage || attachedLocation;

    if (!hasContent || !targetUserId || sendMutation.isPending) return;

    sendMutation.mutate({
      text: textToSend,
      imageFile: selectedImage,
      location: attachedLocation,
    });

    setInputMessage('');
    handleRemoveImage();
    setAttachedLocation(null);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, imagePreviewUrl, attachedLocation]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 clay-card text-center">
        <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h2 className="text-lg font-black text-slate-900">Masuk untuk Mengirim Pesan</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6 font-medium">
          Komunikasi langsung antara pelapor, shelter, dan pengadopsi secara aman dan terenkripsi tanpa nomor HP publik.
        </p>
        <Link to="/login" className="px-6 py-3 clay-btn-primary text-white text-xs font-black">
          Masuk ke Akun
        </Link>
      </div>
    );
  }

  const conversations = convData || [];

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-2 sm:py-3 h-[calc(100dvh-75px)] md:h-[calc(100dvh-85px)] flex flex-col box-border">
      <div className="clay-card flex-1 min-h-0 flex overflow-hidden border border-slate-200 shadow-xl rounded-2xl sm:rounded-3xl bg-white">
        
        {/* ================================================================= */}
        {/* Left Column: Conversations List (Hidden on mobile if in thread)    */}
        {/* ================================================================= */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col min-h-0 bg-white ${
            targetUserId ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="p-3 sm:p-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between shrink-0">
            <div>
              <h2 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-brand-600" />
                <span>Pesan Masuk</span>
              </h2>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5">
                Koordinasi aman tanpa nomor HP publik
              </p>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-100">
            {convLoading ? (
              <div className="p-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-brand-500" />
                <span>Memuat percakapan...</span>
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 font-medium">
                Belum ada percakapan aktif. Mulai chat dari halaman profil anabul atau shelter!
              </div>
            ) : (
              conversations.map((conv, idx) => {
                const isActive = String(conv.other_user?.id) === targetUserId;
                const isShelter = conv.other_user?.role === 'shelter';

                return (
                  <Link
                    key={idx}
                    to={`/messages?user=${conv.other_user?.id}${conv.report?.id ? `&report=${conv.report.id}` : ''}`}
                    className={`p-3 sm:p-3.5 flex items-start gap-3 hover:bg-slate-50 transition block relative ${
                      isActive ? 'bg-brand-50/70 border-l-4 border-brand-500' : ''
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div
                        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center font-black text-sm text-white shadow-xs ${
                          isShelter
                            ? 'bg-gradient-to-br from-indigo-500 to-indigo-700'
                            : 'bg-gradient-to-br from-brand-400 to-brand-600'
                        }`}
                      >
                        {conv.other_user?.name?.charAt(0) || 'U'}
                      </div>
                      {isShelter && (
                        <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-white shadow-xs">
                          <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h4 className="text-xs font-black text-slate-900 truncate">
                            {conv.other_user?.name}
                          </h4>
                          {isShelter && (
                            <span className="px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-900 text-[9px] font-black shrink-0">
                              Shelter
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium shrink-0 ml-1">
                          {new Date(conv.last_message_time).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {conv.report && (
                        <p className="text-[10px] text-brand-700 font-bold truncate mb-0.5 flex items-center gap-1">
                          <span>🐾</span>
                          <span>{conv.report.title}</span>
                        </p>
                      )}

                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs text-slate-500 truncate font-medium flex-1">
                          {conv.last_message}
                        </p>
                        {conv.unread_count > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black shrink-0 shadow-xs">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* ================================================================= */}
        {/* Right Column: Active Message Thread                              */}
        {/* ================================================================= */}
        <div
          className={`flex-1 min-h-0 flex flex-col bg-slate-50/40 relative overflow-hidden ${
            !targetUserId ? 'hidden md:flex items-center justify-center' : 'flex'
          }`}
        >
          {targetUserId ? (
            <>
              {/* Thread Header */}
              <div className="p-3 sm:p-3.5 bg-white border-b border-slate-200 flex items-center justify-between gap-3 shadow-xs shrink-0 z-10">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Link
                    to="/messages"
                    className="md:hidden p-1.5 -ml-1 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition shrink-0"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Link>
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-brand-100 text-brand-800 flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                    {threadMeta?.other_user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                        {threadMeta?.other_user?.name || 'Pengguna'}
                      </h3>
                      {threadMeta?.other_user?.role === 'shelter' && (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 text-[10px] font-extrabold shrink-0 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          Shelter
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium truncate">
                      {threadMeta?.other_user?.role === 'shelter'
                        ? threadMeta?.other_user?.shelter_profile?.shelter_name || 'Pengelola Shelter Resmi'
                        : 'Calon Adopter / Relawan Warga'}
                    </p>
                  </div>
                </div>

                {/* Referenced Pet Chip in Header */}
                {threadMeta?.report && (
                  <Link
                    to={`/reports/${threadMeta.report.id}`}
                    className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 shrink-0 max-w-[220px] transition shadow-xs"
                    title="Buka detail info anabul"
                  >
                    {threadMeta.report.images?.[0]?.thumbnail_url && (
                      <img
                        src={threadMeta.report.images[0].thumbnail_url}
                        alt="Pet"
                        className="w-6 h-6 rounded-lg object-cover"
                      />
                    )}
                    <span className="truncate">{threadMeta.report.title}</span>
                  </Link>
                )}
              </div>

              {/* Rich Interactive Shared Pet Card in Chat Header */}
              {threadMeta?.report && (
                <div className="mx-2.5 sm:mx-4 mt-2 p-2.5 sm:p-3 rounded-2xl bg-white border border-brand-200/80 shadow-xs flex items-center justify-between gap-2.5 shrink-0 z-10">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={
                        threadMeta.report.images?.[0]?.thumbnail_url ||
                        'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200&auto=format&fit=crop&q=60'
                      }
                      alt={threadMeta.report.title}
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover shrink-0 shadow-2xs"
                    />
                    <div className="min-w-0 text-left">
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className="px-1.5 py-0.2 rounded bg-brand-100 text-brand-900 text-[9px] font-black uppercase">
                          {threadMeta.report.pet_type === 'cat' ? 'Kucing' : 'Anjing'}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[9px] font-bold uppercase">
                          {threadMeta.report.condition === 'critical'
                            ? 'Darurat'
                            : threadMeta.report.condition === 'injured'
                            ? 'Terluka'
                            : 'Sehat'}
                        </span>
                      </div>
                      <h4 className="font-black text-xs text-slate-900 truncate max-w-[180px] sm:max-w-xs">
                        {threadMeta.report.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 truncate flex items-center gap-1 font-medium">
                        <MapPin className="w-3 h-3 text-brand-600 shrink-0" />
                        <span className="truncate">{threadMeta.report.address_note || 'Lokasi jalanan'}</span>
                      </p>
                    </div>
                  </div>

                  <Link
                    to={`/reports/${threadMeta.report.id}`}
                    className="px-3 py-1.5 rounded-xl clay-btn-primary text-white text-[11px] font-black shrink-0 flex items-center gap-1 shadow-xs whitespace-nowrap"
                  >
                    <span>Detail</span>
                    <ArrowLeft className="w-3 h-3 rotate-180" />
                  </Link>
                </div>
              )}

              {/* Messages Stream Container (Scrollable) */}
              <div className="flex-1 min-h-0 p-3 sm:p-4 overflow-y-auto overflow-x-hidden space-y-3">
                {threadLoading && messages.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-brand-500" />
                    <span>Memuat obrolan...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 font-medium">
                    Kirim pesan pertama, foto kondisi anabul, atau bagikan pin lokasi GPS.
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender_id === user.id;
                    const hasAttachment = Boolean(msg.attachment_url);
                    const hasGps = Boolean(msg.latitude && msg.longitude);

                    return (
                      <div
                        key={msg.id}
                        className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in-50 duration-150`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-2.5 sm:p-3 text-xs shadow-xs text-left space-y-2 ${
                            isMe
                              ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-br-xs'
                              : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                          }`}
                        >
                          {/* 1. Photo Attachment View */}
                          {hasAttachment && (
                            <div className="relative rounded-xl overflow-hidden shadow-xs border border-white/20 group cursor-pointer">
                              <img
                                src={msg.attachment_url}
                                alt="Foto Lampiran"
                                className="w-full max-h-64 object-cover rounded-xl transition group-hover:scale-102"
                                onClick={() => setLightboxImage(msg.attachment_url!)}
                              />
                              <div
                                onClick={() => setLightboxImage(msg.attachment_url!)}
                                className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition"
                                title="Perbesar Foto"
                              >
                                <Maximize2 className="w-3.5 h-3.5" />
                              </div>
                            </div>
                          )}

                          {/* 2. GPS Location Card */}
                          {hasGps && (
                            <div
                              className={`p-2.5 rounded-xl flex flex-col gap-2 ${
                                isMe
                                  ? 'bg-black/15 border border-white/25 text-white'
                                  : 'bg-slate-50 border border-slate-200 text-slate-800'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <div
                                  className={`p-1.5 rounded-lg ${
                                    isMe ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-600'
                                  }`}
                                >
                                  <MapPin className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <span className="font-black text-xs block">
                                    {msg.location_name || 'Lokasi GPS Anabul'}
                                  </span>
                                  <span
                                    className={`text-[10px] font-mono font-medium block ${
                                      isMe ? 'text-white/80' : 'text-slate-500'
                                    }`}
                                  >
                                    Lat: {msg.latitude?.toFixed(5)}, Lng: {msg.longitude?.toFixed(5)}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 pt-1">
                                <Link
                                  to={`/explore?lat=${msg.latitude}&lng=${msg.longitude}&zoom=17`}
                                  className={`flex-1 py-1.5 px-2 rounded-lg text-center font-bold text-[11px] flex items-center justify-center gap-1 transition ${
                                    isMe
                                      ? 'bg-white text-brand-800 hover:bg-white/90 shadow-2xs'
                                      : 'bg-brand-500 text-white hover:bg-brand-600 shadow-2xs'
                                  }`}
                                >
                                  <Compass className="w-3.5 h-3.5" />
                                  <span>Buka di Peta</span>
                                </Link>

                                <a
                                  href={`https://www.google.com/maps/search/?api=1&query=${msg.latitude},${msg.longitude}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`p-1.5 rounded-lg border flex items-center justify-center transition ${
                                    isMe
                                      ? 'border-white/30 text-white hover:bg-white/10'
                                      : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                                  }`}
                                  title="Buka di Google Maps"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </div>
                          )}

                          {/* 3. Text Message */}
                          {msg.message && (
                            <p className="leading-relaxed font-medium whitespace-pre-wrap break-words">
                              {msg.message}
                            </p>
                          )}

                          {/* Timestamp & Read Receipts */}
                          <div
                            className={`flex items-center justify-end gap-1 text-[9px] font-semibold pt-0.5 ${
                              isMe ? 'text-brand-100' : 'text-slate-400'
                            }`}
                          >
                            <span>
                              {new Date(msg.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {isMe && (
                              <span>
                                {msg.is_read ? (
                                  <span title="Sudah dibaca">
                                    <CheckCheck className="w-3.5 h-3.5 text-sky-200" />
                                  </span>
                                ) : (
                                  <span title="Terkirim">
                                    <Check className="w-3 h-3 text-white/70" />
                                  </span>
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Attachment Preview Bar (If Image or GPS selected) */}
              {(imagePreviewUrl || attachedLocation) && (
                <div className="px-3 sm:px-4 py-2 bg-brand-50 border-t border-brand-200/80 flex items-center gap-3 overflow-x-auto shrink-0 z-10 animate-in fade-in slide-in-from-bottom-2 duration-150">
                  {imagePreviewUrl && (
                    <div className="relative inline-block shrink-0">
                      <img
                        src={imagePreviewUrl}
                        alt="Preview"
                        className="w-14 h-14 rounded-xl object-cover border-2 border-brand-500 shadow-sm"
                      />
                      <button
                        onClick={handleRemoveImage}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md hover:bg-rose-600 transition"
                        title="Hapus Gambar"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {attachedLocation && (
                    <div className="p-2 rounded-xl bg-white border border-brand-300 flex items-center gap-2 shadow-2xs shrink-0">
                      <div className="p-1.5 rounded-lg bg-rose-100 text-rose-600">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="text-left min-w-0">
                        <span className="text-xs font-black text-slate-800 block">Pin GPS Terlampir</span>
                        <span className="text-[10px] text-slate-500 font-mono block">
                          {attachedLocation.lat}, {attachedLocation.lng}
                        </span>
                      </div>
                      <button
                        onClick={() => setAttachedLocation(null)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-md ml-1"
                        title="Batal Bagikan Lokasi"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Quick Reply Chips */}
              <div className="px-2.5 sm:px-4 py-1.5 bg-slate-100/90 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 z-10">
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Cepat:
                </span>
                {QUICK_REPLIES.map((reply, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(reply)}
                    disabled={sendMutation.isPending}
                    className="px-2.5 py-1 rounded-full bg-white hover:bg-brand-50 hover:text-brand-700 border border-slate-200 text-[10px] sm:text-[11px] font-medium text-slate-600 shrink-0 transition whitespace-nowrap shadow-2xs"
                  >
                    {reply}
                  </button>
                ))}
              </div>

              {/* Input Area with Image Picker & GPS Location Buttons */}
              <div className="p-2 sm:p-3 bg-white border-t border-slate-200 shrink-0 z-10">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-end gap-1.5 sm:gap-2"
                >
                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImagePick}
                    className="hidden"
                  />

                  {/* Photo Attachment Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-2.5 rounded-xl border transition flex items-center justify-center shrink-0 h-[38px] w-[38px] ${
                      selectedImage
                        ? 'bg-brand-100 border-brand-400 text-brand-700'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                    title="Kirim Foto Anabul"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>

                  {/* Share GPS Location Button */}
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={isLocating}
                    className={`p-2.5 rounded-xl border transition flex items-center justify-center shrink-0 h-[38px] w-[38px] ${
                      attachedLocation
                        ? 'bg-rose-100 border-rose-400 text-rose-700'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                    title="Bagikan Lokasi GPS Terkini"
                  >
                    {isLocating ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-brand-600" />
                    ) : (
                      <Navigation className="w-4 h-4" />
                    )}
                  </button>

                  {/* Message Textarea */}
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    placeholder="Ketik pesan... (Enter untuk kirim)"
                    value={inputMessage}
                    onChange={(e) => {
                      setInputMessage(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
                    }}
                    onKeyDown={handleKeyDown}
                    className="flex-1 px-3.5 py-2.5 clay-input text-xs font-medium text-slate-800 resize-none max-h-24 min-h-[38px] focus:outline-none"
                  />

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={sendMutation.isPending || (!inputMessage.trim() && !selectedImage && !attachedLocation)}
                    className="px-4 py-2.5 rounded-2xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-black transition flex items-center justify-center gap-1 shadow-md shrink-0 active:scale-95 h-[38px]"
                    title="Kirim Pesan"
                  >
                    {sendMutation.isPending ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="text-center p-8">
              <div className="w-14 h-14 rounded-3xl bg-brand-50 flex items-center justify-center mx-auto mb-3 text-brand-600">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-black text-slate-800 mb-1">Pilih Obrolan</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto font-medium">
                Pilih salah satu kontak percakapan di sebelah kiri untuk membaca dan membalas pesan.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Image Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-10 right-0 p-2 text-white/80 hover:text-white transition"
              title="Tutup Preview"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={lightboxImage}
              alt="Full Preview"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};
