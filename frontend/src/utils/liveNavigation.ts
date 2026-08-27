// Live Navigation Engine & Helpers for Real-time Turn-by-Turn Guidance

import type { RouteData, RouteStep } from './routing';

// Helper: Calculate distance between two coordinates in meters (Haversine formula)
export function getDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Text to Speech Voice Guidance in Indonesian
export function speakInstruction(text: string, voiceEnabled: boolean = true) {
  if (!voiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) {
    return;
  }

  try {
    window.speechSynthesis.cancel(); // Stop current speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('Speech synthesis error:', e);
  }
}

// Turn Maneuver Icon Type
export type ManeuverType = 'straight' | 'turn-left' | 'turn-right' | 'slight-left' | 'slight-right' | 'sharp-left' | 'sharp-right' | 'uturn' | 'arrive';

export function getManeuverType(instruction: string): ManeuverType {
  const lower = instruction.toLowerCase();
  if (lower.includes('tiba')) return 'arrive';
  if (lower.includes('putar balik')) return 'uturn';
  if (lower.includes('tajam ke kiri')) return 'sharp-left';
  if (lower.includes('tajam ke kanan')) return 'sharp-right';
  if (lower.includes('agak ke kiri') || lower.includes('jalur kiri')) return 'slight-left';
  if (lower.includes('agak ke kanan') || lower.includes('jalur kanan')) return 'slight-right';
  if (lower.includes('kiri')) return 'turn-left';
  if (lower.includes('kanan')) return 'turn-right';
  return 'straight';
}
