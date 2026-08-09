/**
 * Krishi-Nexus API Service
 * All backend communication goes through here.
 */

const BACKEND = (process.env.NEXT_PUBLIC_BACKEND_URL || 'https://krishi-nexus-backend.onrender.com').replace(/\/+$/, '');

async function apiFetch(path: string, options?: RequestInit) {
  try {
    const res = await fetch(`${BACKEND}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options?.headers },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return res.json();
  } catch (err) {
    console.error(`[API] ${path}:`, err);
    throw err;
  }
}

// ─── Farm ─────────────────────────────────────────────────
export async function getFarm() {
  return apiFetch('/api/farm');
}

export async function updateFarm(data: Record<string, unknown>) {
  return apiFetch('/api/farm', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ─── Weather ──────────────────────────────────────────────
export async function getWeather() {
  return apiFetch('/api/weather');
}

// ─── Disease ──────────────────────────────────────────────
export async function analyzeDisease(file: File, crop: string = 'Tomato') {
  const form = new FormData();
  form.append('file', file);
  form.append('crop', crop);
  const res = await fetch(`${BACKEND}/api/disease/analyze`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error(`Disease analysis failed: ${res.statusText}`);
  return res.json();
}

export async function getLatestDisease() {
  return apiFetch('/api/disease/latest');
}

// ─── Advisory ─────────────────────────────────────────────
export async function getAdvisory() {
  return apiFetch('/api/advisory');
}

// ─── Markets ──────────────────────────────────────────────
export async function getMarkets(crop?: string, quantity_kg: number = 100) {
  const params = new URLSearchParams({ quantity_kg: String(quantity_kg) });
  if (crop) params.set('crop', crop);
  return apiFetch(`/api/markets?${params}`);
}

// ─── Copilot ──────────────────────────────────────────────
export async function askCopilot(question: string, language: string = 'English') {
  return apiFetch('/api/copilot', {
    method: 'POST',
    body: JSON.stringify({ question, language }),
  });
}

// ─── SMS ──────────────────────────────────────────────────
export async function sendSMS(phone_number: string) {
  return apiFetch('/api/sms/send', {
    method: 'POST',
    body: JSON.stringify({ phone_number }),
  });
}

// ─── Health ───────────────────────────────────────────────
export async function getHealth() {
  return apiFetch('/api/health');
}

export const API = {
  getFarm,
  updateFarm,
  saveFarm: updateFarm,
  getWeather,
  analyzeDisease,
  getLatestDisease,
  getAdvisory,
  getMarkets,
  askCopilot,
  sendSMS,
  getHealth,
};
