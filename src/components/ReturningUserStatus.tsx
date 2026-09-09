import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ExternalLink, 
  RefreshCw, 
  Info, 
  Smartphone,
  ShieldCheck
} from 'lucide-react';
import { TesterRegistration } from '../types';
import { getRemainingSeconds } from '../lib/storage';

interface ReturningUserStatusProps {
  registrations: TesterRegistration[];
  onRefresh: () => Promise<void>;
  onApplyAnother: () => void;
  onOpenChangeEmail: () => void;
}

export const ReturningUserStatus: React.FC<ReturningUserStatusProps> = ({
  registrations,
  onRefresh,
  onApplyAnother,
  onOpenChangeEmail,
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const [activeTabAppId, setActiveTabAppId] = useState<string>(
    registrations[0]?.appId || ''
  );
  const [remainingTime, setRemainingTime] = useState<number>(0);

  useEffect(() => {
    if (registrations.length > 0 && !activeTabAppId) {
      setActiveTabAppId(registrations[0].appId);
    }
  }, [registrations, activeTabAppId]);

  const activeReg = registrations.find(r => r.appId === activeTabAppId) || registrations[0];

  useEffect(() => {
    if (!activeReg) return;
    const initialRemaining = getRemainingSeconds(activeReg.appId);
    setRemainingTime(initialRemaining);

    const timer = setInterval(() => {
      const rem = getRemainingSeconds(activeReg.appId);
      setRemainingTime(rem);
    }, 1000);

    return () => clearInterval(timer);
  }, [activeReg]);

  if (!registrations || registrations.length === 0) {
    return null;
  }

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setTimeout(() => setRefreshing(false), 500);
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div id="tester-status-banner" className="my-8 max-w-4xl mx-auto px-4 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-800/90 to-slate-900/90 border border-slate-700/80 shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
        
        {/* Header with Welcome Back */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-700/60">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Browser Imetambuliwa Kikamilifu</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-['Outfit'] flex items-center gap-2">
              Karibu tena 👋
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              Hapa chini ni hali halisi ya maombi yako ya majaribio ya Android apps.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-change-email-banner"
              onClick={onOpenChangeEmail}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
              title="Sahihisha au badilisha barua pepe"
            >
              <span>Badilisha Barua Pepe</span>
            </button>

            <button
              id="btn-refresh-status"
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer disabled:opacity-50"
              title="Angalia sasisho la hali sasa hivi"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
              <span>{refreshing ? 'Inaangalia...' : 'Angalia Upya'}</span>
            </button>
          </div>
        </div>

        {/* If multiple registrations, show app selector tabs */}
        {registrations.length > 1 && (
          <div className="mt-5 flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {registrations.map(reg => (
              <button
                key={reg.id}
                onClick={() => setActiveTabAppId(reg.appId)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeReg?.id === reg.id
                    ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
                }`}
              >
                {reg.status === 'approved' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                ) : reg.status === 'rejected' ? (
                  <XCircle className="w-3.5 h-3.5 text-red-300" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-amber-300" />
                )}
                <span>{reg.appName}</span>
              </button>
            ))}
          </div>
        )}

        {/* Active Application Status Display */}
        {activeReg && (
          <div className="mt-6">
            <div className="text-sm font-medium text-slate-400">
              Uliomba kujiunga na beta testing ya:
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-['Outfit'] mt-1">
              {activeReg.appName}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <span>Gmail: <strong className="text-slate-200 font-mono">{activeReg.email}</strong></span>
              <span>•</span>
              <span>Tarehe: {new Date(activeReg.createdAt).toLocaleDateString('sw-TZ', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>

            {/* STATUS 1: APPROVED */}
            {activeReg.status === 'approved' && (
              <div className="mt-6 p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      Hali: ✅ Umeruhusiwa
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-white">
                      🎉 Umeruhusiwa kujaribu app!
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-xs sm:text-sm text-emerald-200/90 leading-relaxed">
                  Msimamizi amekuruhusu rasmi kwenye mfumo wa majaribio wa Google Play. Sasa unaweza kujiunga na Closed Test na kupakua app kwenye simu yako.
                </p>

                {/* Important Google Play Guidance Mandate */}
                <div className="mt-4 p-3.5 rounded-xl bg-slate-900/80 border border-emerald-500/20 text-xs text-slate-300 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Maelekezo Muhimu ya Google Play:</strong>
                    <p className="mt-0.5 text-slate-300">
                      Baada ya kubofya kitufe cha kujiunga, utaelekezwa Google Play. Hakikisha umeingia kwenye Google Play kwa kutumia Gmail ile ile uliyowasilisha wakati wa usajili (<span className="text-emerald-300 font-mono">{activeReg.email}</span>).
                    </p>
                  </div>
                </div>

                {/* Call To Action Button */}
                {activeReg.testingUrl ? (
                  <div className="mt-6">
                    <a
                      id={`btn-join-test-${activeReg.appId}`}
                      href={activeReg.testingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl text-base font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all font-['Outfit']"
                    >
                      <ExternalLink className="w-5 h-5" />
                      <span>JIUNGE NA TEST & PAKUA APP</span>
                    </a>
                  </div>
                ) : (
                  <div className="mt-4 text-xs text-amber-300">
                    Kiungo cha Google Play kinaandaliwa na msimamizi. Tafadhali subiri kwa muda mfupi.
                  </div>
                )}
              </div>
            )}

            {/* STATUS 2: PENDING */}
            {activeReg.status === 'pending' && (
              <div className="mt-6 p-6 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-amber-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                    <Clock className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      Hali: ⏳ Inasubiri
                    </div>
                    <div className="text-base sm:text-lg font-bold text-white">
                      Ombi lako linakaguliwa na msimamizi
                    </div>
                  </div>
                </div>

                {/* Countdown display if active */}
                {remainingTime > 0 ? (
                  <div className="mt-4 p-3 rounded-xl bg-slate-900/70 border border-amber-500/20 flex items-center justify-between">
                    <span className="text-xs text-slate-300">
                      Muda uliokadiriwa wa ukaguzi:
                    </span>
                    <span className="font-mono text-sm font-bold text-amber-400">
                      ⏳ Tafadhali subiri: {formatCountdown(remainingTime)}
                    </span>
                  </div>
                ) : (
                  <div className="mt-4 p-3 rounded-xl bg-slate-900/70 border border-amber-500/20 text-xs text-slate-300">
                    Unaweza kubofya <strong>"Angalia Upya"</strong> hapo juu kuangalia kama msimamizi amekuruhusu kwenye Google Play.
                  </div>
                )}

                <p className="mt-3 text-xs text-amber-200/80 leading-relaxed">
                  Kumbuka: Msimamizi anatakiwa kwanza kuingiza Gmail yako kwenye Google Play Console ili kukuwezesha kupakua app. Subiri kidogo kisha urudi kwenye ukurasa huu.
                </p>
              </div>
            )}

            {/* STATUS 3: REJECTED */}
            {activeReg.status === 'rejected' && (
              <div className="mt-6 p-6 rounded-2xl bg-red-950/30 border border-red-500/30 text-red-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                    <XCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-red-400 uppercase tracking-wider">
                      Hali: ❌ Ombi halijakubaliwa
                    </div>
                    <div className="text-base sm:text-lg font-bold text-white">
                      Nafasi za awamu hii zimejaa au taarifa hazikukidhi vigezo
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-xs text-red-200/80 leading-relaxed">
                  Samahani, ombi hili halijapitishwa kwa awamu hii ya majaribio ya {activeReg.appName}. Unaweza kujaribu kuomba programu nyingine miongoni mwa apps zilizopo.
                </p>

                <div className="mt-4">
                  <button
                    onClick={onApplyAnother}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
                  >
                    Chagua App Nyingine
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Footer actions inside banner */}
        <div className="mt-6 pt-4 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <span>Usifute data au cookies za browser hii ili mfumo ukukumbuke kiotomatiki.</span>
          <button
            onClick={onOpenChangeEmail}
            className="text-cyan-400 hover:underline font-semibold cursor-pointer"
          >
            Ulikosea kuweka barua pepe? Badilisha hapa
          </button>
        </div>

      </div>
    </div>
  );
};
