import React from 'react';
import { ShieldCheck, Lock, EyeOff, FileText, CheckCircle } from 'lucide-react';

export const PrivacySection: React.FC = () => {
  return (
    <section id="privacy" className="py-16 sm:py-20 bg-slate-900 border-t border-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Usalama & Haki ya Faragha</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white font-['Outfit'] tracking-tight">
            Sera ya Faragha na Ulinzi wa Taarifa
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            Tumejitolea kuhakikisha usalama wa hali ya juu kwa kila tester anayejiunga na programu yetu.
          </p>
        </div>

        <div className="rounded-3xl bg-slate-850 bg-slate-900/90 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
          
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-1">
                Matumizi Pekee ya Anwani ya Gmail
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Anwani yako ya barua pepe (Gmail) inatumiwa kwa madhumuni moja tu: kukuongeza kwenye orodha ya watumiaji walioidhinishwa (Closed Testing Track) katika Google Play Console. Hatutaiuza, kuikodisha wala kuikabidhi kwa mtu mwingine yeyote.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <EyeOff className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-1">
                Hakuna Orodha ya Umma
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Barua pepe za testers hazionyeshwi hadharani kwa namna yoyote. Kila tester anaweza kuona hali ya ombi lake pekee kupitia kivinjari chake binafsi.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-1">
                Hakuna Taarifa Zisizohitajika
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Hatuombi taarifa za siri kama nenosiri (passwords), namba za akaunti ya benki wala taarifa binafsi zisizo na uhusiano na majaribio ya software.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 text-center">
            Kwa maswali yoyote kuhusu faragha au kuomba kufuta taarifa zako, wasiliana na msimamizi wetu kupitia barua pepe ya mradi.
          </div>

        </div>

      </div>
    </section>
  );
};
