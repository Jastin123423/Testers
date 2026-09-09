/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ReturningUserStatus } from './components/ReturningUserStatus';
import { AppCard } from './components/AppCard';
import { RegisterModal } from './components/RegisterModal';
import { ChangeEmailModal } from './components/ChangeEmailModal';
import { SubmissionSuccessModal } from './components/SubmissionSuccessModal';
import { HowItWorks } from './components/HowItWorks';
import { TesterGuide } from './components/TesterGuide';
import { FaqSection } from './components/FaqSection';
import { PrivacySection } from './components/PrivacySection';
import { Footer } from './components/Footer';
import { AdminDashboard } from './components/AdminDashboard';

import { AppInfo, TesterRegistration } from './types';
import { INITIAL_APPS } from './data/initialApps';
import { 
  getOrCreateSessionId, 
  getCachedRegistrations, 
  cacheRegistrations,
  setRegistrationTimerForAll,
  getSavedEmail,
  setSavedEmail,
  apiCheckEmail,
  apiRegisterTester,
  apiChangeEmail
} from './lib/storage';
import { Lock, Mail, Sparkles } from 'lucide-react';

export default function App() {
  // Use INITIAL_APPS directly - no need to fetch from backend
  const [apps] = useState<AppInfo[]>(INITIAL_APPS);
  const [userRegistrations, setUserRegistrations] = useState<TesterRegistration[]>(getCachedRegistrations());
  const [savedEmail, setLocalSavedEmail] = useState<string | null>(getSavedEmail());
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [selectedAppForRegister, setSelectedAppForRegister] = useState<AppInfo | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isChangeEmailOpen, setIsChangeEmailOpen] = useState(false);
  const [lastSubmittedReg, setLastSubmittedReg] = useState<TesterRegistration | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Check for returning user
  const checkReturningUser = async () => {
    const sessionId = getOrCreateSessionId();
    const email = getSavedEmail();
    
    try {
      const result = await apiCheckEmail(email || '', sessionId);
      
      if (result.success && result.isReturning) {
        if (result.registrations && result.registrations.length > 0) {
          // Merge backend registrations with correct frontend URLs
          const mergedRegistrations = result.registrations.map(reg => {
            const app = INITIAL_APPS.find(a => a.id === reg.appId);
            return {
              ...reg,
              testingUrl: app?.testingUrl || reg.testingUrl
            };
          });
          
          setUserRegistrations(mergedRegistrations);
          cacheRegistrations(mergedRegistrations);
        }
        
        if (result.tester?.email && !email) {
          setSavedEmail(result.tester.email);
          setLocalSavedEmail(result.tester.email);
        }
      }
    } catch (error) {
      console.error('Error checking returning user:', error);
    }
  };

  // Sync user status from backend
  const refreshUserStatus = async () => {
    try {
      const sessionId = getOrCreateSessionId();
      const email = getSavedEmail();
      
      const result = await apiCheckEmail(email || '', sessionId);
      
      if (result.success && result.registrations) {
        // Merge with correct frontend URLs
        const mergedRegistrations = result.registrations.map(reg => {
          const app = INITIAL_APPS.find(a => a.id === reg.appId);
          return {
            ...reg,
            testingUrl: app?.testingUrl || reg.testingUrl
          };
        });
        
        setUserRegistrations(mergedRegistrations);
        cacheRegistrations(mergedRegistrations);
      }
    } catch (error) {
      console.error('Error refreshing user status:', error);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      
      // Initialize browser session identifier
      getOrCreateSessionId();

      // Check for returning user
      await checkReturningUser();

      // Check query params if #admin is in hash
      if (window.location.hash === '#admin') {
        setIsAdminOpen(true);
      }
      
      setIsLoading(false);
    };

    initialize();
  }, []);

  // Global registration: submitting email registers for all 6 apps
  const handleGlobalEmailSubmit = async (email: string): Promise<boolean> => {
    const sessionId = getOrCreateSessionId();
    const deviceId = localStorage.getItem('beta_tester_device_model') || undefined;
    
    try {
      const result = await apiRegisterTester({
        email,
        sessionId,
        deviceId,
        appId: INITIAL_APPS[0].id,
        appName: INITIAL_APPS[0].name,
        platform: 'Android',
      });

      if (!result.success) {
        throw new Error(result.message || 'Hitilafu ya kusajili. Tafadhali jaribu tena.');
      }

      // Save email
      setSavedEmail(email);
      setLocalSavedEmail(email);

      // Get all registrations and merge with correct URLs
      const checkResult = await apiCheckEmail(email, sessionId);
      
      const regList: TesterRegistration[] = checkResult.success && Array.isArray(checkResult.registrations) 
        ? checkResult.registrations.map(reg => {
            const app = INITIAL_APPS.find(a => a.id === reg.appId);
            return {
              ...reg,
              testingUrl: app?.testingUrl || reg.testingUrl
            };
          })
        : [];

      setUserRegistrations(regList);
      cacheRegistrations(regList);

      // Set 10-minute countdown for all apps
      const allAppIds = INITIAL_APPS.map(a => a.id);
      setRegistrationTimerForAll(allAppIds, 10);

      // Show success modal
      const summaryReg = regList[0] || result.registration;
      setLastSubmittedReg(summaryReg);
      setIsSuccessModalOpen(true);

      return true;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Hitilafu ya kusajili. Tafadhali jaribu tena.');
    }
  };

  // Single app modal submission
  const handleRegisterModalSubmit = async (email: string, _appId: string): Promise<TesterRegistration | null> => {
    await handleGlobalEmailSubmit(email);
    setIsRegisterModalOpen(false);
    return lastSubmittedReg;
  };

  const handleSelectAppToTry = (app: AppInfo) => {
    if (userRegistrations.length === 0) {
      const input = document.getElementById('input-hero-email');
      input?.focus();
      input?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      setSelectedAppForRegister(app);
      setIsRegisterModalOpen(true);
    }
  };

  const scrollToApps = () => {
    const element = document.getElementById('apps');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      const locked = document.getElementById('apps-locked');
      locked?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToStatus = () => {
    const element = document.getElementById('tester-status-banner');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      scrollToApps();
    }
  };

  const hasRegistered = userRegistrations.length > 0;
  const currentEmail = savedEmail || userRegistrations[0]?.email || null;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      <Navbar
        userRegistrations={userRegistrations}
        onOpenStatus={scrollToStatus}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onSelectAppClick={scrollToApps}
      />

      <main className="flex-1">
        
        <Hero
          hasRegistered={hasRegistered}
          registeredEmail={currentEmail}
          onSubmitEmail={handleGlobalEmailSubmit}
          onOpenChangeEmail={() => setIsChangeEmailOpen(true)}
          onExploreApps={scrollToApps}
        />

        {hasRegistered && (
          <ReturningUserStatus
            registrations={userRegistrations}
            onRefresh={refreshUserStatus}
            onApplyAnother={scrollToApps}
            onOpenChangeEmail={() => setIsChangeEmailOpen(true)}
          />
        )}

        {hasRegistered ? (
          <section id="apps" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-14">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Programu Zote 6 Zimefunguliwa</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white font-['Outfit'] tracking-tight">
                Programu Zetu Sita (6) za Android
              </h2>
              <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
                Umesajiliwa kwenye programu zote 6. Idhini yako ikishathibitishwa na msimamizi, utaona kitufe cha kupakua moja kwa moja kutoka Google Play Store.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {apps.map((app) => {
                const userReg = userRegistrations.find(r => r.appId === app.id);
                return (
                  <AppCard
                    key={app.id}
                    app={app}
                    userRegistration={userReg}
                    onSelectApp={handleSelectAppToTry}
                    onViewStatus={scrollToStatus}
                  />
                );
              })}
            </div>

            <div className="mt-14 text-center p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 max-w-xl mx-auto shadow-xl">
              <p className="text-xs sm:text-sm text-slate-300 mb-2 font-medium">
                Ulikosea kuweka barua pepe yako au programu hazionekani ipasavyo?
              </p>
              <button
                id="btn-reenter-email-below-apps"
                onClick={() => setIsChangeEmailOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>Weka / Sahihisha Barua Pepe Yako Hapa</span>
              </button>
            </div>

          </section>
        ) : (
          <section id="apps-locked" className="py-12 max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <div className="p-8 rounded-3xl bg-slate-800/40 border border-slate-700/60 flex flex-col items-center justify-center gap-3 shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white font-['Outfit']">
                Programu Zote 6 Zitaonekana Baada ya Kujaza Gmail
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md">
                Jaza barua pepe yako ya Gmail hapo juu ili kujiunga na majaribio ya programu zote 6 kwa wakati mmoja na kuziona mara moja.
              </p>
              
              <div className="mt-3 pt-3 border-t border-slate-700/60 w-full flex flex-col sm:flex-row items-center justify-center gap-2 text-xs">
                <span className="text-slate-400">Uliwahi kujisajili lakini programu hazionekani?</span>
                <button
                  id="btn-reenter-email-locked"
                  onClick={() => setIsChangeEmailOpen(true)}
                  className="text-cyan-400 hover:text-cyan-300 underline font-bold cursor-pointer"
                >
                  Weka barua pepe yako tena hapa
                </button>
              </div>
            </div>
          </section>
        )}

        <HowItWorks />
        <TesterGuide />
        <FaqSection />
        <PrivacySection />

      </main>

      <Footer onAdminClick={() => setIsAdminOpen(true)} />

      <RegisterModal
        app={selectedAppForRegister}
        isOpen={isRegisterModalOpen}
        onClose={() => {
          setIsRegisterModalOpen(false);
          setSelectedAppForRegister(null);
        }}
        onSubmit={handleRegisterModalSubmit}
      />

      <ChangeEmailModal
        isOpen={isChangeEmailOpen}
        onClose={() => setIsChangeEmailOpen(false)}
        onSuccess={(updatedRegs, updatedEmail) => {
          // Merge with correct URLs
          const mergedRegs = updatedRegs.map(reg => {
            const app = INITIAL_APPS.find(a => a.id === reg.appId);
            return {
              ...reg,
              testingUrl: app?.testingUrl || reg.testingUrl
            };
          });
          setUserRegistrations(mergedRegs);
          setLocalSavedEmail(updatedEmail);
          scrollToApps();
        }}
        currentEmail={currentEmail || ''}
        allAppIds={INITIAL_APPS.map(a => a.id)}
      />

      <SubmissionSuccessModal
        registration={lastSubmittedReg}
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        onViewStatus={scrollToStatus}
      />

      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        apps={INITIAL_APPS}
        onAppsUpdated={() => {}}
      />

    </div>
  );
}
