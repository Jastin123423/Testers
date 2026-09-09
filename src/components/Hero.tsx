import React, { useState } from 'react';
import { 
  ArrowDown, 
  Lock, 
  CheckCircle, 
  Smartphone, 
  Play, 
  Sparkles, 
  Mail, 
  HelpCircle, 
  ArrowRight,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';

interface HeroProps {
  hasRegistered: boolean;
  registeredEmail: string | null;
  onSubmitEmail: (email: string) => Promise<boolean>;
  onOpenChangeEmail: () => void;
  onExploreApps: () => void;
}

export const Hero: React.FC<HeroProps> = ({ 
  hasRegistered,
  registeredEmail,
  onSubmitEmail,
  onOpenChangeEmail,
  onExploreApps,
}) => {
  const [emailInput, setEmailInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = emailInput.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMsg('Tafadhali weka barua pepe sahihi ya Gmail (mfano: jina@gmail.com).');
      return;
    }

    setSubmitting(true);
    try {
      const ok = await onSubmitEmail(cleanEmail);
      if (ok) {
        setEmailInput('');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Hitilafu imetokea wakati wa kusajili. Tafadhali jaribu tena.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-14 lg:pt-14 lg:pb-20">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none overflow-hidden -z-10 opacity-35">
        <div className="absolute -top-12 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
        <div className="absolute top-10 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          
          {/* Android-Only Notice Pill / Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 border border-amber-500/30 text-amber-300 shadow-sm mb-6">
            <Smartphone className="w-3.5 h-3.5 text-amber-400" />
            <span>Kwa Watumiaji wa Vifaa vya Android Pekee (Google Play)</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-['Outfit'] leading-[1.15]">
            Jiunge na Majaribio ya <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Android Apps Zetu 6
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
            {hasRegistered ? (
              <>Umesajiliwa kikamilifu! Apps zote 6 sasa zinaonekana hapa chini tayari kwa majaribio na viungo vya Google Play Store.</>
            ) : (
              <>Weka barua pepe yako ya Gmail hapa chini ili kujiunga na majaribio ya programu zote 6 kwa wakati mmoja. Programu zitafunguliwa mara moja baada ya kutuma.</>
            )}
          </p>

          {/* STATE 1: NOT REGISTERED YET (FIRST TIME VISITOR) -> SHOW EMAIL ONLY FORM */}
          {!hasRegistered ? (
            <div className="mt-8 max-w-xl mx-auto">
              <div className="relative rounded-3xl bg-gradient-to-b from-slate-800/90 to-slate-900/95 border border-cyan-500/30 p-6 sm:p-8 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl text-left">
                
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-700/60">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white font-['Outfit']">
                      Weka Gmail Kufungua Apps Zote
                    </h2>
                    <p className="text-xs text-slate-400">
                      Usajili mmoja kwa ajili ya programu zote 6
                    </p>
                  </div>
                </div>

                {/* Explicit Notice: Android Users Only */}
                <div className="mb-5 p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <strong className="text-amber-300 font-bold">MUHIMU SANA: </strong>
                    Majaribio haya ni kwa watumiaji wa simu au vidonge vya <span className="underline font-bold text-white">Android pekee</span> (Google Play Store). Simu za iPhone / iOS haziwezi kupakua programu hizi.
                  </div>
                </div>

                {errorMsg && (
                  <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-500/30 text-xs text-red-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleFormSubmit} className="space-y-4">
                  {/* Email Input ONLY */}
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      Barua Pepe ya Gmail (Inayotumika Play Store) <span className="text-cyan-400">*</span>:
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="input-hero-email"
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="mfano: jina@gmail.com"
                        className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all shadow-inner"
                      />
                    </div>
                    <p className="mt-1.5 text-[11px] text-slate-400">
                      Hakikisha ni anwani ya Gmail unayotumia kwenye programu ya Google Play kwenye simu yako ya Android.
                    </p>
                  </div>

                  <button
                    id="btn-submit-hero-email"
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 px-6 rounded-xl font-extrabold text-sm sm:text-base text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400 hover:from-cyan-300 hover:to-blue-300 transition-all cursor-pointer shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                  >
                    <span>{submitting ? 'Inasajili Apps Zote 6...' : 'Jiunge na Majaribio ya Apps Zote 6'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </form>

                {/* Option to re-enter email if provided wrong email and apps not showing */}
                <div className="mt-5 p-3 rounded-xl bg-slate-900/80 border border-slate-700/70 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Ulikosea kuweka barua pepe au apps hazionekani?</span>
                  </div>
                  <button
                    id="btn-open-change-email-hero"
                    type="button"
                    onClick={onOpenChangeEmail}
                    className="text-xs text-cyan-400 hover:text-cyan-300 underline font-bold cursor-pointer whitespace-nowrap"
                  >
                    Weka / Sahihisha Hapa
                  </button>
                </div>

                <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-400">
                  <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>🔒 Gmail yako inatumika kwa ajili ya Google Play Closed Testing pekee.</span>
                </div>
              </div>
            </div>
          ) : (
            /* STATE 2: ALREADY REGISTERED -> SHOW CONFIRMATION BADGE & EXPLORE BUTTON */
            <div className="mt-8 flex flex-col items-center justify-center gap-4">
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>
                  Umesajiliwa kwa: <strong className="font-mono text-white">{registeredEmail}</strong>
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
                <button
                  id="btn-hero-cta"
                  onClick={onExploreApps}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400 hover:from-cyan-300 hover:to-blue-300 shadow-xl shadow-cyan-500/25 active:scale-95 transition-all cursor-pointer group"
                >
                  <span>Tazama Programu Zote 6 Chini</span>
                  <ArrowDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                </button>

                <button
                  id="btn-change-email-registered"
                  onClick={onOpenChangeEmail}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                >
                  Ulikosea Barua Pepe? Badilisha
                </button>
              </div>
            </div>
          )}

          {/* Key Feature Badges Grid */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-white">Android Pekee</div>
                <div className="text-xs text-slate-400">Apps 6 Mpya</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                <Play className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-white">Google Play</div>
                <div className="text-xs text-slate-400">Upakuaji rasmi</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-white">100% Bure</div>
                <div className="text-xs text-slate-400">Hakuna malipo</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-white">Kumbukumbu</div>
                <div className="text-xs text-slate-400">Browser inakumbuka</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
