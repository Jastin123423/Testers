import React from 'react';
import { Check, Sparkles, Shield, Camera, Lock, CheckCircle2, Clock, ExternalLink } from 'lucide-react';
import { AppInfo, TesterRegistration } from '../types';
import { AppIcon } from './AppIcon';

interface AppCardProps {
  app: AppInfo;
  userRegistration?: TesterRegistration;
  onSelectApp: (app: AppInfo) => void;
  onViewStatus: () => void;
}

export const AppCard: React.FC<AppCardProps> = ({
  app,
  userRegistration,
  onSelectApp,
  onViewStatus,
}) => {
  // Customized button label based on prompt specifications
  const getButtonLabel = () => {
    switch (app.id) {
      case 'pdf-office':
        return 'Jaribu PDF Office';
      case 'free-screen-recorder':
        return 'Jaribu Free Screen Recorder';
      case 'jobsreport':
        return 'Jaribu JobsReport';
      case 'music-play':
        return 'Jaribu Music Play';
      case 'top-file-manager':
        return 'Jaribu Top File Manager';
      case 'int-calculator':
        return 'Jaribu Int Calculator';
      default:
        return `Jaribu ${app.name}`;
    }
  };

  return (
    <div
      id={`card-app-${app.id}`}
      className="group relative flex flex-col justify-between rounded-3xl bg-slate-850 bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all duration-300 hover:shadow-xl hover:shadow-black/40 overflow-hidden"
    >
      {/* Top Accent Gradient Border */}
      <div 
        className="h-1.5 w-full transition-all duration-300"
        style={{ backgroundColor: app.accentColor }}
      />

      <div className="p-6 sm:p-7 flex-1 flex flex-col">
        
        {/* Header: Icon, Category & Status */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div 
            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105"
            style={{ 
              backgroundColor: `${app.accentColor}18`, 
              color: app.accentColor,
              border: `1px solid ${app.accentColor}35`
            }}
          >
            <AppIcon name={app.iconName} className="w-7 h-7" />
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 bg-slate-800/90 px-2.5 py-1 rounded-lg border border-slate-700/60">
              {app.category}
            </span>

            {/* If registered for this app, show current status badge */}
            {userRegistration && (
              <button
                onClick={onViewStatus}
                className="mt-1 flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md cursor-pointer transition-all hover:scale-105"
                style={{
                  backgroundColor: userRegistration.status === 'approved' ? '#065f46' : '#78350f',
                  color: userRegistration.status === 'approved' ? '#6ee7b7' : '#fde68a',
                }}
              >
                {userRegistration.status === 'approved' ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Imeidhinishwa</span>
                  </>
                ) : userRegistration.status === 'rejected' ? (
                  <span>Ombi Halijakubaliwa</span>
                ) : (
                  <>
                    <Clock className="w-3 h-3" />
                    <span>Inasubiri</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Title and Short Description */}
        <h3 className="text-xl sm:text-2xl font-black text-white font-['Outfit'] tracking-tight group-hover:text-white transition-colors">
          {app.name}
        </h3>
        
        <p className="mt-2 text-sm font-semibold text-slate-200 leading-snug">
          {app.tagline}
        </p>

        <p className="mt-2.5 text-xs text-slate-400 leading-relaxed">
          {app.description}
        </p>

        {/* Special Feature Highlight Callout (Dual camera or Privacy Vault) */}
        {app.dualCameraNote && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/25 flex items-start gap-2.5">
            <Camera className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-emerald-200/90 leading-snug">
              <strong className="text-emerald-300">Dual-Camera Maalum: </strong>
              {app.dualCameraNote}
            </div>
          </div>
        )}

        {app.privateAreaNote && (
          <div className="mt-4 p-3 rounded-xl bg-blue-950/40 border border-blue-500/25 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-blue-200/90 leading-snug">
              <strong className="text-blue-300">Eneo la Faragha (Vault): </strong>
              {app.privateAreaNote}
            </div>
          </div>
        )}

        {/* Features Checklist */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            Vipengele Muhimu:
          </div>
          <ul className="space-y-2">
            {app.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                <span 
                  className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: `${app.accentColor}20`, color: app.accentColor }}
                >
                  <Check className="w-2.5 h-2.5" />
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Card Action Footer */}
      <div className="p-6 pt-0">
        {userRegistration?.status === 'approved' ? (
          <a
            id={`btn-join-download-${app.id}`}
            href={userRegistration.testingUrl || app.testingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 rounded-xl font-extrabold text-sm text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/25 active:scale-98"
          >
            <ExternalLink className="w-4 h-4" />
            <span>JIUNGE NA TEST & PAKUA APP</span>
          </a>
        ) : userRegistration?.status === 'pending' ? (
          <button
            id={`btn-pending-${app.id}`}
            onClick={onViewStatus}
            className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-amber-300 bg-amber-950/40 border border-amber-500/30 hover:bg-amber-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span>⏳ Inasubiri Uhakiki wa Admin</span>
          </button>
        ) : (
          <button
            id={`btn-apply-${app.id}`}
            onClick={() => onSelectApp(app)}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-98"
            style={{
              backgroundColor: app.accentColor,
              boxShadow: `0 4px 14px 0 ${app.accentColor}33`,
            }}
          >
            <span>{getButtonLabel()}</span>
          </button>
        )}
      </div>

    </div>
  );
};
