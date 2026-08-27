export type TravelMode = 'car' | 'motorcycle';

export interface RouteOptions {
  mode: TravelMode;
  useToll?: boolean; // For car: true = allowed/preferred toll, false = avoid toll
}

export interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
  name: string;
  isToll?: boolean;
}

export interface RouteData {
  coordinates: [number, number][]; // [lat, lng] array for Leaflet Polyline
  distanceMeters: number;
  distanceKm: string;
  durationMinutes: number;
  durationFormatted: string;
  steps: RouteStep[];
  mode: TravelMode;
  useToll: boolean;
  hasTolls: boolean;
}

export async function fetchInAppRoute(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number },
  options: RouteOptions = { mode: 'car', useToll: true }
): Promise<RouteData | null> {
  try {
    const { mode, useToll = true } = options;
    const shouldAvoidTolls = mode === 'motorcycle' || (mode === 'car' && !useToll);

    // Primary routing endpoint based on toll avoidance
    // routed-car: optimizes for highways/tolls
    // routed-bike: strictly avoids motorways/tolls (navigates arterial & local roads)
    const primaryHost = shouldAvoidTolls
      ? 'https://routing.openstreetmap.de/routed-bike/route/v1/driving'
      : 'https://routing.openstreetmap.de/routed-car/route/v1/driving';

    const fallbackHost = 'https://router.project-osrm.org/route/v1/driving';

    const queryParams = '?overview=full&geometries=geojson&steps=true';
    const coordsStr = `${start.lng},${start.lat};${end.lng},${end.lat}`;

    let res: Response;
    try {
      res = await fetch(`${primaryHost}/${coordsStr}${queryParams}`);
      if (!res.ok) throw new Error('Primary router failed');
    } catch {
      res = await fetch(`${fallbackHost}/${coordsStr}${queryParams}`);
    }

    if (!res.ok) throw new Error('Gagal mengambil data rute');

    const data = await res.json();
    if (!data.routes || data.routes.length === 0) {
      throw new Error('Rute tidak ditemukan');
    }

    const selectedRoute = data.routes[0];

    // GeoJSON coordinates come in [lng, lat], convert to [lat, lng] for Leaflet
    const coordinates: [number, number][] = selectedRoute.geometry.coordinates.map(
      (coord: [number, number]) => [coord[1], coord[0]]
    );

    let hasTolls = false;
    const steps: RouteStep[] = [];
    if (selectedRoute.legs && selectedRoute.legs[0]?.steps) {
      selectedRoute.legs[0].steps.forEach((s: any) => {
        const isTollStep =
          s.ref?.toLowerCase().includes('tol') ||
          s.name?.toLowerCase().includes('tol') ||
          s.name?.toLowerCase().includes('toll') ||
          s.maneuver?.modifier === 'toll';

        if (isTollStep) hasTolls = true;

        steps.push({
          instruction: translateInstruction(s.maneuver?.type, s.maneuver?.modifier, s.name, mode),
          distance: Math.round(s.distance || 0),
          duration: Math.round(s.duration || 0),
          name: s.name || '',
          isToll: isTollStep,
        });
      });
    }

    // Calculate realistic duration in minutes:
    // 1. Car with Toll: use engine duration (typically ~40-60 km/h avg)
    // 2. Car Non-Toll (Arterial): ~25-30 km/h average
    // 3. Motorcycle Non-Toll (Arterial): ~35-40 km/h average
    let durationMinutes: number;
    const distanceMeters = selectedRoute.distance;

    if (mode === 'car' && useToll && !shouldAvoidTolls) {
      durationMinutes = Math.max(1, Math.ceil(selectedRoute.duration / 60));
    } else if (mode === 'motorcycle') {
      // Motorbike ~35 km/h = ~583 meters per minute + small congestion factor
      durationMinutes = Math.max(1, Math.ceil(distanceMeters / 580));
    } else {
      // Car without Toll ~25 km/h = ~416 meters per minute
      durationMinutes = Math.max(1, Math.ceil(distanceMeters / 416));
    }

    const distanceKm = (distanceMeters / 1000).toFixed(1) + ' km';
    const durationFormatted =
      durationMinutes >= 60
        ? `${Math.floor(durationMinutes / 60)} jam ${durationMinutes % 60} mnt`
        : `${durationMinutes} menit`;

    return {
      coordinates,
      distanceMeters,
      distanceKm,
      durationMinutes,
      durationFormatted,
      steps,
      mode,
      useToll: mode === 'car' ? useToll : false,
      hasTolls,
    };
  } catch (error) {
    console.error('Error fetching in-app route:', error);
    return null;
  }
}

function translateInstruction(type?: string, modifier?: string, name?: string, mode?: TravelMode): string {
  let action = 'Jalan lurus';
  if (type === 'depart') {
    action = mode === 'motorcycle' ? 'Mulai berkendara motor' : 'Mulai berkendara mobil';
  } else if (type === 'arrive') {
    action = 'Tiba di lokasi tujuan';
  } else if (type === 'turn') {
    if (modifier === 'left') action = 'Belok kiri';
    else if (modifier === 'right') action = 'Belok kanan';
    else if (modifier === 'slight left') action = 'Ambil agak ke kiri';
    else if (modifier === 'slight right') action = 'Ambil agak ke kanan';
    else if (modifier === 'sharp left') action = 'Belok tajam ke kiri';
    else if (modifier === 'sharp right') action = 'Belok tajam ke kanan';
    else if (modifier === 'uturn') action = 'Putar balik';
    else action = 'Belok';
  } else if (type === 'fork') {
    action = modifier === 'left' ? 'Ambil jalur kiri di percabangan' : 'Ambil jalur kanan di percabangan';
  } else if (type === 'roundabout') {
    action = 'Masuk bundaran';
  } else if (type === 'on ramp') {
    action = 'Masuk ke jalan utama / ramp';
  } else if (type === 'off ramp') {
    action = 'Keluar melalui jalur exit';
  }

  if (name && name.trim()) {
    action += ` ke ${name}`;
  }

  return action;
}
