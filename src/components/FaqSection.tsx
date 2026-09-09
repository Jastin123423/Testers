import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: 'Je, ninahitaji Gmail?',
      answer: 'Ndiyo. Unahitaji Google account/Gmail utakayotumia kwenye Google Play kwenye simu yako ya Android ili msimamizi aweze kukuongeza kwenye orodha ya Closed Beta.',
    },
    {
      question: 'Je, nikituma Gmail nitapata app mara moja?',
      answer: 'Si lazima. Ombi lako linahitaji kuthibitishwa kwanza na msimamizi kwenye Google Play Console. Baada ya kuthibitishwa, rudi kwenye ukurasa huu na utaona kitufe cha kujiunga na kupakua.',
    },
    {
      question: 'Kwa nini ninahitaji kuwa tester?',
      answer: 'Testers hutusaidia kugundua bugs, matatizo ya usability na maeneo yanayohitaji kuboreshwa kabla ya app kutolewa rasmi kwa umma.',
    },
    {
      question: 'Je, ninaweza kujaribu app zaidi ya moja?',
      answer: 'Ndiyo. Unaweza kuomba kujaribu apps tofauti zinazopatikana kwenye programu hii ya beta testing kwa kuchagua app nyingine na kuwasilisha ombi lako.',
    },
    {
      question: 'Je, nitapakua app wapi?',
      answer: 'Baada ya kuidhinishwa, utapata kitufe kitakachokupeleka moja kwa moja kwenye Google Play Store ambapo utajiunga na majaribio na kupakua app rasmi.',
    },
    {
      question: 'Je, nikifunga browser na kurudi baadaye taarifa zangu zitakuwepo?',
      answer: 'Ndiyo! Mfumo hutumia kumbukumbu salama ya kivinjari chako (localStorage). Mradi hutafuta historia ya kivinjari chako, ukirudi kwenye tovuti hii kwa simu ile ile utaona mara moja hali ya ombi lako.',
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-16 sm:py-20 bg-slate-900/60 border-t border-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Msaada & Ufafanuzi</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white font-['Outfit'] tracking-tight">
            Maswali Yanayoulizwa Mara kwa Mara
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            Majibu ya maswali ya kawaida kuhusu jinsi ya kujiunga na kuwa tester wa apps zetu.
          </p>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                id={`faq-item-${idx}`}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-slate-800/90 border-cyan-500/40 shadow-md'
                    : 'bg-slate-850 bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-sm sm:text-base text-white">
                    {faq.question}
                  </span>
                  <div className={`p-1.5 rounded-lg bg-slate-800 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-cyan-400' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-700/50 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
