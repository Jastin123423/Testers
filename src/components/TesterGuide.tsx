import React from 'react';
import { Sparkles, MessageSquare, AlertCircle, ShieldAlert, HeartHandshake, Bug } from 'lucide-react';

export const TesterGuide: React.FC = () => {
  const guidelines = [
    {
      title: 'Itumie Kama Mtumiaji wa Kawaida',
      text: 'Baada ya kusakinisha app, tafadhali itumie kama mtumiaji wa kawaida katika shughuli zako za kila siku.',
      icon: Sparkles,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    },
    {
      title: 'Jaribu Vipengele Mbalimbali',
      text: 'Jaribu vipengele mbalimbali vilivyopo kwenye app ili kuona kama vinafanya kazi kwa ufasaha kwenye simu yako.',
      icon: Bug,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    },
    {
      title: 'Ukiona Tatizo, Tujulishe',
      text: 'Ukiona hitilafu (crash), maneno yaliyokatika au huduma isiyofanya kazi, tafadhali tujulishe kupitia Google Play au barua pepe yetu.',
      icon: MessageSquare,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    {
      title: 'Usifute App Wakati wa Majaribio',
      text: 'Usifute app wakati wa kipindi cha majaribio isipokuwa kuna sababu maalum, ili uweze kupokea maboresho mapya ya kiotomatiki.',
      icon: ShieldAlert,
      color: 'text-red-400 bg-red-500/10 border-red-500/20',
    },
  ];

  return (
    <section id="tester-guide" className="py-16 sm:py-20 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Mchango Wako Ni Muhimu</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white font-['Outfit'] tracking-tight">
            Jinsi ya Kuwa Tester Mzuri
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            Feedback yako itatusaidia kuboresha app kabla ya kutolewa rasmi kwa mamilioni ya watumiaji ulimwenguni kote.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {guidelines.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                className="p-6 rounded-3xl bg-slate-800/60 border border-slate-700/70 hover:border-slate-600 transition-all flex items-start gap-4"
              >
                <div className={`p-3 rounded-2xl ${item.color} border shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-['Outfit'] mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {item.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Motivational Banner */}
        <div className="mt-10 p-5 max-w-3xl mx-auto rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-slate-900 border border-indigo-500/30 text-center">
          <p className="text-xs sm:text-sm text-indigo-200">
            💡 <strong>Kumbuka:</strong> Lengo la beta testing ni kupata maoni halisi toka kwa watumiaji nchini Tanzania ili kufanya programu zetu ziwe salama, za kuaminika na zenye tija.
          </p>
        </div>

      </div>
    </section>
  );
};
