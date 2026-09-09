export interface AppInfo {
  id: string;
  name: string;
  tagline: string;
  description: string;
  dualCameraNote?: string;
  privateAreaNote?: string;
  features: string[];
  testingUrl: string;
  accentColor: string;
  badgeBg: string;
  badgeBorder: string;
  category: string;
  iconName: 'file-text' | 'video' | 'briefcase' | 'music' | 'folder-lock' | 'calculator';
  isActive: boolean;
  order: number;
}

export type TesterStatus = 'pending' | 'approved' | 'rejected';

export interface TesterRegistration {
  id: string;
  email: string;
  appId: string;
  appName: string;
  sessionId: string;
  status: TesterStatus;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  deviceInfo?: string;
  adminNotes?: string;
  testingUrl?: string; // provided when approved
}

export interface AdminStats {
  totalTesters: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  byApp: Record<string, { name: string; count: number; approved: number }>;
  recentTesters: TesterRegistration[];
}
