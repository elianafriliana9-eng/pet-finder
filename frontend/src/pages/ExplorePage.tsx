import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../api/client';
import type { Report } from '../types';
import { MapView } from '../components/MapView';
import { SponsoredBanner } from '../components/SponsoredBanner';
import { useSEO } from '../hooks/useSEO';
import { fetchInAppRoute, type RouteData, type TravelMode } from '../utils/routing';
import { getDistanceMeters, speakInstruction } from '../utils/liveNavigation';
import {
  Navigation,
  Filter,
  Search,
  RefreshCw,
  AlertCircle,
  HeartHandshake,
  MapPin,
  ExternalLink,
  SlidersHorizontal,
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  X,
  Milestone,
  Route as RouteIcon,
  Play,
  Volume2,
  VolumeX,
  Car,
  Bike
} from 'lucide-react';

export const ExplorePage: React.FC = () => {
  useSEO({
    title: 'Jelajah Peta Anabul Terdekat',
    description: 'Peta spasial interaktif untuk memantau keberadaan kucing dan anjing jalanan terdekat, status street-feeding, dan profil adopsi shelter resmi.',
    url: 'https://streetpet.org/explore',
    keywords: 'peta anabul terdekat, rescue kucing jalanan, shelter anabul jakarta, adopsi hewan gratis',
  });

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [radius, setRadius] = useState(15);
  const [petType, setPetType] = useState<string>('');
  const [condition, setCondition] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [roleType, setRoleType] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // In-App & Live Navigation States
  const [activeRoute, setActiveRoute] = useState<RouteData | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [travelMode, setTravelMode] = useState<TravelMode>('car');
  const [useTollRoad, setUseTollRoad] = useState<boolean>(true);
  const [isLiveNavigating, setIsLiveNavigating] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [liveLocation, setLiveLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [remainingDistMeters, setRemainingDistMeters] = useState<number | undefined>(undefined);
  const [remainingDurationMins, setRemainingDurationMins] = useState<number | undefined>(undefined);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const watchIdRef = useRef<number | null>(null);
  const simTimerRef = useRef<any>(null);

  // Stop / Exit Navigation Helper
  const stopNavigation = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (simTimerRef.current) {
      clearInterval(simTimerRef.current);
      simTimerRef.current = null;
    }
    setIsLiveNavigating(false);
    setIsSimulating(false);
    setLiveLocation(null);
    setCurrentStepIndex(0);
  };

  // Start Real-World GPS Live Navigation
  const startLiveNavigation = () => {
    if (!activeRoute) return;
    if (!navigator.geolocation) {
      alert('Perangkat Anda tidak mendukung live GPS tracking.');
      return;
    }

    stopNavigation();
    setIsLiveNavigating(true);
    setIsSimulating(false);
    setCurrentStepIndex(0);
    setRemainingDistMeters(activeRoute.distanceMeters);
    setRemainingDurationMins(activeRoute.durationMinutes);

    // Initial voice instruction
    if (activeRoute.steps[0]) {
      speakInstruction(`Mulai navigasi ke lokasi anabul. ${activeRoute.steps[0].instruction}`, voiceEnabled);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const currentLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLiveLocation(currentLoc);

        // Check distance to destination
        if (selectedReport) {
          const distToDestination = getDistanceMeters(
            currentLoc.lat,
            currentLoc.lng,
            selectedReport.latitude,
            selectedReport.longitude
          );
          setRemainingDistMeters(Math.round(distToDestination));
          setRemainingDurationMins(Math.ceil(distToDestination / 500)); // approx walking/driving

          // Arrival detection (< 20 meters)
          if (distToDestination < 20) {
            speakInstruction('Anda telah tiba di titik lokasi anabul!', voiceEnabled);
            alert('🎉 Anda telah tiba di titik lokasi anabul!');
            stopNavigation();
          }
        }
      },
      (err) => {
        console.warn('Geolocation watch error:', err);
      },
      { enableHighAccuracy: true, maximumAge: 1000 }
    );
  };

  // Start Simulation Route (For Testing / Demo)
  const startSimulation = () => {
    if (!activeRoute || activeRoute.coordinates.length === 0) return;

    stopNavigation();
    setIsLiveNavigating(true);
    setIsSimulating(true);

    const coords = activeRoute.coordinates;
    let stepIdx = 0;
    let coordIdx = 0;

    setLiveLocation({ lat: coords[0][0], lng: coords[0][1] });
    setRemainingDistMeters(activeRoute.distanceMeters);
    setRemainingDurationMins(activeRoute.durationMinutes);

    if (activeRoute.steps[0]) {
      speakInstruction(`Mulai simulasi navigasi. ${activeRoute.steps[0].instruction}`, voiceEnabled);
    }

    simTimerRef.current = setInterval(() => {
      coordIdx += 1;
      if (coordIdx >= coords.length) {
        // Arrived
        speakInstruction('Simulasi selesai. Anda telah tiba di titik lokasi anabul!', voiceEnabled);
        alert('🎉 Simulasi navigasi selesai! Anda tiba di tujuan.');
        stopNavigation();
        return;
      }

      const nextCoord = coords[coordIdx];
      setLiveLocation({ lat: nextCoord[0], lng: nextCoord[1] });

      // Update remaining distance
      if (selectedReport) {
        const dist = getDistanceMeters(nextCoord[0], nextCoord[1], selectedReport.latitude, selectedReport.longitude);
        setRemainingDistMeters(Math.round(dist));
        setRemainingDurationMins(Math.ceil(dist / 600));
      }

      // Check step advancement
      const progressFraction = coordIdx / coords.length;
      const calculatedStep = Math.min(
        Math.floor(progressFraction * activeRoute.steps.length),
        activeRoute.steps.length - 1
      );
      if (calculatedStep !== stepIdx) {
        stepIdx = calculatedStep;
        setCurrentStepIndex(stepIdx);
        if (activeRoute.steps[stepIdx]) {
          speakInstruction(activeRoute.steps[stepIdx].instruction, voiceEnabled);
        }
      }
    }, 700); // Move every 700ms
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopNavigation();
    };
  }, []);

  // Core route fetcher with custom options
  const calculateRouteWithSettings = async (
    report: Report,
    mode: TravelMode = travelMode,
    toll: boolean = useTollRoad
  ) => {
    let origin = userLocation;
    if (!origin) {
      if (!navigator.geolocation) {
        alert('Browser tidak mendukung geolokasi GPS.');
        return;
      }
      setLocating(true);
      try {
        const pos: GeolocationPosition = await new Promise((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true, timeout: 8000 })
        );
        origin = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(origin);
      } catch (e) {
        origin = { lat: -6.2088, lng: 106.8456 };
        setUserLocation(origin);
      } finally {
        setLocating(false);
      }
    }

    if (!origin) return;

    setLoadingRoute(true);
    const result = await fetchInAppRoute(
      origin,
      { lat: report.latitude, lng: report.longitude },
      { mode, useToll: toll }
    );
    setLoadingRoute(false);

    if (result) {
      setActiveRoute(result);
    } else {
      alert('Tidak dapat menghitung rute jalan ke titik lokasi ini.');
    }
  };

  // Calculate In-App Route
  const handleFindRoute = async (report: Report) => {
    // If route already active for this report, toggle off
    if (activeRoute) {
      stopNavigation();
      setActiveRoute(null);
      return;
    }
    await calculateRouteWithSettings(report, travelMode, useTollRoad);
  };

  // Handle Changing Travel Mode (Car vs Motorcycle)
  const handleChangeTravelMode = async (newMode: TravelMode) => {
    setTravelMode(newMode);
    if (selectedReport && activeRoute) {
      stopNavigation();
      await calculateRouteWithSettings(selectedReport, newMode, useTollRoad);
    }
  };

  // Handle Toggling Toll Road for Car
  const handleToggleTollRoad = async () => {
    const newToll = !useTollRoad;
    setUseTollRoad(newToll);
    if (selectedReport && activeRoute) {
      stopNavigation();
      await calculateRouteWithSettings(selectedReport, 'car', newToll);
    }
  };

  // Request HTML5 Geolocation
  const requestLocation = () => {
    if (!navigator.geolocation) {
      alert('Browser tidak mendukung geolokasi');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocating(false);
      },
      () => {
        // Default Jakarta center fallback
        setUserLocation({ lat: -6.2088, lng: 106.8456 });
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['reports', userLocation, radius, petType, condition, status, roleType, search],
    queryFn: async () => {
      const params: any = {
        radius,
      };
      if (userLocation) {
        params.lat = userLocation.lat;
        params.lng = userLocation.lng;
      }
      if (petType) params.pet_type = petType;
      if (condition) params.condition = condition;
      if (status) params.status = status;
      if (roleType) params.role_type = roleType;
      if (search) params.search = search;

      const res = await api.get('/reports', { params });
      return res.data.data;
    },
    staleTime: 30000,
  });

  const reports: Report[] = data?.data || [];

  // Update selectedReport if reports change or report is not found
  useEffect(() => {
    if (selectedReport) {
      const updated = reports.find((r) => r.id === selectedReport.id);
      if (updated) {
        setSelectedReport(updated);
      }
    }
  }, [reports]);

  const formatDistance = (meters?: number) => {
    if (meters === undefined || meters === null) return null;
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const getConditionBadge = (cond: string) => {
    switch (cond) {
      case 'critical':
        return (
          <span className="px-2 py-0.5 rounded-md bg-rose-500 text-white text-[11px] font-black flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Darurat
          </span>
        );
      case 'injured':
        return (
          <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[11px] font-bold">
            Terluka
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[11px] font-bold">
            Sehat
          </span>
        );
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'available':
        return <span className="px-2 py-0.5 rounded-md bg-brand-100 text-brand-800 text-[10px] font-bold">Tersedia</span>;
      case 'screening':
        return <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold">Skrining</span>;
      case 'rescued':
        return <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 text-[10px] font-bold">Di Shelter</span>;
      case 'adopted':
        return <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 text-[10px] font-bold">Diadopsi</span>;
      default:
        return null;
    }
  };

  // Quick Filter Chip Handler
  const handleQuickFilter = (type: string, value: string) => {
    if (type === 'all') {
      setPetType('');
      setCondition('');
      setStatus('');
      setRoleType('');
    } else if (type === 'pet_type') {
      setPetType(petType === value ? '' : value);
    } else if (type === 'condition') {
      setCondition(condition === value ? '' : value);
    } else if (type === 'status') {
      setStatus(status === value ? '' : value);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 md:py-5 pb-24 md:pb-12">
      {/* YouTube Style Top Filter Chips & Search Bar */}
      <div className="mb-4 space-y-2.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari anabul, patokan jalan, atau deskripsi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 clay-input text-xs font-semibold text-slate-800 placeholder-slate-400"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Actions Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={requestLocation}
              disabled={locating}
              className="px-3.5 py-2 clay-btn-secondary text-xs font-bold text-slate-700 flex items-center gap-1.5 transition"
              title="Perbarui GPS saya"
            >
              <Navigation className={`w-3.5 h-3.5 text-brand-700 ${locating ? 'animate-spin' : ''}`} />
              <span className="text-xs">Lokasi Saya</span>
            </button>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 transition rounded-xl ${
                showFilters || petType || condition || status || roleType
                  ? 'clay-btn-primary text-white'
                  : 'clay-btn-secondary text-slate-700'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filter Detail</span>
            </button>

            <button
              onClick={() => refetch()}
              disabled={isRefetching}
              className="p-2 clay-btn-secondary text-slate-700 hover:text-brand-700 transition"
              title="Refresh data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin text-brand-700' : ''}`} />
            </button>
          </div>
        </div>

        {/* YouTube Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar text-xs font-bold">
          <button
            onClick={() => handleQuickFilter('all', '')}
            className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              !petType && !condition && !status
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Semua Anabul
          </button>
          <button
            onClick={() => handleQuickFilter('pet_type', 'cat')}
            className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              petType === 'cat'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Kucing
          </button>
          <button
            onClick={() => handleQuickFilter('pet_type', 'dog')}
            className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              petType === 'dog'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Anjing
          </button>
          <button
            onClick={() => handleQuickFilter('condition', 'critical')}
            className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              condition === 'critical'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            Darurat / Kritis
          </button>
          <button
            onClick={() => handleQuickFilter('condition', 'injured')}
            className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              condition === 'injured'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            Terluka
          </button>
          <button
            onClick={() => handleQuickFilter('condition', 'healthy')}
            className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              condition === 'healthy'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Sehat
          </button>
          <button
            onClick={() => handleQuickFilter('status', 'available')}
            className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              status === 'available'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Siap Diadopsi
          </button>
        </div>

        {/* Expandable Advanced Filters Panel */}
        {showFilters && (
          <div className="clay-card p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 animate-in fade-in duration-150">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Radius Pencarian:</span>
                <span className="text-brand-700 font-black">{radius} km</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full accent-brand-500 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Hewan</label>
              <select
                value={petType}
                onChange={(e) => setPetType(e.target.value)}
                className="w-full px-3 py-1.5 clay-input text-xs font-medium text-slate-700"
              >
                <option value="">Semua Hewan</option>
                <option value="cat">Kucing</option>
                <option value="dog">Anjing</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kondisi Fisik</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-3 py-1.5 clay-input text-xs font-medium text-slate-700"
              >
                <option value="">Semua Kondisi</option>
                <option value="critical">Darurat / Kritis</option>
                <option value="injured">Terluka</option>
                <option value="healthy">Sehat</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status Laporan</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-1.5 clay-input text-xs font-medium text-slate-700"
              >
                <option value="">Semua Status</option>
                <option value="available">Tersedia</option>
                <option value="screening">Dalam Skrining</option>
                <option value="rescued">Diamankan Shelter</option>
                <option value="adopted">Berhasil Diadopsi</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area - YouTube Watch Page Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 xl:gap-6 items-start">
        {/* Left Column: YouTube Video Player Style (Map View & Details) */}
        <div className="lg:col-span-8 xl:col-span-8 flex flex-col gap-4">
          {/* Main Map "Player" Container */}
          <div className="w-full h-[450px] sm:h-[480px] lg:h-[540px] xl:h-[580px] relative rounded-2xl md:rounded-3xl overflow-hidden shadow-lg border border-slate-200">
            {isLoading ? (
              <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center p-6 text-center">
                <RefreshCw className="w-8 h-8 text-brand-500 animate-spin mb-3" />
                <p className="text-sm font-bold text-slate-700">Memuat peta dan mendeteksi anabul...</p>
              </div>
            ) : (
              <>
                <MapView
                  reports={reports}
                  userLocation={userLocation}
                  selectedReport={selectedReport}
                  routeData={activeRoute}
                  travelMode={travelMode}
                  useTollRoad={useTollRoad}
                  isLiveNavigating={isLiveNavigating}
                  isSimulating={isSimulating}
                  liveLocation={liveLocation}
                  currentStepIndex={currentStepIndex}
                  remainingDistanceMeters={remainingDistMeters}
                  remainingDurationMinutes={remainingDurationMins}
                  voiceEnabled={voiceEnabled}
                  onMarkerClick={(report) => {
                    setSelectedReport(report);
                    if (activeRoute) {
                      stopNavigation();
                      setActiveRoute(null);
                    }
                  }}
                  onClearRoute={() => {
                    stopNavigation();
                    setActiveRoute(null);
                  }}
                  onChangeTravelMode={handleChangeTravelMode}
                  onToggleTollRoad={handleToggleTollRoad}
                  onStartLiveNav={startLiveNavigation}
                  onStartSimulation={startSimulation}
                  onStopNavigation={stopNavigation}
                  onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
                />

                {/* Floating Map Status Overlay */}
                <div className="absolute top-3 left-3 z-[400] flex items-center gap-2 pointer-events-none">
                  <div className="px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-md text-[11px] font-black text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>{reports.length} Anabul di Radius {radius} km</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* YouTube Video Metadata Player Style: Selected Report Details */}
          {selectedReport ? (
            <div className="clay-card p-4 sm:p-5 animate-in fade-in-50 duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {getConditionBadge(selectedReport.condition)}
                    {getStatusBadge(selectedReport.status)}
                    <span className="text-xs text-slate-400 font-bold">
                      {selectedReport.pet_type === 'cat' ? 'Kucing Jalanan' : 'Anjing Jalanan'}
                    </span>
                  </div>

                  <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                    {selectedReport.title}
                  </h2>

                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    <span>{selectedReport.address_note || 'Lokasi jalanan'}</span>
                    {selectedReport.distance_meters !== undefined && (
                      <span className="font-bold text-brand-700">
                        • {formatDistance(selectedReport.distance_meters)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={`/reports/${selectedReport.id}`}
                    className="px-4 py-2.5 rounded-xl clay-btn-primary text-white text-xs font-black flex items-center gap-1.5 shadow-md"
                  >
                    <span>
                      {selectedReport.managed_by_shelter_id || selectedReport.is_masked ? 'Lihat & Ajukan Adopsi' : 'Lihat & Rescue / Bantu'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={() => handleFindRoute(selectedReport)}
                    disabled={loadingRoute}
                    className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                      activeRoute
                        ? 'clay-btn-primary text-white bg-blue-600 shadow-md'
                        : 'clay-btn-secondary text-slate-700 hover:text-blue-700'
                    }`}
                    title={activeRoute ? 'Tutup Rute Navigasi' : 'Cari Rute Langsung di Peta'}
                  >
                    {loadingRoute ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    ) : (
                      <Compass className="w-3.5 h-3.5 text-blue-600" />
                    )}
                    <span>{activeRoute ? 'Tutup Rute' : 'Tampilkan Rute'}</span>
                  </button>
                </div>
              </div>

              {/* Description & Check-in Details */}
              <div className="mt-3.5 pt-3.5 border-t border-slate-100 text-xs text-slate-600 leading-relaxed space-y-2">
                <p>{selectedReport.description || 'Laporan penemuan hewan jalanan yang membutuhkan adopter atau pertolongan warga sekitar.'}</p>

                {selectedReport.latest_activity && (
                  <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-100 text-xs text-amber-900 font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>Aktivitas Terakhir:</strong> {selectedReport.latest_activity.activity_type === 'fed' ? 'Baru saja diberi makan' : 'Terpantau di lokasi'} oleh {selectedReport.latest_activity.user?.name || 'Warga'} ({new Date(selectedReport.latest_activity.created_at).toLocaleDateString('id-ID')})
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="clay-card p-4 sm:p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-brand-100 flex items-center justify-center shrink-0 text-brand-700">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
                    Jaringan Peduli Anabul Jalanan (People to People)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Klik salah satu pin di peta atau pilih kartu di samping untuk memfokuskan lokasi, melihat riwayat makan, atau melakukan adopsi.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: YouTube "Up Next" Style Recommended/Nearest Pet List */}
        <div className="lg:col-span-4 xl:col-span-4 flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <h2 className="font-black text-base text-slate-900">Anabul Terdekat</h2>
              <span className="px-2 py-0.5 rounded-full bg-brand-100 text-brand-800 text-[11px] font-black">
                {reports.length}
              </span>
            </div>
            <span className="text-[11px] font-bold text-slate-400">Radius {radius} km</span>
          </div>

          {/* Scrollable Pet List Container */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="clay-card p-3 animate-pulse flex gap-3 h-28">
                  <div className="w-28 bg-slate-200 rounded-xl shrink-0"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : reports.length === 0 ? (
            <div className="clay-card p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-800">Tidak ada anabul ditemukan</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Coba perbesar radius atau ubah filter pencarian.
                </p>
              </div>
              <button
                onClick={() => setRadius(35)}
                className="px-4 py-2 rounded-xl bg-brand-500 text-white font-bold text-xs hover:bg-brand-600 transition shadow-sm"
              >
                Perbesar Radius ke 35 km
              </button>
            </div>
          ) : (
            <div className="space-y-2.5 lg:max-h-[calc(100vh-170px)] lg:overflow-y-auto pr-1">
              {reports.map((report) => {
                const isSelected = selectedReport?.id === report.id;
                const primaryImage = report.images?.find((img) => img.is_primary)?.thumbnail_url ||
                  report.images?.[0]?.thumbnail_url ||
                  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=300&auto=format&fit=crop&q=60';

                return (
                  <div
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className={`group cursor-pointer rounded-2xl p-2.5 transition-all duration-200 flex gap-3 border ${
                      isSelected
                        ? 'bg-brand-50/90 border-brand-500 shadow-md ring-2 ring-brand-300'
                        : 'clay-card hover:border-brand-300 hover:shadow-sm'
                    }`}
                  >
                    {/* YouTube Style Thumbnail with Timestamp-like Distance Badge */}
                    <div className="relative w-28 sm:w-32 aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 shrink-0">
                      <img
                        src={primaryImage}
                        alt={report.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {/* Distance Badge (YouTube duration badge style) */}
                      {report.distance_meters !== undefined && (
                        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-xs text-white text-[10px] font-black">
                          {formatDistance(report.distance_meters)}
                        </div>
                      )}
                      {/* Pet Type Badge */}
                      <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-white/90 backdrop-blur-xs text-slate-800 text-[10px] font-black uppercase">
                        {report.pet_type === 'cat' ? 'Kucing' : 'Anjing'}
                      </div>
                    </div>

                    {/* YouTube Style Video Metadata Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          {getConditionBadge(report.condition)}
                          {getStatusBadge(report.status)}
                        </div>

                        <h3 className={`font-black text-xs sm:text-sm line-clamp-2 leading-snug transition-colors ${
                          isSelected ? 'text-brand-900' : 'text-slate-800 group-hover:text-brand-700'
                        }`}>
                          {report.title}
                        </h3>

                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1 font-medium">
                          <MapPin className="w-3 h-3 text-brand-600 shrink-0" />
                          <span className="truncate">{report.address_note || 'Lokasi jalanan'}</span>
                        </div>
                      </div>

                      {/* Bottom row: Check-in / Details Action */}
                      <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 truncate">
                          {report.latest_activity ? 'Ada update makan' : 'Siap dicek'}
                        </span>

                        <Link
                          to={`/reports/${report.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[11px] font-black text-brand-700 hover:text-brand-800 flex items-center gap-0.5 hover:underline shrink-0"
                        >
                          <span>Detail</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Sponsored Partner Banner */}
          <SponsoredBanner placement="explore_sidebar" className="mt-4" />
        </div>
      </div>
    </div>
  );
};

