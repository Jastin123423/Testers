import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  LogOut, 
  Users, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Copy, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Filter, 
  RefreshCw, 
  Settings, 
  Save, 
  X, 
  Check, 
  Smartphone,
  ChevronRight,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { AppInfo, TesterRegistration, AdminStats, TesterStatus } from '../types';
import { getAdminToken, setAdminToken, clearAdminToken } from '../lib/storage';
import { AppIcon } from './AppIcon';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  apps: AppInfo[];
  onAppsUpdated: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  apps,
  onAppsUpdated,
}) => {
  const [token, setToken] = useState<string | null>(getAdminToken());
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<'overview' | 'testers' | 'apps'>('overview');
  
  // Data state
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [testers, setTesters] = useState<TesterRegistration[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [appFilter, setAppFilter] = useState<string>('all');

  // Selected tester details modal
  const [selectedTester, setSelectedTester] = useState<TesterRegistration | null>(null);
  const [changeAppModalTester, setChangeAppModalTester] = useState<TesterRegistration | null>(null);

  // App editing state
  const [editingApp, setEditingApp] = useState<AppInfo | null>(null);
  const [appForm, setAppForm] = useState<Partial<AppInfo>>({});
  const [appSaveSuccess, setAppSaveSuccess] = useState<string | null>(null);

  // Copy notification state
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  useEffect(() => {
    if (token && isOpen) {
      loadDashboardData();
    }
  }, [token, isOpen]);

  if (!isOpen) return null;

  const showCopyNotice = (msg: string) => {
    setCopiedNotification(msg);
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Nenosiri si sahihi.');
      }

      setAdminToken(data.token);
      setToken(data.token);
      setPassword('');
    } catch (err: any) {
      setLoginError(err.message || 'Hitilafu ya kuingia');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    clearAdminToken();
    setToken(null);
    setStats(null);
    setTesters([]);
  };

  const loadDashboardData = async () => {
    if (!token) return;
    setLoadingData(true);
    try {
      const [statsRes, testersRes] = await Promise.all([
        fetch('/api/admin/overview', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/admin/testers', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (statsRes.status === 401 || testersRes.status === 401) {
        handleLogout();
        return;
      }

      const statsData = await statsRes.json();
      const testersData = await testersRes.json();

      if (statsData.success) setStats(statsData.stats);
      if (testersData.success) setTesters(testersData.testers);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: TesterStatus) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/testers/${id}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        loadDashboardData();
        if (selectedTester && selectedTester.id === id) {
          setSelectedTester(data.tester);
        }
      }
    } catch (err) {
      console.error('Failed to change status:', err);
    }
  };

  const handleChangeApp = async (testerId: string, newAppId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/testers/${testerId}/change-app`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ appId: newAppId }),
      });
      const data = await res.json();
      if (data.success) {
        setChangeAppModalTester(null);
        loadDashboardData();
      }
    } catch (err) {
      console.error('Failed to change app:', err);
    }
  };

  const handleDeleteTester = async (id: string) => {
    if (!token) return;
    if (!window.confirm('Je, una uhakika unataka kufuta usajili huu wa tester?')) return;

    try {
      const res = await fetch(`/api/admin/testers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        if (selectedTester?.id === id) setSelectedTester(null);
        loadDashboardData();
      }
    } catch (err) {
      console.error('Failed to delete tester:', err);
    }
  };

  const handleSaveApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingApp) return;

    try {
      const res = await fetch(`/api/admin/apps/${editingApp.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(appForm),
      });
      const data = await res.json();
      if (data.success) {
        setAppSaveSuccess('Mabadiliko ya app yamehifadhiwa kikamilifu!');
        setTimeout(() => setAppSaveSuccess(null), 3000);
        onAppsUpdated();
        loadDashboardData();
        setEditingApp(null);
      }
    } catch (err) {
      console.error('Failed to save app:', err);
    }
  };

  // Bulk copy approved emails formatted for Google Play Console Closed Testing CSV/List
  const copyApprovedEmails = () => {
    const approved = testers.filter(t => t.status === 'approved');
    if (approved.length === 0) {
      alert('Hakuna testers walioidhinishwa (Approved) kwa sasa.');
      return;
    }
    const emailList = approved.map(t => t.email).join(', ');
    navigator.clipboard.writeText(emailList);
    showCopyNotice(`Barua pepe ${approved.length} zimenakiliwa tayari kwa ajili ya Google Play Console!`);
  };

  // Copy single email
  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    showCopyNotice(`Barua pepe "${email}" imenakiliwa!`);
  };

  // Filtered testers list
  const filteredTesters = testers.filter(t => {
    const matchesSearch = 
      t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.appName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.sessionId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesApp = appFilter === 'all' || t.appId === appFilter;

    return matchesSearch && matchesStatus && matchesApp;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        id="admin-dashboard-modal"
        className="relative w-full max-w-6xl h-[92vh] max-h-[900px] flex flex-col rounded-3xl bg-slate-900 border border-slate-700/90 shadow-2xl overflow-hidden"
      >
        
        {/* Modal Topbar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-850 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
                Dashboard ya Msimamizi (Admin Hub)
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-850 text-cyan-300 border border-slate-700">
                  Google Play Testing
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Dhibiti testers, idhinisha maombi na urekebishe Play Store Testing URLs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {token && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-300 bg-red-950/40 hover:bg-red-900/50 border border-red-500/30 transition-colors cursor-pointer"
                title="Toka"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ondoka</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 cursor-pointer"
              aria-label="Funga"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Copy Toast Alert */}
        {copiedNotification && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-xl flex items-center gap-2 animate-bounce">
            <Check className="w-4 h-4" />
            <span>{copiedNotification}</span>
          </div>
        )}

        {/* LOGIN SCREEN IF NOT AUTHENTICATED */}
        {!token ? (
          <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
            <div className="w-full max-w-md p-8 rounded-3xl bg-slate-850 border border-slate-700 shadow-xl text-center">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white font-['Outfit'] mb-2">
                Kuingia kwa Msimamizi
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Ingiza nenosiri la msimamizi ili kudhibiti maombi ya beta testing na links za Play Store.
              </p>

              <form onSubmit={handleLogin} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Nenosiri la Admin:
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Weka nenosiri la msimamizi"
                    autoFocus
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                {loginError && (
                  <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300">
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-all cursor-pointer shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                >
                  {loginLoading ? 'Inathibitisha...' : 'Ingia Dashboard'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* AUTHENTICATED DASHBOARD CONTENT */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Dashboard Tabs */}
            <div className="flex items-center justify-between px-6 border-b border-slate-800 bg-slate-900 shrink-0">
              <div className="flex gap-2">
                <button
                  id="tab-overview"
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === 'overview'
                      ? 'border-cyan-400 text-cyan-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Muhtasari (Overview)</span>
                </button>

                <button
                  id="tab-testers"
                  onClick={() => setActiveTab('testers')}
                  className={`px-4 py-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === 'testers'
                      ? 'border-cyan-400 text-cyan-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Usimamizi wa Testers ({testers.length})</span>
                </button>

                <button
                  id="tab-apps"
                  onClick={() => setActiveTab('apps')}
                  className={`px-4 py-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === 'apps'
                      ? 'border-cyan-400 text-cyan-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Usimamizi wa Apps 6 (Play Links)</span>
                </button>
              </div>

              <button
                onClick={loadDashboardData}
                disabled={loadingData}
                className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors cursor-pointer"
                title="Pakia upya taarifa"
              >
                <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin text-cyan-400' : ''}`} />
              </button>
            </div>

            {/* Main Tab Views Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-900/60">

              {/* 1. OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Top Stats Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-5 rounded-2xl bg-slate-850 border border-slate-800">
                      <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                        <span>Jumla ya Testers</span>
                        <Users className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-white font-['Outfit'] mt-2">
                        {stats?.totalTesters ?? testers.length}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">Maombi yote yaliyopokelewa</div>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-850 border border-slate-800">
                      <div className="flex items-center justify-between text-amber-400 text-xs font-medium">
                        <span>Yanayosubiri (Pending)</span>
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-amber-400 font-['Outfit'] mt-2">
                        {stats?.pendingCount ?? testers.filter(t => t.status === 'pending').length}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">Yanahitaji kuidhinishwa</div>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-850 border border-slate-800">
                      <div className="flex items-center justify-between text-emerald-400 text-xs font-medium">
                        <span>Yaliyoidhinishwa (Approved)</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-['Outfit'] mt-2">
                        {stats?.approvedCount ?? testers.filter(t => t.status === 'approved').length}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">Wameruhusiwa Play Store</div>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-850 border border-slate-800">
                      <div className="flex items-center justify-between text-red-450 text-xs font-medium text-red-400">
                        <span>Yaliyokataliwa (Rejected)</span>
                        <XCircle className="w-4 h-4" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-red-400 font-['Outfit'] mt-2">
                        {stats?.rejectedCount ?? testers.filter(t => t.status === 'rejected').length}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">Hajaruhusiwa awamu hii</div>
                    </div>
                  </div>

                  {/* Google Play Console Action Banner */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-cyan-400" />
                        <span>Kuwezesha Testers kwenye Google Play Console</span>
                      </h4>
                      <p className="text-xs text-slate-300 mt-1 max-w-xl">
                        Nakili barua pepe zote zilizoidhinishwa (comma-separated) kisha zibandike (paste) kwenye orodha ya <em>Closed Testing Track &gt; Testers</em> ndani ya Google Play Console ili watumiaji wapate ruhusa ya kupakua app.
                      </p>
                    </div>
                    <button
                      onClick={copyApprovedEmails}
                      className="shrink-0 px-4 py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-cyan-400 hover:bg-cyan-300 flex items-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Nakili Barua Pepe Zote Zilizoidhinishwa</span>
                    </button>
                  </div>

                  {/* Breakdown by App */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                      Mgawanyo wa Maombi Kulingana na App (Testers by App):
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {apps.map(app => {
                        const appTesters = testers.filter(t => t.appId === app.id);
                        const approved = appTesters.filter(t => t.status === 'approved').length;
                        const pending = appTesters.filter(t => t.status === 'pending').length;

                        return (
                          <div 
                            key={app.id} 
                            className="p-4 rounded-2xl bg-slate-850 border border-slate-800 hover:border-slate-700 transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                style={{ backgroundColor: `${app.accentColor}18`, color: app.accentColor }}
                              >
                                <AppIcon name={app.iconName} className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-sm text-white truncate">{app.name}</div>
                                <div className="text-[11px] text-slate-400 truncate">{app.category}</div>
                              </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                              <span className="text-slate-400">Jumla: <strong className="text-white">{appTesters.length}</strong></span>
                              <span className="text-emerald-400 font-semibold">{approved} Imeidhinishwa</span>
                              <span className="text-amber-400 font-semibold">{pending} Inasubiri</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recently Registered Testers */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                      Maombi Mapya ya Hivi Karibuni:
                    </h4>
                    <div className="rounded-2xl bg-slate-850 border border-slate-800 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-800/80 text-slate-400 uppercase font-bold tracking-wider text-[10px]">
                            <tr>
                              <th className="px-4 py-3">Gmail ya Tester</th>
                              <th className="px-4 py-3">App</th>
                              <th className="px-4 py-3">Tarehe</th>
                              <th className="px-4 py-3">Hali (Status)</th>
                              <th className="px-4 py-3 text-right">Vitendo vya Haraka</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                            {testers.slice(0, 6).map(t => (
                              <tr key={t.id} className="hover:bg-slate-800/40">
                                <td className="px-4 py-3 font-medium text-white flex items-center gap-2">
                                  <span>{t.email}</span>
                                  <button
                                    onClick={() => copyEmail(t.email)}
                                    className="text-slate-500 hover:text-cyan-400 cursor-pointer"
                                    title="Nakili"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                </td>
                                <td className="px-4 py-3 text-slate-300">{t.appName}</td>
                                <td className="px-4 py-3 text-slate-400">
                                  {new Date(t.createdAt).toLocaleString('sw-TZ', { dateStyle: 'short', timeStyle: 'short' })}
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                                    t.status === 'approved' 
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                      : t.status === 'rejected'
                                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  }`}>
                                    {t.status === 'approved' ? 'Approved' : t.status === 'rejected' ? 'Rejected' : 'Pending'}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right space-x-2">
                                  {t.status !== 'approved' && (
                                    <button
                                      onClick={() => handleStatusChange(t.id, 'approved')}
                                      className="px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold cursor-pointer"
                                    >
                                      Idhinisha
                                    </button>
                                  )}
                                  {t.status !== 'rejected' && (
                                    <button
                                      onClick={() => handleStatusChange(t.id, 'rejected')}
                                      className="px-2 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-300 text-[11px] font-bold cursor-pointer"
                                    >
                                      Kataa
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* 2. TESTERS MANAGEMENT TAB */}
              {activeTab === 'testers' && (
                <div className="space-y-4">
                  {/* Filters and Search Bar */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-850 border border-slate-800">
                    <div className="relative w-full sm:w-72">
                      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Tafuta Gmail, App, au ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      {/* Filter by Status */}
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none"
                      >
                        <option value="all">Hali Zote (All Statuses)</option>
                        <option value="pending">⏳ Inasubiri (Pending)</option>
                        <option value="approved">✅ Umeruhusiwa (Approved)</option>
                        <option value="rejected">❌ Imekataliwa (Rejected)</option>
                      </select>

                      {/* Filter by App */}
                      <select
                        value={appFilter}
                        onChange={(e) => setAppFilter(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none"
                      >
                        <option value="all">Apps Zote (All Apps)</option>
                        {apps.map(a => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>

                      <button
                        onClick={copyApprovedEmails}
                        className="px-3 py-2 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 flex items-center gap-1.5 cursor-pointer"
                        title="Nakili emails za approved testers"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Nakili Approved ({testers.filter(t => t.status === 'approved').length})</span>
                      </button>
                    </div>
                  </div>

                  {/* Testers Full Table */}
                  <div className="rounded-2xl bg-slate-850 border border-slate-800 overflow-hidden shadow-lg">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-800 text-slate-300 uppercase font-bold tracking-wider text-[10px]">
                          <tr>
                            <th className="px-4 py-3.5">Tester ID</th>
                            <th className="px-4 py-3.5">Gmail ya Tester</th>
                            <th className="px-4 py-3.5">Selected App</th>
                            <th className="px-4 py-3.5">Registration Date</th>
                            <th className="px-4 py-3.5">Status</th>
                            <th className="px-4 py-3.5">Browser Session ID</th>
                            <th className="px-4 py-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {filteredTesters.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                                Hakuna testers waliopatikana kwa vigezo hivi.
                              </td>
                            </tr>
                          ) : (
                            filteredTesters.map(t => (
                              <tr key={t.id} className="hover:bg-slate-800/50 transition-colors">
                                <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                                  {t.id}
                                </td>
                                <td className="px-4 py-3 font-medium text-white">
                                  <div className="flex items-center gap-1.5">
                                    <span>{t.email}</span>
                                    <button
                                      onClick={() => copyEmail(t.email)}
                                      className="text-slate-500 hover:text-cyan-400 cursor-pointer"
                                      title="Copy email"
                                    >
                                      <Copy className="w-3 h-3" />
                                    </button>
                                  </div>
                                  {t.deviceInfo && (
                                    <div className="text-[10px] text-slate-400 mt-0.5">
                                      Simu: {t.deviceInfo}
                                    </div>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-slate-200 font-semibold">
                                  {t.appName}
                                </td>
                                <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                                  {new Date(t.createdAt).toLocaleString('sw-TZ', { 
                                    day: 'numeric', 
                                    month: 'short', 
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold ${
                                    t.status === 'approved' 
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                      : t.status === 'rejected'
                                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  }`}>
                                    {t.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                                    {t.status === 'pending' && <Clock className="w-3 h-3" />}
                                    {t.status === 'rejected' && <XCircle className="w-3 h-3" />}
                                    <span className="capitalize">{t.status}</span>
                                  </span>
                                </td>
                                <td className="px-4 py-3 font-mono text-[10px] text-slate-500 truncate max-w-[120px]" title={t.sessionId}>
                                  {t.sessionId}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <div className="inline-flex items-center gap-1">
                                    {/* Quick Status Toggles */}
                                    {t.status !== 'approved' && (
                                      <button
                                        onClick={() => handleStatusChange(t.id, 'approved')}
                                        className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/20 transition-colors cursor-pointer"
                                        title="Approve Tester (Idhinisha)"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                      </button>
                                    )}

                                    {t.status !== 'rejected' && (
                                      <button
                                        onClick={() => handleStatusChange(t.id, 'rejected')}
                                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/20 transition-colors cursor-pointer"
                                        title="Reject Tester (Kataa)"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    )}

                                    {/* View Details */}
                                    <button
                                      onClick={() => setSelectedTester(t)}
                                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                                      title="View Details"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>

                                    {/* Change App */}
                                    <button
                                      onClick={() => setChangeAppModalTester(t)}
                                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-colors cursor-pointer"
                                      title="Change App"
                                    >
                                      <Smartphone className="w-3.5 h-3.5" />
                                    </button>

                                    {/* Delete */}
                                    <button
                                      onClick={() => handleDeleteTester(t.id)}
                                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-900/40 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                                      title="Delete Registration"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. APP MANAGEMENT TAB (Editable Play Testing URLs) */}
              {activeTab === 'apps' && (
                <div className="space-y-6">
                  <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800">
                    <h3 className="text-sm font-bold text-white mb-1">
                      Usimamizi wa Viungo vya Google Play Testing (Play Testing URLs)
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Kila app ina Google Play Closed Testing URL yake. Tester anapoidhinishwa (Approved), tovuti itaonyesha kiungo hiki kwake. Unaweza kubadilisha viungo hivi hapa chini wakati wowote.
                    </p>
                  </div>

                  {appSaveSuccess && (
                    <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>{appSaveSuccess}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {apps.map(app => (
                      <div 
                        key={app.id}
                        className="p-5 rounded-2xl bg-slate-850 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                style={{ backgroundColor: `${app.accentColor}18`, color: app.accentColor }}
                              >
                                <AppIcon name={app.iconName} className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-bold text-base text-white">{app.name}</h4>
                                <span className="text-[11px] text-slate-400">{app.category}</span>
                              </div>
                            </div>

                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              app.isActive 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              {app.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>

                          <p className="text-xs text-slate-300 mb-3">{app.tagline}</p>

                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                              Google Play Testing URL:
                            </div>
                            <div className="font-mono text-[11px] text-cyan-300 break-all flex items-center justify-between gap-2">
                              <span>{app.testingUrl}</span>
                              <a
                                href={app.testingUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-slate-400 hover:text-white shrink-0 p-1"
                                title="Open link in new tab"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-end">
                          <button
                            onClick={() => {
                              setEditingApp(app);
                              setAppForm({
                                name: app.name,
                                tagline: app.tagline,
                                description: app.description,
                                testingUrl: app.testingUrl,
                                isActive: app.isActive,
                                dualCameraNote: app.dualCameraNote,
                                privateAreaNote: app.privateAreaNote,
                              });
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Rekebisha Maelezo / URL</span>
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>

                </div>
              )}

            </div>

          </div>
        )}

        {/* MODAL: Tester Details & Quick Note */}
        {selectedTester && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white">Taarifa za Tester</h3>
                <button 
                  onClick={() => setSelectedTester(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <div>
                  <span className="text-slate-400">Tester ID:</span>
                  <div className="font-mono text-white mt-0.5">{selectedTester.id}</div>
                </div>
                <div>
                  <span className="text-slate-400">Gmail:</span>
                  <div className="font-medium text-white mt-0.5 flex items-center gap-2">
                    <span>{selectedTester.email}</span>
                    <button 
                      onClick={() => copyEmail(selectedTester.email)} 
                      className="text-cyan-400 hover:underline text-[10px]"
                    >
                      (Nakili)
                    </button>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">App Iliyochaguliwa:</span>
                  <div className="font-bold text-white mt-0.5">{selectedTester.appName}</div>
                </div>
                <div>
                  <span className="text-slate-400">Browser Session ID:</span>
                  <div className="font-mono text-slate-300 mt-0.5 break-all">{selectedTester.sessionId}</div>
                </div>
                {selectedTester.deviceInfo && (
                  <div>
                    <span className="text-slate-400">Kifaa / Simu:</span>
                    <div className="text-slate-200 mt-0.5">{selectedTester.deviceInfo}</div>
                  </div>
                )}
                <div>
                  <span className="text-slate-400">Tarehe ya Usajili:</span>
                  <div className="text-slate-300 mt-0.5">{new Date(selectedTester.createdAt).toLocaleString('sw-TZ')}</div>
                </div>

                <div className="pt-3 border-t border-slate-800">
                  <span className="text-slate-400 block mb-1.5">Badilisha Hali (Status):</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusChange(selectedTester.id, 'approved')}
                      className={`flex-1 py-2 rounded-xl font-bold text-xs cursor-pointer ${
                        selectedTester.status === 'approved' 
                          ? 'bg-emerald-500 text-slate-950' 
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedTester.id, 'pending')}
                      className={`flex-1 py-2 rounded-xl font-bold text-xs cursor-pointer ${
                        selectedTester.status === 'pending' 
                          ? 'bg-amber-500 text-slate-950' 
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      Pending
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedTester.id, 'rejected')}
                      className={`flex-1 py-2 rounded-xl font-bold text-xs cursor-pointer ${
                        selectedTester.status === 'rejected' 
                          ? 'bg-red-500 text-slate-950' 
                          : 'bg-red-500/10 text-red-400 border border-red-500/30'
                      }`}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: Change Assigned App */}
        {changeAppModalTester && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white">Badilisha App ya Tester</h3>
                <button onClick={() => setChangeAppModalTester(null)} className="p-1 rounded text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                <p className="text-xs text-slate-300">
                  Mtumiaji: <strong>{changeAppModalTester.email}</strong>
                </p>
                <div className="space-y-1.5">
                  {apps.map(app => (
                    <button
                      key={app.id}
                      onClick={() => handleChangeApp(changeAppModalTester.id, app.id)}
                      className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between cursor-pointer ${
                        changeAppModalTester.appId === app.id 
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                          : 'bg-slate-800 hover:bg-slate-750 text-slate-200'
                      }`}
                    >
                      <span>{app.name}</span>
                      {changeAppModalTester.appId === app.id && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: Edit App & Testing URL */}
        {editingApp && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white">
                  Rekebisha: {editingApp.name}
                </h3>
                <button onClick={() => setEditingApp(null)} className="p-1 rounded text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveApp} className="mt-4 space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Google Play Testing URL: <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="url"
                    value={appForm.testingUrl || ''}
                    onChange={(e) => setAppForm({ ...appForm, testingUrl: e.target.value })}
                    required
                    placeholder="https://play.google.com/apps/testing/..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-xs focus:ring-2 focus:ring-cyan-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Hii ndio URL itakayofunguka mtumiaji aliyeruhusiwa anapobofya "Jiunge na Test & Pakua App".
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Jina la App (App Name):
                  </label>
                  <input
                    type="text"
                    value={appForm.name || ''}
                    onChange={(e) => setAppForm({ ...appForm, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Kaulimbiu Fupi (Tagline):
                  </label>
                  <input
                    type="text"
                    value={appForm.tagline || ''}
                    onChange={(e) => setAppForm({ ...appForm, tagline: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Maelezo ya App (Description):
                  </label>
                  <textarea
                    rows={3}
                    value={appForm.description || ''}
                    onChange={(e) => setAppForm({ ...appForm, description: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                  />
                </div>

                {editingApp.id === 'free-screen-recorder' && (
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      Kipengele Maalum cha Dual-Camera:
                    </label>
                    <textarea
                      rows={2}
                      value={appForm.dualCameraNote || ''}
                      onChange={(e) => setAppForm({ ...appForm, dualCameraNote: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                    />
                  </div>
                )}

                {(editingApp.id === 'top-file-manager' || editingApp.id === 'int-calculator') && (
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      Kipengele Maalum cha Faragha (Vault/Private Area):
                    </label>
                    <textarea
                      rows={2}
                      value={appForm.privateAreaNote || ''}
                      onChange={(e) => setAppForm({ ...appForm, privateAreaNote: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="chk-active"
                    checked={appForm.isActive ?? true}
                    onChange={(e) => setAppForm({ ...appForm, isActive: e.target.checked })}
                    className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="chk-active" className="text-xs text-slate-300 cursor-pointer">
                    App inaonekana hadharani kwenye tovuti (Active)
                  </label>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl font-bold text-xs text-slate-950 bg-cyan-400 hover:bg-cyan-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    <span>Hifadhi Mabadiliko</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingApp(null)}
                    className="px-4 py-3 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 border border-slate-700 cursor-pointer"
                  >
                    Ghairi
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
