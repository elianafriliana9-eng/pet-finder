import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { Report, AdoptionApplication, ShelterProfile } from '../types';
import {
  Building2,
  ShieldCheck,
  ShieldAlert,
  Heart,
  PlusCircle,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Camera,
  RefreshCw,
  MessageSquare,
  ExternalLink,
  MapPin,
  Clock,
  Home,
  Check,
  X,
  FileText,
  DollarSign,
  Ban
} from 'lucide-react';

export const ShelterDashboardPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'pets' | 'applications' | 'settings'>('pets');
  const [showOpenAdoptModal, setShowOpenAdoptModal] = useState(false);

  // Open Adopt Form States
  const [title, setTitle] = useState('');
  const [petType, setPetType] = useState<'cat' | 'dog'>('cat');
  const [ageGroup, setAgeGroup] = useState<'kitten_puppy' | 'adult' | 'senior'>('adult');
  const [condition, setCondition] = useState<'healthy' | 'injured' | 'critical'>('healthy');
  const [description, setDescription] = useState('');
  const [addressNote, setAddressNote] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [nonCommercialPledge, setNonCommercialPledge] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [formError, setFormError] = useState('');

  // Shelter Settings States
  const [shelterName, setShelterName] = useState('');
  const [shelterDesc, setShelterDesc] = useState('');
  const [donationLink, setDonationLink] = useState('');
  const [adoptionPolicy, setAdoptionPolicy] = useState('');
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Fetch Dashboard Data
  const { data, isLoading, error } = useQuery({
    queryKey: ['shelter-dashboard'],
    queryFn: async () => {
      const res = await api.get('/shelters/dashboard');
      return res.data;
    },
    enabled: !!user,
  });

  // Populate settings form when data loads
  React.useEffect(() => {
    if (data?.shelter) {
      setShelterName(data.shelter.shelter_name || '');
      setShelterDesc(data.shelter.description || '');
      setDonationLink(data.shelter.donation_link || '');
      setAdoptionPolicy(data.shelter.adoption_policy || '');
    }
  }, [data]);

  // Open Adopt Mutation
  const openAdoptMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await api.post('/shelters/open-adopt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shelter-dashboard'] });
      setShowOpenAdoptModal(false);
      resetForm();
      alert('Anabul berhasil dipublikasikan untuk program adopsi bebas biaya!');
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Gagal mempublikasikan anabul. Pastikan data lengkap.');
    },
  });

  // Update Pet Status Mutation
  const updatePetStatusMutation = useMutation({
    mutationFn: async ({ petId, status }: { petId: number; status: string }) => {
      const res = await api.patch(`/reports/${petId}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shelter-dashboard'] });
    },
  });

  // Review Application Mutation
  const reviewAppMutation = useMutation({
    mutationFn: async ({ appId, status }: { appId: number; status: 'approved' | 'rejected' }) => {
      const res = await api.patch(`/adoptions/${appId}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shelter-dashboard'] });
    },
  });

  // Update Settings Mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.put('/shelters/profile', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shelter-dashboard'] });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    },
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (selectedFiles.length + files.length > 5) {
      setFormError('Maksimal 5 foto anabul.');
      return;
    }

    setCompressing(true);
    setFormError('');

    try {
      const compressedList: File[] = [];
      const previewList: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const compressed = await imageCompression(file, {
          maxSizeMB: 0.8,
          maxWidthOrHeight: 1280,
          useWebWorker: true,
        });
        compressedList.push(compressed);
        previewList.push(URL.createObjectURL(compressed));
      }

      setSelectedFiles((prev) => [...prev, ...compressedList]);
      setPreviews((prev) => [...prev, ...previewList]);
    } catch (err: any) {
      setFormError('Gagal mengompres foto: ' + (err.message || 'Error'));
    } finally {
      setCompressing(false);
    }
  };

  const removeImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setTitle('');
    setPetType('cat');
    setAgeGroup('adult');
    setCondition('healthy');
    setDescription('');
    setAddressNote('');
    setSelectedFiles([]);
    setPreviews([]);
    setNonCommercialPledge(false);
    setFormError('');
  };

  const handleOpenAdoptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nonCommercialPledge) {
      setFormError('Anda wajib menyetujui komitmen adopsi (Dilarang memperjualbelikan hewan).');
      return;
    }
    if (selectedFiles.length === 0) {
      setFormError('Wajib mengunggah minimal 1 foto anabul.');
      return;
    }
    if (!title.trim() || !description.trim()) {
      setFormError('Nama/judul anabul dan deskripsi karakter wajib diisi.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('pet_type', petType);
    formData.append('age_group', ageGroup);
    formData.append('condition', condition);
    formData.append('description', description);
    formData.append('address_note', addressNote);
    formData.append('non_commercial_pledge', '1');

    selectedFiles.forEach((file) => {
      formData.append('images[]', file);
    });

    openAdoptMutation.mutate(formData);
  };

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate({
      shelter_name: shelterName,
      description: shelterDesc,
      donation_link: donationLink,
      adoption_policy: adoptionPolicy,
    });
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 text-brand-500 animate-spin mb-3" />
        <p className="text-sm font-bold text-slate-600">Memuat Panel Shelter...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 clay-card text-center space-y-4">
        <Building2 className="w-12 h-12 text-brand-700 mx-auto" />
        <h2 className="text-xl font-black text-slate-900">Perlu Masuk Akun Shelter</h2>
        <p className="text-xs text-slate-500">
          Silakan masuk dengan akun shelter terdaftar untuk mengakses panel manajemen rescue.
        </p>
        <button
          onClick={() => navigate('/login', { state: { from: '/shelter/dashboard' } })}
          className="w-full py-3 clay-btn-primary text-white font-black text-xs"
        >
          Masuk ke Akun
        </button>
      </div>
    );
  }

  if (error || !data?.shelter) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 clay-card text-center space-y-4">
        <div className="w-14 h-14 rounded-3xl clay-badge bg-amber-100 flex items-center justify-center mx-auto text-amber-800">
          <Building2 className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-slate-900">Belum Terdaftar Sebagai Shelter</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Akun Anda saat ini terdaftar sebagai akun perseorangan. Ajukan verifikasi shelter untuk membuka portal adopsi shelter resmi.
        </p>
        <div className="flex flex-col gap-2 pt-2">
          <Link
            to="/shelters/apply"
            className="w-full py-3 clay-btn-primary text-white font-black text-xs shadow-md"
          >
            Daftar & Ajukan Verifikasi Shelter
          </Link>
          <Link
            to="/explore"
            className="w-full py-3 clay-btn-secondary text-slate-700 font-bold text-xs"
          >
            Kembali ke Jelajah Peta
          </Link>
        </div>
      </div>
    );
  }

  const shelter: ShelterProfile = data.shelter;
  const stats = data.stats || {};
  const pets: Report[] = data.pets || [];
  const applications: AdoptionApplication[] = data.applications || [];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 md:py-6 pb-24 md:pb-12 space-y-5">
      {/* Anti-Commercial / Strictly Zero-Sale Policy Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-xs">
        <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 font-black">
          <Ban className="w-4 h-4" />
        </div>
        <div className="flex-1 text-xs leading-relaxed">
          <h4 className="font-black text-amber-950 uppercase tracking-wide">
            Kebijakan Integritas: Adopsi Bebas Biaya & Tanpa Jual-Beli
          </h4>
          <p className="mt-0.5 text-amber-800 font-medium">
            Platform StreetPet melarang keras segala bentuk komersialisasi, jual-beli anabul, atau pungutan biaya adopsi terselubung. Seluruh anabul yang dipublikasikan di bawah ini berstatus <strong>Adopsi Bebas Biaya</strong> bagi calon adopter yang lolos skrining kelayakan.
          </p>
        </div>
      </div>

      {/* Shelter Header & Profile Card */}
      <div className="clay-card p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-3xl clay-btn-primary flex items-center justify-center shrink-0 text-white shadow-md">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {shelter.shelter_name}
              </h1>
              {shelter.is_verified ? (
                <span className="px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-900 clay-badge text-[11px] font-black flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-700" /> Terverifikasi
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 clay-badge text-[11px] font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-700" /> Menunggu Review
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{shelter.address || 'Alamat shelter disamarkan demi keamanan'}</span>
            </p>
          </div>
        </div>

        {/* Primary Action */}
        <button
          onClick={() => {
            resetForm();
            setShowOpenAdoptModal(true);
          }}
          className="w-full md:w-auto px-5 py-3 rounded-2xl clay-btn-primary text-white font-black text-xs flex items-center justify-center gap-2 shadow-md hover:scale-105 transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Buka Adopsi Baru (Open Adopt)</span>
        </button>
      </div>

      {/* Summary Scoreboard Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="clay-card p-4 text-center">
          <span className="text-[11px] font-bold text-slate-500 block">Total Dikelola</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{stats.total_managed || 0}</span>
        </div>
        <div className="clay-card p-4 text-center border-b-2 border-b-brand-500">
          <span className="text-[11px] font-bold text-brand-700 block">Open Adopt</span>
          <span className="text-2xl font-black text-brand-700 mt-1 block">{stats.available_adopt || 0}</span>
        </div>
        <div className="clay-card p-4 text-center border-b-2 border-b-amber-500">
          <span className="text-[11px] font-bold text-amber-700 block">Tahap Skrining</span>
          <span className="text-2xl font-black text-amber-700 mt-1 block">{stats.in_screening || 0}</span>
        </div>
        <div className="clay-card p-4 text-center border-b-2 border-b-purple-500">
          <span className="text-[11px] font-bold text-purple-700 block">Sukses Diadopsi</span>
          <span className="text-2xl font-black text-purple-700 mt-1 block">{stats.adopted || 0}</span>
        </div>
        <div className="clay-card p-4 text-center border-b-2 border-b-rose-500 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold text-rose-700 block">Formulir Masuk</span>
          <span className="text-2xl font-black text-rose-700 mt-1 block">{stats.pending_applications || 0}</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('pets')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
            activeTab === 'pets'
              ? 'clay-btn-primary text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>Anabul Asuhan ({pets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('applications')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
            activeTab === 'applications'
              ? 'clay-btn-primary text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Pengajuan Adopsi ({applications.length})</span>
          {stats.pending_applications > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
            activeTab === 'settings'
              ? 'clay-btn-primary text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Profil & Donasi</span>
        </button>
      </div>

      {/* TAB 1: MANAGED PETS & OPEN ADOPT */}
      {activeTab === 'pets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base text-slate-900">Daftar Anabul Asuhan Shelter</h3>
            <button
              onClick={() => {
                resetForm();
                setShowOpenAdoptModal(true);
              }}
              className="px-3.5 py-1.5 rounded-xl clay-btn-primary text-white text-xs font-bold flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Tambah Anabul</span>
            </button>
          </div>

          {pets.length === 0 ? (
            <div className="clay-card p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Heart className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-800">Belum Ada Anabul Terdaftar</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Publikasikan anabul yang siap diadopsi atau klaim laporan anabul jalanan dari peta.
              </p>
              <button
                onClick={() => {
                  resetForm();
                  setShowOpenAdoptModal(true);
                }}
                className="px-4 py-2 rounded-xl clay-btn-primary text-white text-xs font-black"
              >
                Buka Adopsi Anabul Pertama
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pets.map((pet) => {
                const primaryImg = pet.images?.[0]?.thumbnail_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=300&auto=format&fit=crop&q=60';
                return (
                  <div key={pet.id} className="clay-card p-3.5 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100">
                        <img
                          src={primaryImg}
                          alt={pet.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 flex gap-1">
                          <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-white text-[10px] font-black uppercase">
                            {pet.pet_type === 'cat' ? 'Kucing' : 'Anjing'}
                          </span>
                        </div>
                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-slate-800 text-[10px] font-extrabold uppercase">
                            {pet.condition === 'critical' ? 'Darurat' : pet.condition === 'injured' ? 'Terluka' : 'Sehat'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-black text-sm text-slate-900 line-clamp-1">{pet.title}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                          {pet.description}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      {/* Status Selector */}
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-500">Status:</span>
                        <select
                          value={pet.status}
                          onChange={(e) => updatePetStatusMutation.mutate({ petId: pet.id, status: e.target.value })}
                          disabled={updatePetStatusMutation.isPending}
                          className="px-2 py-1 clay-input text-xs font-bold text-slate-800 rounded-lg"
                        >
                          <option value="available">Tersedia (Open Adopt)</option>
                          <option value="screening">Dalam Skrining</option>
                          <option value="rescued">Diamankan Shelter</option>
                          <option value="adopted">Berhasil Diadopsi</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] font-bold text-slate-400">
                          {pet.adoption_applications_count || 0} Calon Adopter
                        </span>
                        <Link
                          to={`/reports/${pet.id}`}
                          className="text-xs font-bold text-brand-700 hover:underline flex items-center gap-1"
                        >
                          <span>Halaman Publik</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INBOUND ADOPTION APPLICATIONS */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base text-slate-900">
              Formulir Skrining Calon Adopter ({applications.length})
            </h3>
          </div>

          {applications.length === 0 ? (
            <div className="clay-card p-10 text-center space-y-2">
              <Users className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <h4 className="font-bold text-sm text-slate-800">Belum Ada Pengajuan Masuk</h4>
              <p className="text-xs text-slate-500">
                Formulir dari warga yang ingin mengadopsi anabul asuhan Anda akan muncul di sini.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <div key={app.id} className="clay-card p-4 sm:p-5 flex flex-col md:flex-row items-start justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    {/* Header: Adopter info & Targeted Pet */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl clay-badge bg-brand-50 flex items-center justify-center font-black text-brand-800 text-sm">
                        {app.adopter?.name ? app.adopter.name.charAt(0).toUpperCase() : 'A'}
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-slate-900">{app.adopter?.name || 'Calon Adopter'}</h4>
                        <p className="text-xs text-slate-500 font-medium">
                          Mengajukan adopsi untuk: <strong className="text-slate-800">{app.report?.title || 'Anabul'}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Screening Answers Pill Grid */}
                    {app.screening_answers && (
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-400 text-[10px] font-bold block">Tipe Hunian:</span>
                          <span className="font-bold text-slate-700">{app.screening_answers.housing_type}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] font-bold block">Izin Keluarga/Tempat:</span>
                          <span className={`font-bold ${app.screening_answers.housing_permit ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {app.screening_answers.housing_permit ? '✓ Diizinkan Penuh' : '✗ Belum Ada Izin'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] font-bold block">Kesiapan Finansial:</span>
                          <span className={`font-bold ${app.screening_answers.financial_readiness ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {app.screening_answers.financial_readiness ? '✓ Siap Biaya Medis & Pakan' : '✗ Kurang Siap'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] font-bold block">Komitmen Sterilisasi:</span>
                          <span className={`font-bold ${app.screening_answers.sterilization_commitment ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {app.screening_answers.sterilization_commitment ? '✓ Bersedia Steril' : '✗ Tidak Bersedia'}
                          </span>
                        </div>
                        <div className="sm:col-span-2 pt-1 border-t border-slate-200/50">
                          <span className="text-slate-400 text-[10px] font-bold block">Riwayat Pelihara:</span>
                          <span className="text-slate-600 font-medium">{app.screening_answers.pet_history}</span>
                        </div>
                      </div>
                    )}

                    {app.notes && (
                      <p className="text-xs text-slate-500 italic">
                        Catatan Adopter: "{app.notes}"
                      </p>
                    )}
                  </div>

                  {/* Right Actions & Status */}
                  <div className="flex flex-col sm:flex-row md:flex-col items-end justify-between gap-3 shrink-0 self-stretch sm:self-auto">
                    <div>
                      {app.status === 'approved' ? (
                        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 clay-badge text-xs font-black flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Disetujui
                        </span>
                      ) : app.status === 'rejected' ? (
                        <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-900 clay-badge text-xs font-bold flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5 text-rose-700" /> Ditolak
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 clay-badge text-xs font-bold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-700" /> Menunggu Review
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/messages?user=${app.adopter_id}&report=${app.report_id}`}
                        className="px-3 py-1.5 rounded-xl clay-btn-secondary text-slate-800 text-xs font-bold flex items-center gap-1"
                        title="Chat Calon Adopter"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-brand-700" />
                        <span>Chat</span>
                      </Link>

                      {app.status === 'pending' && (
                        <>
                          <button
                            onClick={() => reviewAppMutation.mutate({ appId: app.id, status: 'approved' })}
                            disabled={reviewAppMutation.isPending}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1 shadow-xs transition"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Setujui</span>
                          </button>
                          <button
                            onClick={() => reviewAppMutation.mutate({ appId: app.id, status: 'rejected' })}
                            disabled={reviewAppMutation.isPending}
                            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Tolak</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SHELTER SETTINGS & PROFILES */}
      {activeTab === 'settings' && (
        <div className="clay-card p-6 md:p-8 max-w-3xl space-y-5">
          <div>
            <h3 className="font-black text-lg text-slate-900">Pengaturan Profil & Informasi Shelter</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola informasi profil shelter, tautan donasi resmi, dan kebijakan adopsi.
            </p>
          </div>

          {settingsSaved && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Profil shelter berhasil disimpan!</span>
            </div>
          )}

          <form onSubmit={handleSettingsSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Shelter</label>
              <input
                type="text"
                value={shelterName}
                onChange={(e) => setShelterName(e.target.value)}
                className="w-full px-3.5 py-2.5 clay-input text-xs font-medium text-slate-800"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi & Misi Rescue</label>
              <textarea
                rows={3}
                value={shelterDesc}
                onChange={(e) => setShelterDesc(e.target.value)}
                placeholder="Ceritakan latar belakang shelter, fasilitas penampungan, dan fokus rescue Anda..."
                className="w-full px-3.5 py-2.5 clay-input text-xs font-medium text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tautan Donasi Resmi (Kitabisa / Saweria / Web Resmi)
              </label>
              <input
                type="url"
                value={donationLink}
                onChange={(e) => setDonationLink(e.target.value)}
                placeholder="https://kitabisa.com/campaign/..."
                className="w-full px-3.5 py-2.5 clay-input text-xs font-medium text-slate-800"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Tautan donasi terverifikasi untuk membantu biaya operasional pakan dan medis anabul.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kebijakan Khusus Adopsi</label>
              <textarea
                rows={3}
                value={adoptionPolicy}
                onChange={(e) => setAdoptionPolicy(e.target.value)}
                placeholder="Contoh: Wajib komitmen sterilisasi pada usia 6 bulan, bersedia survey video call..."
                className="w-full px-3.5 py-2.5 clay-input text-xs font-medium text-slate-800"
              />
            </div>

            <button
              type="submit"
              disabled={updateSettingsMutation.isPending}
              className="py-3 px-6 rounded-xl clay-btn-primary text-white font-black text-xs shadow-md transition hover:scale-102"
            >
              {updateSettingsMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </form>
        </div>
      )}

      {/* MODAL: OPEN ADOPT (STRICTLY NON-COMMERCIAL) */}
      {showOpenAdoptModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="clay-card p-6 md:p-8 max-w-xl w-full my-8 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-lg text-slate-900">Buka Adopsi Anabul (Open Adopt)</h3>
                <p className="text-xs text-brand-700 font-bold">Program Adopsi Terbuka & Bebas Biaya</p>
              </div>
              <button
                onClick={() => setShowOpenAdoptModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleOpenAdoptSubmit} className="space-y-4 text-left">
              {/* Photo Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Foto Anabul (Maks. 5 Foto) *
                </label>
                <div className="grid grid-cols-4 gap-2 mb-1">
                  {previews.map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden clay-badge p-0.5 bg-white">
                      <img src={url} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center text-xs hover:bg-rose-600"
                      >
                        &times;
                      </button>
                    </div>
                  ))}

                  {selectedFiles.length < 5 && (
                    <label className="aspect-square rounded-xl clay-btn-secondary flex flex-col items-center justify-center cursor-pointer p-1 text-center">
                      <Camera className="w-6 h-6 text-brand-700 mb-1" />
                      <span className="text-[9px] font-bold text-slate-700">Upload Foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                {compressing && (
                  <p className="text-[10px] text-brand-700 font-bold flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Mengompres foto otomatis...
                  </p>
                )}
              </div>

              {/* Pet Type & Name */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Anabul *</label>
                  <select
                    value={petType}
                    onChange={(e: any) => setPetType(e.target.value)}
                    className="w-full px-3 py-2.5 clay-input text-xs font-bold text-slate-800"
                  >
                    <option value="cat">Kucing</option>
                    <option value="dog">Anjing</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Anabul / Judul Profil *</label>
                  <input
                    type="text"
                    placeholder="Contoh: Mochi - Kucing Calico Jinak Siap Adopsi"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 clay-input text-xs font-medium text-slate-800"
                    required
                  />
                </div>
              </div>

              {/* Age Group & Condition */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rentang Usia</label>
                  <select
                    value={ageGroup}
                    onChange={(e: any) => setAgeGroup(e.target.value)}
                    className="w-full px-3 py-2.5 clay-input text-xs font-bold text-slate-800"
                  >
                    <option value="kitten">Anakan / Kitten</option>
                    <option value="adult">Dewasa / Adult</option>
                    <option value="senior">Senior</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status Kesehatan *</label>
                  <select
                    value={condition}
                    onChange={(e: any) => setCondition(e.target.value)}
                    className="w-full px-3 py-2.5 clay-input text-xs font-bold text-slate-800"
                  >
                    <option value="healthy">Sehat & Steril/Vaksin</option>
                    <option value="injured">Pemulihan Pasca Rawat</option>
                    <option value="critical">Perawatan Khusus</option>
                  </select>
                </div>
              </div>

              {/* Character & Medical Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Karakter, Kebiasaan & Catatan Medis *
                </label>
                <textarea
                  rows={3}
                  placeholder="Ceritakan kepribadian anabul, riwayat vaksin, steril, pakan yang disukai, dan kriteria adopter yang dicari..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 clay-input text-xs font-medium text-slate-800"
                  required
                />
              </div>

              {/* Location Note (Shelter Area) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Patokan Area Shelter / Wilayah Penjemputan</label>
                <input
                  type="text"
                  placeholder="Contoh: Shelter Cilandak, Jakarta Selatan (Koordinat presisi disamarkan demi keamanan)"
                  value={addressNote}
                  onChange={(e) => setAddressNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 clay-input text-xs font-medium text-slate-800"
                />
              </div>

              {/* Integrity Pledge */}
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={nonCommercialPledge}
                    onChange={(e) => setNonCommercialPledge(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-brand-600 accent-brand-600 cursor-pointer shrink-0"
                    required
                  />
                  <span className="text-[11px] font-bold text-slate-800 leading-tight">
                    Saya menyatakan secara sadar bahwa anabul ini dibuka untuk <strong>Adopsi Bebas Biaya</strong> dan <strong>TIDAK DIPERJUALBELIKAN</strong>. Saya bersedia akun ditangguhkan secara permanen jika melanggar ketentuan ini.
                  </span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOpenAdoptModal(false)}
                  className="flex-1 py-3 clay-btn-secondary text-slate-700 font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={openAdoptMutation.isPending || compressing}
                  className="flex-1 py-3 clay-btn-primary text-white font-black text-xs shadow-md disabled:opacity-50"
                >
                  {openAdoptMutation.isPending ? 'Mempublikasikan...' : 'Publikasikan Open Adopt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
