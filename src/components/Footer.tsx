import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

interface FooterProps {
  onAdminClick: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onAdminClick }) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-8 border-b border-slate-850">
          
          {/* Brand & Mission */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xl font-extrabold text-white font-['Outfit']">
                Beta Testing <span className="text-cyan-400">Hub</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm">
              Programu zetu zinaboreshwa kwa msaada wa testers wetu.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 text-xs sm:text-sm font-medium">
            <a href="#apps" className="hover:text-cyan-400 transition-colors">
              Apps
            </a>
            <a href="#how-it-works" className="hover:text-cyan-400 transition-colors">
              Jinsi ya Kujaribu
            </a>
            <a href="#faq" className="hover:text-cyan-400 transition-colors">
              FAQ
            </a>
            <a href="#privacy" className="hover:text-cyan-400 transition-colors">
              Privacy Policy
            </a>
            <button
              onClick={onAdminClick}
              className="hover:text-cyan-400 transition-colors cursor-pointer text-slate-400"
            >
              Usimamizi (Admin)
            </button>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © 2026 Beta Testing Hub. All rights reserved.
          </div>
          <div className="flex items-center gap-1">
            Imeandaliwa kwa ajili ya watumiaji wa Android nchini Tanzania 🇹🇿
          </div>
        </div>

      </div>
    </footer>
  );
};
