import React, { useState } from 'react';
import { X, Mail, Sparkles, AlertCircle, AlertTriangle } from 'lucide-react';
import { AppInfo, TesterRegistration } from '../types';
import { AppIcon } from './AppIcon';

interface RegisterModalProps {
  app: AppInfo | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string, appId: string) => Promise<TesterRegistration | null>;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  app,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !app) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError('Tafadhali ingiza anwani ya barua pepe (Gmail).');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmedEmail)) {
      setError('Barua pepe uliyoweka haina muundo sahihi. Mfano: jina@gmail.com');
      return;
    }

    try {
      setLoading(true);
      const result = await onSubmit(trimmedEmail, app.id);
      
      if (result) {
        // Clear the email field for next time
        setEmail('');
      }
    } catch (err: any) {
      setError(err.message || 'Hitilafu imetokea. Tafadhali jaribu tena.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="modal-register-container"
        className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden"
      >
        {/* Accent strip */}
        <div className="h-1.5 w-full" style={{ backgroundColor: app.accentColor }} />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 cursor-pointer"
          aria-label="Funga"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          
          {/* Header */}
          <div className="flex items-center gap-3.5 mb-2">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ 
                backgroundColor: `${app.accentColor}18`, 
                color: app.accentColor,
                border: `1px solid ${app.accentColor}35`
              }}
            >
              <AppIcon name={app.iconName} className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Jiunge na Beta Testing
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white font-['Outfit']">
                Umechagua: {app.name}
              </h3>
            </div>
          </div>

          {/* Android Only notice */}
          <div className="my-4 p-3 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300">Watumiaji wa Android Pekee:</strong> Programu hii inapatikana kupitia Google Play Store kwenye simu za Android pekee.
            </div>
          </div>

          <p className="text-xs text-slate-400 mb-5 leading-relaxed">
            Ingiza Gmail unayotumia kwenye Google Play kwenye simu yako ili msimamizi aweze kukupa idhini ya kupakua app hii katika awamu ya closed test.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label 
                htmlFor="input-gmail" 
                className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2"
              >
                Ingiza Gmail Yako: <span className="text-red-400">*</span>
              </label>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  id="input-gmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mfano@gmail.com"
                  autoFocus
                  required
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm font-medium transition-all"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                id="btn-submit-registration"
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-xl font-black text-sm tracking-wide text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-lg shadow-cyan-500/25 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>INASAJILI...</span>
                  </>
                ) : (
                  <span>JISAJILI KWA MAJARIBIO</span>
                )}
              </button>
            </div>

            {/* Privacy note */}
            <p className="text-[11px] text-center text-slate-500">
              🔒 Hatutakutumia barua pepe zisizohitajika (spam). Gmail yako inatumika kwa ajili ya orodha ya Google Play tester pekee.
            </p>

          </form>

        </div>
      </div>
    </div>
  );
};
