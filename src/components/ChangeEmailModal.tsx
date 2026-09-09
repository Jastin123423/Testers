import React, { useState } from 'react';
import { Mail, Smartphone, AlertCircle, CheckCircle2, X, ArrowRight } from 'lucide-react';
import { TesterRegistration } from '../types';
import { 
  getOrCreateSessionId, 
  getSavedEmail, 
  setSavedEmail, 
  setSavedDevice, 
  getSavedDevice,
  cacheRegistrations,
  setRegistrationTimerForAll
} from '../lib/storage';

interface ChangeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (registrations: TesterRegistration[], updatedEmail: string) => void;
  currentEmail?: string;
  allAppIds: string[];
}

export const ChangeEmailModal: React.FC<ChangeEmailModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentEmail,
  allAppIds,
}) => {
  const existingEmail = currentEmail || getSavedEmail() || '';
  const [email, setEmail] = useState('');
  const [deviceInfo, setDeviceInfo] = useState(getSavedDevice() || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError('Tafadhali weka barua pepe sahihi ya Gmail (mfano: jina@gmail.com).');
      return;
    }

    setLoading(true);

    try {
      const sessionId = getOrCreateSessionId();
      const res = await fetch('/api/change-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldEmail: existingEmail,
          newEmail: cleanEmail,
          sessionId,
          deviceInfo: deviceInfo.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Hitilafu imetokea wakati wa kusasisha barua pepe.');
      }

      setSavedEmail(cleanEmail);
      if (deviceInfo.trim()) {
        setSavedDevice(deviceInfo.trim());
      }
      if (Array.isArray(data.registrations) && data.registrations.length > 0) {
        cacheRegistrations(data.registrations);
        setRegistrationTimerForAll(allAppIds, 10);
      }

      setSuccessMsg(data.message || 'Barua pepe imesasishwa kikamilifu! Apps zote zimefunguliwa.');
      
      setTimeout(() => {
        onSuccess(data.registrations || [], cleanEmail);
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Imeshindikana kusasisha barua pepe. Tafadhali angalia mtandao na ujaribu tena.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 p-6 sm:p-8 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Funga"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title & Icon */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white font-['Outfit']">
              Sahihisha Barua Pepe Yako
            </h3>
            <p className="text-xs text-slate-400">
              Ulikosea kuingiza au programu hazionekani?
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-5">
          Ingiza barua pepe sahihi ya Gmail hapa chini. Mfumo utasasisha usajili wako na kufungua programu zote 6 mara moja.
        </p>

        {existingEmail && (
          <div className="mb-4 px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300 flex items-center justify-between">
            <span className="text-slate-400">Barua pepe ya awali:</span>
            <span className="font-mono text-cyan-300 font-semibold">{existingEmail}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-950/50 border border-red-500/30 text-xs text-red-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5">
              Barua Pepe Sahihi ya Gmail <span className="text-red-400">*</span>:
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mfano: jina@gmail.com"
                autoFocus
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Hakikisha ni Gmail unayotumia kwenye simu yako ya Android kupakua apps kutoka Google Play Store.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5">
              Mfano wa Simu / Kifaa chako (Hiari):
            </label>
            <div className="relative">
              <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={deviceInfo}
                onChange={(e) => setDeviceInfo(e.target.value)}
                placeholder="mfano: Samsung Galaxy A14, TECNO Camon 20"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Ghairi
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-300 hover:to-blue-300 transition-all cursor-pointer shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              <span>{loading ? 'Inasasisha...' : 'Sasisha & Fungua Apps'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="mt-5 pt-4 border-t border-slate-800 text-[11px] text-slate-500 text-center">
          🔒 Taarifa zako zinalindwa na zinatumika kwa ajili ya majaribio rasmi ya Google Play pekee.
        </div>
      </div>
    </div>
  );
};
