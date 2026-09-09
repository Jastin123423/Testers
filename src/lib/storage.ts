import { TesterRegistration } from '../types';

const SESSION_KEY = 'beta_tester_session_id';
const EMAIL_KEY = 'beta_tester_email';
const DEVICE_KEY = 'beta_tester_device_model';
const LOCAL_REGISTRATIONS_KEY = 'beta_tester_registrations_cache';
const TIMERS_KEY = 'beta_tester_countdown_timers';
const ADMIN_TOKEN_KEY = 'beta_tester_admin_token';

// Get or generate unique random session identifier for this browser
export function getOrCreateSessionId(): string {
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      // Generate a friendly, clean unique identifier
      const randomPart = Math.random().toString(36).substring(2, 10);
      const timePart = Date.now().toString(36);
      id = `sess_${timePart}_${randomPart}`;
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch (err) {
    console.error('LocalStorage unavailable:', err);
    return 'sess_' + Math.random().toString(36).substring(2, 10);
  }
}

// Get saved registered email
export function getSavedEmail(): string | null {
  try {
    return localStorage.getItem(EMAIL_KEY);
  } catch {
    return null;
  }
}

// Save registered email
export function setSavedEmail(email: string) {
  try {
    localStorage.setItem(EMAIL_KEY, email.trim().toLowerCase());
  } catch (e) {
    console.error('Failed to save email:', e);
  }
}

// Get saved device
export function getSavedDevice(): string | null {
  try {
    return localStorage.getItem(DEVICE_KEY);
  } catch {
    return null;
  }
}

// Save device
export function setSavedDevice(device: string) {
  try {
    localStorage.setItem(DEVICE_KEY, device.trim());
  } catch (e) {
    console.error('Failed to save device:', e);
  }
}

// Save countdown target time (approx 10 minutes from registration)
export function setRegistrationTimer(appId: string, durationMinutes = 10) {
  try {
    const raw = localStorage.getItem(TIMERS_KEY);
    const timers: Record<string, number> = raw ? JSON.parse(raw) : {};
    timers[appId] = Date.now() + durationMinutes * 60 * 1000;
    localStorage.setItem(TIMERS_KEY, JSON.stringify(timers));
  } catch (e) {
    console.error('Failed to set timer:', e);
  }
}

// Set countdown for all apps
export function setRegistrationTimerForAll(appIds: string[], durationMinutes = 10) {
  try {
    const raw = localStorage.getItem(TIMERS_KEY);
    const timers: Record<string, number> = raw ? JSON.parse(raw) : {};
    const target = Date.now() + durationMinutes * 60 * 1000;
    for (const id of appIds) {
      timers[id] = target;
    }
    timers['global'] = target;
    localStorage.setItem(TIMERS_KEY, JSON.stringify(timers));
  } catch (e) {
    console.error('Failed to set global timer:', e);
  }
}

// Get remaining countdown seconds for an app or global
export function getRemainingSeconds(appId: string): number {
  try {
    const raw = localStorage.getItem(TIMERS_KEY);
    if (!raw) return 0;
    const timers: Record<string, number> = JSON.parse(raw);
    const targetTime = timers[appId] || timers['global'];
    if (!targetTime) return 0;
    const remainingMs = targetTime - Date.now();
    return remainingMs > 0 ? Math.ceil(remainingMs / 1000) : 0;
  } catch {
    return 0;
  }
}

// Cache registrations in local storage
export function cacheRegistrations(registrations: TesterRegistration[]) {
  try {
    localStorage.setItem(LOCAL_REGISTRATIONS_KEY, JSON.stringify(registrations));
  } catch (e) {
    console.error('Failed to cache registrations:', e);
  }
}

// Get cached registrations
export function getCachedRegistrations(): TesterRegistration[] {
  try {
    const raw = localStorage.getItem(LOCAL_REGISTRATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Clear tester local registrations
export function clearTesterData() {
  try {
    localStorage.removeItem(LOCAL_REGISTRATIONS_KEY);
    localStorage.removeItem(EMAIL_KEY);
    localStorage.removeItem(TIMERS_KEY);
  } catch (e) {
    console.error('Failed to clear tester data:', e);
  }
}

// Admin token storage
export function getAdminToken(): string | null {
  try {
    return sessionStorage.getItem(ADMIN_TOKEN_KEY) || localStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAdminToken(token: string, persist = true) {
  try {
    if (persist) {
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
    }
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
  } catch (e) {
    console.error('Failed to set admin token:', e);
  }
}

export function clearAdminToken() {
  try {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  } catch (e) {
    console.error('Failed to clear admin token:', e);
  }
}

// ============ API INTEGRATION FUNCTIONS ============

// Fetch apps from backend
export async function apiFetchApps() {
  try {
    const res = await fetch('/api/apps');
    if (!res.ok) {
      throw new Error('Failed to fetch apps');
    }
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    return data;
  } catch (error) {
    console.error('Error fetching apps:', error);
    return { success: false, apps: [] };
  }
}

// Check if email exists and get registrations
export async function apiCheckEmail(email: string, sessionId: string) {
  try {
    const res = await fetch('/api/check-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, sessionId }),
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    return data;
  } catch (error) {
    console.error('Error checking email:', error);
    return { success: false, isReturning: false, registrations: [] };
  }
}

// Register tester for an app
export async function apiRegisterTester(data: {
  email: string;
  sessionId: string;
  deviceId?: string;
  appId: string;
  appName: string;
  platform?: string;
}) {
  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const text = await res.text();
    const result = text ? JSON.parse(text) : {};
    
    if (!res.ok) {
      throw new Error(result.message || 'Registration failed');
    }
    
    return result;
  } catch (error) {
    console.error('Error registering:', error);
    throw error;
  }
}

// Change user email
export async function apiChangeEmail(oldEmail: string, newEmail: string, sessionId: string) {
  try {
    const res = await fetch('/api/change-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldEmail, newEmail, sessionId }),
    });
    const text = await res.text();
    const result = text ? JSON.parse(text) : {};
    
    if (!res.ok) {
      throw new Error(result.message || 'Failed to change email');
    }
    
    return result;
  } catch (error) {
    console.error('Error changing email:', error);
    throw error;
  }
}

// Admin login
export async function apiAdminLogin(password: string) {
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    return data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
}

// Get admin overview stats
export async function apiAdminOverview(token: string) {
  try {
    const res = await fetch('/api/admin/overview', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    return data;
  } catch (error) {
    console.error('Error fetching overview:', error);
    throw error;
  }
}

// Get all testers (admin)
export async function apiAdminTesters(token: string) {
  try {
    const res = await fetch('/api/admin/testers', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    return data;
  } catch (error) {
    console.error('Error fetching testers:', error);
    throw error;
  }
}

// Update tester status (admin)
export async function apiUpdateTesterStatus(token: string, testerId: string, status: string) {
  try {
    const res = await fetch(`/api/admin/testers/${testerId}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    return data;
  } catch (error) {
    console.error('Error updating status:', error);
    throw error;
  }
}

// Change tester's app (admin)
export async function apiChangeTesterApp(token: string, testerId: string, appId: string) {
  try {
    const res = await fetch(`/api/admin/testers/${testerId}/change-app`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ appId }),
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    return data;
  } catch (error) {
    console.error('Error changing app:', error);
    throw error;
  }
}

// Delete tester registration (admin)
export async function apiDeleteTester(token: string, testerId: string) {
  try {
    const res = await fetch(`/api/admin/testers/${testerId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    return data;
  } catch (error) {
    console.error('Error deleting tester:', error);
    throw error;
  }
}

// Update app (admin)
export async function apiUpdateApp(token: string, appId: string, appData: any) {
  try {
    const res = await fetch(`/api/admin/apps/${appId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(appData),
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    return data;
  } catch (error) {
    console.error('Error updating app:', error);
    throw error;
  }
}

// Enhanced fetchLiveTesterStatus - now uses POST /api/check-email
export async function fetchLiveTesterStatus(overrideEmail?: string): Promise<TesterRegistration[]> {
  try {
    const sessionId = getOrCreateSessionId();
    const email = overrideEmail || getSavedEmail() || '';
    
    const result = await apiCheckEmail(email, sessionId);
    
    if (result.success && result.isReturning && Array.isArray(result.registrations)) {
      if (result.registrations.length > 0) {
        cacheRegistrations(result.registrations);
        if (!getSavedEmail() && result.registrations[0]?.email) {
          setSavedEmail(result.registrations[0].email);
        }
        return result.registrations;
      }
    }
    
    return getCachedRegistrations();
  } catch (err) {
    console.warn('Network error checking status, falling back to cache:', err);
    return getCachedRegistrations();
  }
}
