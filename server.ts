import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { INITIAL_APPS } from './src/data/initialApps';
import { AppInfo, TesterRegistration, AdminStats } from './src/types';

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface DatabaseSchema {
  apps: AppInfo[];
  testers: TesterRegistration[];
  adminTokens: Record<string, { createdAt: number; expiresAt: number }>;
}

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(raw);
      return {
        apps: Array.isArray(data.apps) && data.apps.length > 0 ? data.apps : INITIAL_APPS,
        testers: Array.isArray(data.testers) ? data.testers : [],
        adminTokens: data.adminTokens || {},
      };
    }
  } catch (err) {
    console.error('Error reading database file, initializing defaults:', err);
  }

  const initial: DatabaseSchema = {
    apps: INITIAL_APPS,
    testers: [],
    adminTokens: {},
  };
  saveDatabase(initial);
  return initial;
}

function saveDatabase(db: DatabaseSchema) {
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Error writing database file:', err);
  }
}

// In-memory cache synced to file
let db = loadDatabase();

// Rate limiting in-memory map
const submissionRateMap = new Map<string, number[]>();

function checkRateLimit(ipOrSession: string): boolean {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000; // 10 minutes
  const maxAttempts = 12; // generous for testing multiple apps

  const timestamps = submissionRateMap.get(ipOrSession) || [];
  const validTimestamps = timestamps.filter(t => now - t < windowMs);

  if (validTimestamps.length >= maxAttempts) {
    return false;
  }

  validTimestamps.push(now);
  submissionRateMap.set(ipOrSession, validTimestamps);
  return true;
}

async function startServer() {
  const app = express();

  app.use(express.json());

  // Log requests in dev
  app.use((req, res, next) => {
    if (req.url.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.url}`);
    }
    next();
  });

  // Admin Auth Middleware
  function requireAdmin(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace(/^Bearer\s+/i, '') || (req.headers['x-admin-token'] as string);

    if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthenticated: Token missing' });
    }

    const tokenData = db.adminTokens[token];
    if (!tokenData || tokenData.expiresAt < Date.now()) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Session expired or invalid' });
    }

    next();
  }

  // --- PUBLIC APIS ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Get active apps list
  app.get('/api/apps', (req, res) => {
    // Return all active apps
    const activeApps = db.apps.filter(a => a.isActive);
    res.json({
      success: true,
      apps: activeApps,
    });
  });

  // Register tester for all apps
  app.post('/api/register', (req, res) => {
    const { email, sessionId, deviceInfo, appId } = req.body;

    const clientKey = sessionId || (req.ip || 'unknown');
    if (!checkRateLimit(clientKey)) {
      return res.status(429).json({
        success: false,
        message: 'Majaribio mengi mno. Tafadhali subiri dakika chache kabla ya kujaribu tena.',
      });
    }

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, message: 'Tafadhali weka barua pepe (Gmail).' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Barua pepe uliyoweka haina muundo sahihi (mfano: jina@gmail.com).' });
    }

    const cleanSessionId = typeof sessionId === 'string' && sessionId.trim() ? sessionId.trim() : crypto.randomUUID();
    const now = new Date().toISOString();
    const activeApps = db.apps.filter(a => a.isActive);

    if (activeApps.length === 0) {
      return res.status(400).json({ success: false, message: 'Hakuna programu zilizo tayari kwa sasa.' });
    }

    // Register user for ALL active apps at once
    const userRegs: TesterRegistration[] = [];

    for (const app of activeApps) {
      const existingIndex = db.testers.findIndex(
        t => (t.sessionId === cleanSessionId && t.appId === app.id) ||
             (t.email.toLowerCase() === cleanEmail && t.appId === app.id)
      );

      if (existingIndex >= 0) {
        const existing = db.testers[existingIndex];
        existing.sessionId = cleanSessionId;
        existing.email = cleanEmail;
        existing.appName = app.name;
        existing.updatedAt = now;
        if (deviceInfo) existing.deviceInfo = String(deviceInfo).trim();
        userRegs.push(existing);
      } else {
        const newReg: TesterRegistration = {
          id: 'tester_' + crypto.randomUUID().slice(0, 10),
          email: cleanEmail,
          appId: app.id,
          appName: app.name,
          sessionId: cleanSessionId,
          status: 'pending',
          createdAt: now,
          updatedAt: now,
          deviceInfo: typeof deviceInfo === 'string' && deviceInfo.trim() ? deviceInfo.trim() : undefined,
        };
        db.testers.unshift(newReg);
        userRegs.push(newReg);
      }
    }

    saveDatabase(db);

    const enriched = userRegs.map(reg => {
      const app = db.apps.find(a => a.id === reg.appId);
      return {
        ...reg,
        appName: app ? app.name : reg.appName,
        testingUrl: reg.status === 'approved' && app ? app.testingUrl : undefined,
      };
    });

    res.json({
      success: true,
      message: 'Usajili wako wa majaribio ya programu zote umepokelewa kikamilifu!',
      registrations: enriched,
      email: cleanEmail,
      sessionId: cleanSessionId,
    });
  });

  // Change or recover email / re-register with corrected email
  app.post('/api/change-email', (req, res) => {
    const { oldEmail, newEmail, sessionId, deviceInfo } = req.body;

    if (!newEmail || typeof newEmail !== 'string') {
      return res.status(400).json({ success: false, message: 'Tafadhali weka barua pepe mpya (Gmail).' });
    }

    const cleanNewEmail = newEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanNewEmail)) {
      return res.status(400).json({ success: false, message: 'Barua pepe uliyoweka haina muundo sahihi (mfano: jina@gmail.com).' });
    }

    const cleanSessionId = typeof sessionId === 'string' && sessionId.trim() ? sessionId.trim() : crypto.randomUUID();
    const cleanOldEmail = typeof oldEmail === 'string' ? oldEmail.trim().toLowerCase() : '';
    const now = new Date().toISOString();
    const activeApps = db.apps.filter(a => a.isActive);

    // Find any existing registrations tied to this session OR oldEmail OR newEmail
    const existingMatches = db.testers.filter(t =>
      (cleanSessionId && t.sessionId === cleanSessionId) ||
      (cleanOldEmail && t.email.toLowerCase() === cleanOldEmail) ||
      t.email.toLowerCase() === cleanNewEmail
    );

    if (existingMatches.length > 0) {
      existingMatches.forEach(t => {
        t.email = cleanNewEmail;
        t.sessionId = cleanSessionId;
        t.updatedAt = now;
        if (deviceInfo) t.deviceInfo = String(deviceInfo).trim();
      });
    }

    // Ensure all active apps have an entry
    for (const app of activeApps) {
      const hasApp = existingMatches.some(t => t.appId === app.id);
      if (!hasApp) {
        const newReg: TesterRegistration = {
          id: 'tester_' + crypto.randomUUID().slice(0, 10),
          email: cleanNewEmail,
          appId: app.id,
          appName: app.name,
          sessionId: cleanSessionId,
          status: 'pending',
          createdAt: now,
          updatedAt: now,
          deviceInfo: typeof deviceInfo === 'string' && deviceInfo.trim() ? deviceInfo.trim() : undefined,
        };
        db.testers.unshift(newReg);
      }
    }

    saveDatabase(db);

    const userRegistrations = db.testers.filter(t => 
      t.sessionId === cleanSessionId || t.email.toLowerCase() === cleanNewEmail
    );

    const enriched = userRegistrations.map(reg => {
      const app = db.apps.find(a => a.id === reg.appId);
      return {
        ...reg,
        appName: app ? app.name : reg.appName,
        testingUrl: reg.status === 'approved' && app ? app.testingUrl : undefined,
      };
    });

    res.json({
      success: true,
      message: 'Barua pepe imesasishwa kikamilifu! Programu zote zimefunguliwa.',
      registrations: enriched,
      email: cleanNewEmail,
      sessionId: cleanSessionId,
    });
  });

  // Get tester registrations for a browser sessionId or email
  app.get('/api/tester-status', (req, res) => {
    const { sessionId, email } = req.query;
    const cleanSessionId = typeof sessionId === 'string' ? sessionId.trim() : '';
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!cleanSessionId && !cleanEmail) {
      return res.json({ success: true, registrations: [] });
    }

    const userRegistrations = db.testers.filter(t =>
      (cleanSessionId && t.sessionId === cleanSessionId) ||
      (cleanEmail && t.email.toLowerCase() === cleanEmail)
    );

    // If matching by email and sessionId is provided, sync sessionId
    if (cleanSessionId && userRegistrations.length > 0) {
      let updated = false;
      userRegistrations.forEach(t => {
        if (t.sessionId !== cleanSessionId) {
          t.sessionId = cleanSessionId;
          updated = true;
        }
      });
      if (updated) saveDatabase(db);
    }

    // Attach latest testing URL for approved registrations
    const enriched = userRegistrations.map(reg => {
      const app = db.apps.find(a => a.id === reg.appId);
      return {
        ...reg,
        appName: app ? app.name : reg.appName,
        testingUrl: reg.status === 'approved' && app ? app.testingUrl : undefined,
      };
    });

    res.json({
      success: true,
      registrations: enriched,
    });
  });

  // --- ADMIN APIS ---

  // Admin login
  app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    const expectedPassword = process.env.ADMIN_PASSWORD || '52775277';

    if (!password || password !== expectedPassword) {
      return res.status(401).json({ success: false, message: 'Nenosiri la msimamizi si sahihi.' });
    }

    const token = 'adm_' + crypto.randomBytes(24).toString('hex');
    const now = Date.now();
    const expiresAt = now + 7 * 24 * 60 * 60 * 1000; // 7 days

    db.adminTokens[token] = { createdAt: now, expiresAt };
    saveDatabase(db);

    res.json({
      success: true,
      token,
      message: 'Umeingia kikamilifu kama msimamizi.',
    });
  });

  // Admin verify session
  app.get('/api/admin/verify', requireAdmin, (req, res) => {
    res.json({ success: true, valid: true });
  });

  // Admin overview stats
  app.get('/api/admin/overview', requireAdmin, (req, res) => {
    const totalTesters = db.testers.length;
    const pendingCount = db.testers.filter(t => t.status === 'pending').length;
    const approvedCount = db.testers.filter(t => t.status === 'approved').length;
    const rejectedCount = db.testers.filter(t => t.status === 'rejected').length;

    const byApp: Record<string, { name: string; count: number; approved: number }> = {};
    for (const app of db.apps) {
      const appTesters = db.testers.filter(t => t.appId === app.id);
      byApp[app.id] = {
        name: app.name,
        count: appTesters.length,
        approved: appTesters.filter(t => t.status === 'approved').length,
      };
    }

    const stats: AdminStats = {
      totalTesters,
      pendingCount,
      approvedCount,
      rejectedCount,
      byApp,
      recentTesters: db.testers.slice(0, 10),
    };

    res.json({ success: true, stats });
  });

  // Admin list testers
  app.get('/api/admin/testers', requireAdmin, (req, res) => {
    res.json({
      success: true,
      testers: db.testers,
    });
  });

  // Admin change tester status (Approve / Reject / Pending)
  app.post('/api/admin/testers/:id/status', requireAdmin, (req, res) => {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Hali (status) si sahihi.' });
    }

    const tester = db.testers.find(t => t.id === id);
    if (!tester) {
      return res.status(404).json({ success: false, message: 'Tester hajapatikana.' });
    }

    tester.status = status;
    tester.updatedAt = new Date().toISOString();
    if (status === 'approved') {
      tester.approvedAt = new Date().toISOString();
    }
    if (adminNotes !== undefined) {
      tester.adminNotes = adminNotes;
    }

    saveDatabase(db);

    res.json({
      success: true,
      message: `Hali ya tester imebadilishwa kuwa: ${status}`,
      tester,
    });
  });

  // Admin change assigned app
  app.post('/api/admin/testers/:id/change-app', requireAdmin, (req, res) => {
    const { id } = req.params;
    const { appId } = req.body;

    const app = db.apps.find(a => a.id === appId);
    if (!app) {
      return res.status(404).json({ success: false, message: 'App haijapatikana.' });
    }

    const tester = db.testers.find(t => t.id === id);
    if (!tester) {
      return res.status(404).json({ success: false, message: 'Tester hajapatikana.' });
    }

    tester.appId = app.id;
    tester.appName = app.name;
    tester.updatedAt = new Date().toISOString();

    saveDatabase(db);

    res.json({
      success: true,
      message: `App imebadilishwa kuwa ${app.name}`,
      tester,
    });
  });

  // Admin delete tester
  app.delete('/api/admin/testers/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const index = db.testers.findIndex(t => t.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Tester hajapatikana.' });
    }

    db.testers.splice(index, 1);
    saveDatabase(db);

    res.json({ success: true, message: 'Usajili umefutwa kikamilifu.' });
  });

  // Admin bulk action (approve, reject, delete)
  app.post('/api/admin/testers/bulk-action', requireAdmin, (req, res) => {
    const { ids, action } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Hakuna testers waliochaguliwa.' });
    }

    const now = new Date().toISOString();

    if (action === 'delete') {
      db.testers = db.testers.filter(t => !ids.includes(t.id));
    } else if (action === 'approve') {
      db.testers.forEach(t => {
        if (ids.includes(t.id)) {
          t.status = 'approved';
          t.approvedAt = now;
          t.updatedAt = now;
        }
      });
    } else if (action === 'reject') {
      db.testers.forEach(t => {
        if (ids.includes(t.id)) {
          t.status = 'rejected';
          t.updatedAt = now;
        }
      });
    } else {
      return res.status(400).json({ success: false, message: 'Kitendo hiki hakitambuliki.' });
    }

    saveDatabase(db);
    res.json({ success: true, message: `Kitendo kimetekelezwa kwa testers ${ids.length}.` });
  });

  // Admin change all apps status for an email
  app.post('/api/admin/testers/email-status', requireAdmin, (req, res) => {
    const { email, status } = req.body;
    if (!email || !['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Taarifa hazitoshi au status si sahihi.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const matches = db.testers.filter(t => t.email.toLowerCase() === cleanEmail);
    const now = new Date().toISOString();

    matches.forEach(t => {
      t.status = status;
      t.updatedAt = now;
      if (status === 'approved') t.approvedAt = now;
    });

    saveDatabase(db);
    res.json({
      success: true,
      message: `Hali ya apps zote za ${cleanEmail} imebadilishwa kuwa ${status}.`,
      updatedCount: matches.length,
    });
  });

  // Admin manage apps (get all apps)
  app.get('/api/admin/apps', requireAdmin, (req, res) => {
    res.json({
      success: true,
      apps: db.apps,
    });
  });

  // Admin update app details (especially Google Play testing URL)
  app.put('/api/admin/apps/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const { name, tagline, description, features, testingUrl, isActive, dualCameraNote, privateAreaNote } = req.body;

    const appIndex = db.apps.findIndex(a => a.id === id);
    if (appIndex === -1) {
      return res.status(404).json({ success: false, message: 'App haijapatikana.' });
    }

    const currentApp = db.apps[appIndex];
    db.apps[appIndex] = {
      ...currentApp,
      name: name ?? currentApp.name,
      tagline: tagline ?? currentApp.tagline,
      description: description ?? currentApp.description,
      features: Array.isArray(features) ? features : currentApp.features,
      testingUrl: testingUrl ?? currentApp.testingUrl,
      isActive: isActive !== undefined ? Boolean(isActive) : currentApp.isActive,
      dualCameraNote: dualCameraNote !== undefined ? dualCameraNote : currentApp.dualCameraNote,
      privateAreaNote: privateAreaNote !== undefined ? privateAreaNote : currentApp.privateAreaNote,
    };

    saveDatabase(db);

    res.json({
      success: true,
      message: `App ya ${db.apps[appIndex].name} imesasishwa kikamilifu!`,
      app: db.apps[appIndex],
    });
  });

  // --- VITE MIDDLEWARE SETUP ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
