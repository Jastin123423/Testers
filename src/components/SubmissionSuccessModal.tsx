import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, ShieldCheck, X, ArrowRight, AlertTriangle } from 'lucide-react';
import { TesterRegistration } from '../types';
import { getRemainingSeconds } from '../lib/storage';

interface SubmissionSuccessModalProps {
  registration: TesterRegistration | null;
  isOpen: boolean;
  onClose: () => void;
  onViewStatus: () => void;
}

export const SubmissionSuccessModal: React.FC<SubmissionSuccessModalProps> = ({
  registration,
  isOpen,
  onClose,
  onViewStatus,
}) => {
  const [remainingSeconds, setRemainingSeconds] = useState(600); // 10 minutes default

  useEffect(() => {
    if (!registration || !isOpen) return;

    const initial = getRemainingSeconds(registration.appId);
    setRemainingSeconds(initial > 0 ? initial : 600);

    const interval = setInterval(() => {
      const rem = getRemainingSeconds(registration.appId);
      setRemainingSeconds(rem);
    }, 1000);

    return () => clearInterval(interval);
  }, [registration, isOpen]);

  if (!isOpen || !registration) return null;

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        id="modal-success-container"
        className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden text-center"
      >
        {/* Top green celebratory accent */}
        <div className="h-2 w-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 cursor-pointer"
          aria-label="Funga"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          
          {/* Success Check Icon */}
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          {/* Title */}
          <h3 className="text-2xl sm:text-3xl font-black text-white font-['Outfit']">
            ✅ Usajili Umepokelewa
          </h3>

          {/* Messages strictly as specified in prompt */}
          <p className="mt-3 text-base font-bold text-slate-200">
            Asante kwa kujiunga na majaribio ya <span className="text-cyan-400">{registration.appName === 'All Apps' || !registration.appName ? 'programu zetu zote 6 za Android' : registration.appName}</span>.
          </p>

          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Maombi yako yamepokelewa kikamilifu. Programu zote 6 zimefunguliwa kwenye ukurasa huu. Tafadhali subiri kwa muda mfupi na uangalie hali ya idhini yako.
          </p>

          {/* Browser Retention Notice */}
          <div className="mt-4 p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300 text-left flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Kumbukumbu ya Kivinjari:</strong>
              <p className="mt-0.5 text-slate-300">
                Usifute data ya browser hii ikiwa unataka mfumo ukutambue kwa urahisi utakaporudi.
              </p>
            </div>
          </div>

          {/* 10-Minute Countdown Box */}
          <div className="mt-5 p-4 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-850 border border-slate-700">
            <div className="text-xs font-semibold text-slate-400 mb-1">
              {remainingSeconds > 0 
                ? 'Muda unaopendekezwa kabla ya kukagua idhini ya msimamizi:' 
                : 'Muda wa awali umekamilika:'
              }
            </div>

            {remainingSeconds > 0 ? (
              <div className="font-mono text-2xl sm:text-3xl font-black tracking-wider text-amber-400 py-1">
                ⏳ Tafadhali subiri: {formatCountdown(remainingSeconds)}
              </div>
            ) : (
              <div className="text-sm font-bold text-emerald-400 py-1">
                Unaweza kuangalia hali ya usajili wako sasa.
              </div>
            )}

            <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                Kumbuka: Msimamizi anahitaji kukuidhinisha kwenye Google Play Console kwanza.
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-2.5">
            <button
              id="btn-modal-view-status"
              onClick={() => {
                onClose();
                onViewStatus();
              }}
              className="w-full py-3.5 px-6 rounded-xl font-black text-sm tracking-wide text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-lg shadow-cyan-500/20 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>ANGALIA HALI YA TESTER</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="w-full py-2.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              Endelea na Tovuti
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
