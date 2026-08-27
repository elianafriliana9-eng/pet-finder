import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Report } from '../types';
import type { RouteData, TravelMode } from '../utils/routing';
import { getManeuverType } from '../utils/liveNavigation';
import { Link } from 'react-router-dom';
import {
  MapPin, ExternalLink, Navigation, Compass, X, ChevronDown, ChevronUp,
  Clock, Milestone, Volume2, VolumeX, ArrowUp, CornerUpLeft, CornerUpRight,
  CornerLeftUp, CornerRightUp, RotateCcw, CheckCircle2, Play, Square,
  Car, Bike, Settings2
} from 'lucide-react';

interface MapViewProps {
  reports: Report[];
  userLocation: { lat: number; lng: number } | null;
  selectedReport?: Report | null;
  routeData?: RouteData | null;
  travelMode?: TravelMode;
  useTollRoad?: boolean;
  isLiveNavigating?: boolean;
  isSimulating?: boolean;
  liveLocation?: { lat: number; lng: number } | null;
  currentStepIndex?: number;
  remainingDistanceMeters?: number;
  remainingDurationMinutes?: number;
  voiceEnabled?: boolean;
  onMarkerClick?: (report: Report) => void;
  onClearRoute?: () => void;
  onChangeTravelMode?: (mode: TravelMode) => void;
  onToggleTollRoad?: () => void;
  onStartLiveNav?: () => void;
  onStartSimulation?: () => void;
  onStopNavigation?: () => void;
  onToggleVoice?: () => void;
}

// Custom Leaflet DivIcon
const createPetIcon = (type: 'cat' | 'dog', isMasked: boolean, isSelected: boolean) => {
  const label = type === 'cat' ? 'Kucing' : 'Anjing';
  const bgColor = isSelected 
    ? 'bg-rose-500 ring-4 ring-rose-300 scale-125 z-50' 
    : isMasked 
    ? 'bg-indigo-600 ring-2 ring-indigo-200' 
    : 'bg-brand-500 ring-2 ring-brand-200';

  const svgIcon = type === 'cat'
    ? `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21s-9-3.1-9-7.56c0-1.25.5-2.4 1-3.44 0 0-1.89-6.42-.5-7 1.39-.58 4.72.26 6.5 2.26.65-.17 1.33-.26 2-.26z"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.8 1.97 2.5 2.5.38.29.6 1.03.6 1.5v4a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-4c0-.47.22-1.21.6-1.5.7-.53 2.42-1.8 2.5-2.5.11-.994-1.177-6.53-4-7-1.923-.321-3.5.782-3.5 2.172"/></svg>`;

  return L.divIcon({
    className: `custom-map-pin ${isSelected ? 'is-active-pin' : ''}`,
    html: `<div class="${bgColor} text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${isSelected ? 'animate-bounce' : 'hover:scale-110'}" title="${label}">${svgIcon}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const UserLocationIcon = L.divIcon({
  className: 'user-pin',
  html: `<div class="w-7 h-7 rounded-full bg-blue-600 border-2 border-white shadow-xl ring-4 ring-blue-500/40 flex items-center justify-center text-white"><div class="w-2.5 h-2.5 rounded-full bg-white animate-ping"></div></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// Map Controller for smooth pan/zoom, auto-follow in live navigation, and fitting route bounds
const MapController: React.FC<{
  selectedReport?: Report | null;
  routeData?: RouteData | null;
  isLiveNavigating?: boolean;
  liveLocation?: { lat: number; lng: number } | null;
}> = ({ selectedReport, routeData, isLiveNavigating, liveLocation }) => {
  const map = useMap();
  const prevSelectedId = useRef<number | null>(null);

  // 1. Live Navigation Auto-Follow mode
  useEffect(() => {
    if (isLiveNavigating && liveLocation) {
      map.setView([liveLocation.lat, liveLocation.lng], 17, { animate: true });
    }
  }, [isLiveNavigating, liveLocation, map]);

  // 2. Fit route polyline bounds when route calculated
  useEffect(() => {
    if (!isLiveNavigating && routeData && routeData.coordinates.length > 1) {
      const bounds = L.latLngBounds(routeData.coordinates);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [routeData, isLiveNavigating, map]);

  // 3. Pan to selected report marker if no route
  useEffect(() => {
    if (!routeData && !isLiveNavigating && selectedReport && selectedReport.id !== prevSelectedId.current) {
      prevSelectedId.current = selectedReport.id;
      map.flyTo([selectedReport.latitude, selectedReport.longitude], 15, {
        duration: 0.8,
      });
    }
  }, [selectedReport, routeData, isLiveNavigating, map]);

  return null;
};

// Render maneuver icon based on instruction type
const renderManeuverIcon = (instruction: string) => {
  const type = getManeuverType(instruction);
  switch (type) {
    case 'turn-left':
    case 'sharp-left':
      return <CornerUpLeft className="w-7 h-7 text-white" />;
    case 'turn-right':
    case 'sharp-right':
      return <CornerUpRight className="w-7 h-7 text-white" />;
    case 'slight-left':
      return <CornerLeftUp className="w-7 h-7 text-white" />;
    case 'slight-right':
      return <CornerRightUp className="w-7 h-7 text-white" />;
    case 'uturn':
      return <RotateCcw className="w-7 h-7 text-white" />;
    case 'arrive':
      return <CheckCircle2 className="w-7 h-7 text-emerald-300" />;
    default:
      return <ArrowUp className="w-7 h-7 text-white" />;
  }
};

export const MapView: React.FC<MapViewProps> = ({
  reports,
  userLocation,
  selectedReport,
  routeData,
  travelMode = 'car',
  useTollRoad = true,
  isLiveNavigating = false,
  isSimulating = false,
  liveLocation = null,
  currentStepIndex = 0,
  remainingDistanceMeters,
  remainingDurationMinutes,
  voiceEnabled = true,
  onMarkerClick,
  onClearRoute,
  onChangeTravelMode,
  onToggleTollRoad,
  onStartLiveNav,
  onStartSimulation,
  onStopNavigation,
  onToggleVoice,
}) => {
  const [showSteps, setShowSteps] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  const activePosition = isLiveNavigating && liveLocation ? liveLocation : userLocation;

  const defaultCenter: [number, number] = activePosition
    ? [activePosition.lat, activePosition.lng]
    : reports.length > 0
    ? [reports[0].latitude, reports[0].longitude]
    : [-6.2088, 106.8456]; // Jakarta Default

  const currentStep = routeData?.steps[currentStepIndex] || routeData?.steps[0];
  const formattedRemainingDist =
    remainingDistanceMeters !== undefined
      ? remainingDistanceMeters >= 1000
        ? (remainingDistanceMeters / 1000).toFixed(1) + ' km'
        : `${remainingDistanceMeters} m`
      : routeData?.distanceKm;

  const formattedRemainingDuration =
    remainingDurationMinutes !== undefined
      ? remainingDurationMinutes >= 60
        ? `${Math.floor(remainingDurationMinutes / 60)} jam ${remainingDurationMinutes % 60} mnt`
        : `${remainingDurationMinutes} mnt`
      : routeData?.durationFormatted;

  return (
    <div className="w-full h-full rounded-2xl md:rounded-3xl overflow-hidden border border-slate-200 shadow-md relative bg-slate-100">
      {/* ========================================================================= */}
      {/* 1. TOP-RIGHT CLEAR ROUTE BUTTON (MOBILE & DESKTOP ACCESSIBLE)              */}
      {/* ========================================================================= */}
      {routeData && !isLiveNavigating && onClearRoute && (
        <button
          onClick={onClearRoute}
          className="absolute top-3 right-3 z-1000 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white shadow-lg backdrop-blur-md transition flex items-center gap-1 text-xs font-bold"
          title="Tutup Rute"
        >
          <X className="w-4 h-4" />
          <span className="hidden sm:inline">Tutup Rute</span>
        </button>
      )}

      {/* ========================================================================= */}
      {/* 2. LIVE NAVIGATION HUD HEADER BAR (COMPACT & MODERN)                       */}
      {/* ========================================================================= */}
      {isLiveNavigating && currentStep && (
        <div className="absolute top-2.5 left-2.5 right-2.5 z-1000 animate-in slide-in-from-top-3 duration-300">
          <div className="clay-card p-3 bg-emerald-800 text-white shadow-2xl rounded-2xl border-2 border-emerald-500/80 flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/90 border border-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                {renderManeuverIcon(currentStep.instruction)}
              </div>
              <div className="text-left leading-tight min-w-0">
                <div className="flex items-center gap-1.5 text-emerald-200 text-[10px] font-black uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    {travelMode === 'motorcycle' ? <Bike className="w-3 h-3" /> : <Car className="w-3 h-3" />}
                    {currentStep.distance} m lagi
                  </span>
                  {isSimulating && (
                    <span className="px-1 py-0.2 rounded bg-amber-400 text-slate-950 text-[8px] font-black">
                      Simulasi
                    </span>
                  )}
                </div>
                <h3 className="font-display text-xs sm:text-sm font-black text-white mt-0.5 truncate">
                  {currentStep.instruction}
                </h3>
              </div>
            </div>

            <button
              onClick={onToggleVoice}
              className={`p-1.5 rounded-xl border transition shrink-0 ${
                voiceEnabled
                  ? 'bg-emerald-600 text-white border-emerald-400'
                  : 'bg-emerald-950 text-emerald-400 border-emerald-900'
              }`}
              title={voiceEnabled ? 'Matikan Suara' : 'Aktifkan Suara'}
            >
              {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. LIVE NAVIGATION BOTTOM BAR (ETA & EXIT BUTTON)                         */}
      {/* ========================================================================= */}
      {isLiveNavigating && (
        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-1000 animate-in slide-in-from-bottom-3 duration-300">
          <div className="clay-card p-2.5 bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl border border-emerald-500/60 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-left">
              <div className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-900 text-xs font-black flex items-center gap-1 shrink-0">
                <Clock className="w-3 h-3 text-emerald-600" />
                <span>{formattedRemainingDuration}</span>
              </div>
              <div className="text-xs font-black text-slate-800 truncate">
                <span className="text-slate-400 text-[10px]">Sisa: </span>
                <span className="text-brand-700">{formattedRemainingDist}</span>
              </div>
            </div>

            <button
              onClick={onStopNavigation}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center gap-1 transition shadow-sm shrink-0"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. RESPONSIVE IN-APP ROUTE PANEL (COMPACT MOBILE DRAWER / DESKTOP FLOATING)*/}
      {/* ========================================================================= */}
      {!isLiveNavigating && routeData && (
        <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-auto sm:top-3 sm:left-3 sm:right-auto sm:max-w-xs z-1000 animate-in slide-in-from-bottom-3 sm:slide-in-from-top-3 duration-200">
          <div className="clay-card p-3 sm:p-3.5 bg-white/95 backdrop-blur-md border-2 border-blue-400/80 shadow-2xl rounded-2xl space-y-2 text-left">
            
            {/* Header: Compact on Mobile, Full on Desktop */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {/* Distance & Duration Mini Chips */}
                <div className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-900 text-xs font-black flex items-center gap-1">
                  <Milestone className="w-3 h-3 text-blue-600" />
                  <span>{routeData.distanceKm}</span>
                </div>
                <div className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-900 text-xs font-black flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-600" />
                  <span>± {routeData.durationFormatted}</span>
                </div>
              </div>

              {/* Mobile Expand / Collapse Trigger */}
              <button
                onClick={() => setIsMobileExpanded(!isMobileExpanded)}
                className="sm:hidden p-1 rounded-lg text-slate-500 hover:bg-slate-100 transition flex items-center gap-0.5 text-[10px] font-bold"
              >
                <span>{isMobileExpanded ? 'Tutup' : 'Opsi'}</span>
                {isMobileExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Mode & Action Area (Always visible on desktop, expandable on mobile) */}
            <div className={`space-y-2 ${isMobileExpanded ? 'block' : 'hidden sm:block'}`}>
              {/* Transport Mode Selector (Car vs Motorcycle) */}
              <div className="grid grid-cols-2 gap-1 p-0.5 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  onClick={() => onChangeTravelMode && onChangeTravelMode('car')}
                  className={`py-1 px-2 rounded-lg text-[11px] font-black flex items-center justify-center gap-1 transition ${
                    travelMode === 'car'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Car className="w-3 h-3" />
                  <span>Mobil</span>
                </button>

                <button
                  onClick={() => onChangeTravelMode && onChangeTravelMode('motorcycle')}
                  className={`py-1 px-2 rounded-lg text-[11px] font-black flex items-center justify-center gap-1 transition ${
                    travelMode === 'motorcycle'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Bike className="w-3 h-3" />
                  <span>Motor</span>
                </button>
              </div>

              {/* Toll Option for Car Only */}
              {travelMode === 'car' && (
                <div className="px-2 py-1 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center justify-between gap-1.5">
                  <label className="text-[10px] font-bold text-blue-900 flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useTollRoad}
                      onChange={() => onToggleTollRoad && onToggleTollRoad()}
                      className="w-3 h-3 text-blue-600 rounded accent-blue-600 cursor-pointer"
                    />
                    <span>Gunakan Tol</span>
                  </label>
                  <span className="text-[8px] font-extrabold uppercase px-1 py-0.2 rounded bg-blue-200/60 text-blue-800">
                    {useTollRoad ? 'Tol' : 'Non-Tol'}
                  </span>
                </div>
              )}
            </div>

            {/* Live Navigation CTA Buttons */}
            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              <button
                onClick={onStartLiveNav}
                className="w-full py-1.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black flex items-center justify-center gap-1 shadow-sm transition"
              >
                <Navigation className="w-3 h-3 fill-current" />
                <span>Mulai Nav</span>
              </button>

              <button
                onClick={onStartSimulation}
                className="w-full py-1.5 px-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black flex items-center justify-center gap-1 shadow-sm transition"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Simulasi</span>
              </button>
            </div>

            {/* Turn-by-Turn Steps Toggle (Hidden in compact mobile, visible if expanded) */}
            {routeData.steps.length > 0 && isMobileExpanded && (
              <div className="pt-1 border-t border-slate-100 sm:block">
                <button
                  onClick={() => setShowSteps(!showSteps)}
                  className="w-full flex items-center justify-between text-[10px] font-bold text-slate-600 hover:text-slate-900 py-0.5"
                >
                  <span>Panduan Belokan ({routeData.steps.length} langkah)</span>
                  {showSteps ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                {showSteps && (
                  <div className="max-h-32 overflow-y-auto mt-1 space-y-1 pr-1 text-[10px]">
                    {routeData.steps.map((step, idx) => (
                      <div key={idx} className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-1">
                        <span className="w-3.5 h-3.5 rounded-full bg-blue-100 text-blue-800 text-[8px] font-black flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800 leading-tight truncate">{step.instruction}</p>
                          <p className="text-[9px] text-slate-400">{step.distance} m</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. LEAFLET MAP CONTAINER                                                  */}
      {/* ========================================================================= */}
      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController
          selectedReport={selectedReport}
          routeData={routeData}
          isLiveNavigating={isLiveNavigating}
          liveLocation={liveLocation}
        />

        {/* IN-APP ROUTE POLYLINES */}
        {routeData && (
          <>
            {/* Outer Glow Line */}
            <Polyline
              positions={routeData.coordinates}
              pathOptions={{
                color: travelMode === 'motorcycle' ? '#34d399' : '#60a5fa',
                weight: 9,
                opacity: 0.5,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            {/* Main Driving Path */}
            <Polyline
              positions={routeData.coordinates}
              pathOptions={{
                color: isLiveNavigating
                  ? '#059669'
                  : travelMode === 'motorcycle'
                  ? '#059669'
                  : '#2563eb',
                weight: 5,
                opacity: 0.95,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </>
        )}

        {/* Current Active / Live Position Marker */}
        {activePosition && (
          <Marker position={[activePosition.lat, activePosition.lng]} icon={UserLocationIcon}>
            <Popup>
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 p-1">
                <Navigation className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />
                <span>{isLiveNavigating ? 'Posisi Navigasi Anda' : 'Posisi Anda Saat Ini'}</span>
              </div>
            </Popup>
          </Marker>
        )}

        {reports.map((report) => {
          const isSelected = selectedReport?.id === report.id;
          const primaryImg = report.images?.[0]?.thumbnail_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=300&auto=format&fit=crop&q=60';

          return (
            <Marker
              key={report.id}
              position={[report.latitude, report.longitude]}
              icon={createPetIcon(report.pet_type, report.is_masked, isSelected)}
              zIndexOffset={isSelected ? 1000 : 1}
              eventHandlers={{
                click: () => onMarkerClick && onMarkerClick(report),
              }}
            >
              <Popup className="pet-popup" autoPan={false}>
                <div className="w-56 p-1">
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-2 bg-slate-100">
                    <img
                      src={primaryImg}
                      alt={report.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1.5 left-1.5 flex gap-1">
                      <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-white">
                        {report.pet_type === 'cat' ? 'Kucing' : 'Anjing'}
                      </span>
                    </div>
                  </div>

                  <h4 className="font-extrabold text-sm text-slate-900 line-clamp-1 leading-snug">
                    {report.title}
                  </h4>

                  <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1 mb-2">
                    <MapPin className="w-3 h-3 text-brand-600 shrink-0" />
                    <span className="truncate">{report.address_note || 'Lokasi jalanan'}</span>
                  </div>

                  <Link
                    to={`/reports/${report.id}`}
                    className="w-full py-1.5 px-3 rounded-xl clay-btn-primary text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <span>Buka Info Detail</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
