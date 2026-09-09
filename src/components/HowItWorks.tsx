import React from 'react';
import { Smartphone, Mail, Clock, Download, ArrowRight } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '1',
      title: 'Chagua App',
      description: 'Chagua programu unayotaka kuijaribu kati ya apps sita zinazopatikana hapo juu.',
      icon: Smartphone,
      color: 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30',
    },
    {
      num: '2',
      title: 'Tuma Gmail',
      description: 'Tumia Gmail unayotumia kwenye Google Play ili usajiliwe kwenye mfumo rasmi.',
      icon: Mail,
      color: 'from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30',
    },
    {
      num: '3',
      title: 'Subiri Uthibitisho',
      description: 'Subiri hadi ombi lako lithibitishwe na msimamizi katika Google Play Console.',
      icon: Clock,
      color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
    },
    {
      num: '4',
      title: 'Jiunge & Pakua',
      description: 'Fungua Google Play, jiunge na test na pakua app kisha uanze kuitumia na kutoa maoni.',
      icon: Download,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-20 bg-slate-900/50 border-y border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-3">
            Hatua 4 Rahisi
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white font-['Outfit'] tracking-tight">
            Jinsi ya Kujiunga na Majaribio
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            Mchakato wetu ni wa haraka, rahisi na hauhitaji ujuzi wowote wa kiufundi. Fuata hatua hizi nne:
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                id={`step-card-${step.num}`}
                className="relative rounded-3xl bg-slate-850 bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between hover:border-slate-700 transition-all hover:-translate-y-1 shadow-lg"
              >
                {/* Step Number Badge */}
                <div className="flex items-center justify-between mb-5">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.color} border flex items-center justify-center shadow-md`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-3xl font-black text-slate-700 font-['Outfit'] select-none">
                    0{step.num}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white font-['Outfit'] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Subtle progress indicator */}
                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>Hatua ya {step.num} kati ya 4</span>
                  {idx < 3 && <ArrowRight className="w-3.5 h-3.5 text-slate-600 hidden lg:block" />}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
