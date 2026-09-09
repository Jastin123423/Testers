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
import { 
  getAdminToken, 
  setAdminToken, 
  clearAdminToken,
  apiAdminLogin,
  apiAdminOverview,
  apiAdminTesters,
  apiUpdateTesterStatus,
  apiChangeTesterApp,
  apiDeleteTester,
  apiUpdateApp
} from '../lib/storage';
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
      const data = await apiAdminLogin(password);

      if (!data.success) {
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
      const [statsData, testersData] = await Promise.all([
        apiAdminOverview(token),
        apiAdminTesters(token),
      ]);

      if (!statsData.success || !testersData.success) {
        // Check if unauthorized
        if (statsData.message === 'Unauthorized' || testersData.message === 'Unauthorized') {
          handleLogout();
          return;
        }
      }

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
      const data = await apiUpdateTesterStatus(token, id, newStatus);
      
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
      const data = await apiChangeTesterApp(token, testerId, newAppId);
      
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
      const data = await apiDeleteTester(token, id);
      
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
      const data = await apiUpdateApp(token, editingApp.id, appForm);
      
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

  // ... Rest of the component remains the same (JSX)
  return (
    // ... Keep all existing JSX exactly as you had it
  );
};
