export async function onRequestGet(context) {
  const { env } = context;
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    const apps = await env.DB.prepare(
      'SELECT * FROM apps WHERE is_active = 1 ORDER BY name'
    ).all();

    if (apps.results.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        apps: getDefaultApps()
      }), { headers: corsHeaders });
    }

    const parsedApps = apps.results.map(app => ({
      id: app.id,
      name: app.name,
      tagline: app.tagline || '',
      description: app.description || '',
      category: app.category || 'Tools',
      platform: app.platform || 'Android',
      iconName: app.icon_name || 'file-text',
      accentColor: app.accent_color || '#06b6d4',
      testingUrl: app.testing_url || getDefaultUrl(app.id),
      isActive: app.is_active === 1,
      features: app.features ? JSON.parse(app.features) : ['Feature 1', 'Feature 2', 'Feature 3'],
      dualCameraNote: app.dual_camera_note,
      privateAreaNote: app.private_area_note
    }));

    return new Response(JSON.stringify({
      success: true,
      apps: parsedApps
    }), { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching apps:', error);
    return new Response(JSON.stringify({
      success: true,
      apps: getDefaultApps()
    }), { headers: corsHeaders });
  }
}

function getDefaultUrl(appId) {
  const urls = {
    'pdf-office': 'https://play.google.com/apps/testing/co.pdfoffice.ap',
    'free-screen-recorder': 'https://play.google.com/apps/testing/co.freescreenrecorder.ap',
    'jobsreport': 'https://play.google.com/apps/testing/co.jobsreport.ap',
    'music-play': 'https://play.google.com/apps/testing/co.musicplay.ap',
    'top-file-manager': 'https://play.google.com/apps/testing/co.topfilemanager.ap',
    'int-calculator': 'https://play.google.com/apps/testing/co.intcalculator.ap'
  };
  return urls[appId] || '';
}

function getDefaultApps() {
  return [
    {
      id: 'pdf-office',
      name: 'PDF Office',
      tagline: 'Read, edit & convert PDF files',
      description: 'Complete PDF solution for Android',
      category: 'Productivity',
      platform: 'Android',
      iconName: 'file-text',
      accentColor: '#ef4444',
      testingUrl: 'https://play.google.com/apps/testing/co.pdfoffice.ap',
      isActive: true,
      features: ['PDF Reader', 'PDF Editor', 'PDF Converter']
    },
    {
      id: 'free-screen-recorder',
      name: 'Free Screen Recorder',
      tagline: 'Record your screen in HD',
      description: 'Best screen recording app',
      category: 'Tools',
      platform: 'Android',
      iconName: 'video',
      accentColor: '#8b5cf6',
      testingUrl: 'https://play.google.com/apps/testing/co.freescreenrecorder.ap',
      isActive: true,
      features: ['HD Recording', 'Dual Camera', 'No Watermark'],
      dualCameraNote: 'Record with front and back camera simultaneously'
    },
    {
      id: 'jobsreport',
      name: 'JobsReport',
      tagline: 'Find your dream job',
      description: 'Job search platform',
      category: 'Business',
      platform: 'Android',
      iconName: 'briefcase',
      accentColor: '#06b6d4',
      testingUrl: 'https://play.google.com/apps/testing/co.jobsreport.ap',
      isActive: true,
      features: ['Job Search', 'CV Builder', 'Job Alerts']
    },
    {
      id: 'music-play',
      name: 'Music Play',
      tagline: 'Listen to your favorite music',
      description: 'Music player with amazing features',
      category: 'Entertainment',
      platform: 'Android',
      iconName: 'music',
      accentColor: '#f59e0b',
      testingUrl: 'https://play.google.com/apps/testing/co.musicplay.ap',
      isActive: true,
      features: ['MP3 Player', 'Equalizer', 'Playlists']
    },
    {
      id: 'top-file-manager',
      name: 'Top File Manager',
      tagline: 'Manage your files easily',
      description: 'Powerful file manager',
      category: 'Tools',
      platform: 'Android',
      iconName: 'folder',
      accentColor: '#10b981',
      testingUrl: 'https://play.google.com/apps/testing/co.topfilemanager.ap',
      isActive: true,
      features: ['File Browser', 'Private Vault', 'Cloud Storage'],
      privateAreaNote: 'Secure your private files with password protection'
    },
    {
      id: 'int-calculator',
      name: 'Int Calculator',
      tagline: 'Smart calculator',
      description: 'Advanced calculator for Android',
      category: 'Productivity',
      platform: 'Android',
      iconName: 'calculator',
      accentColor: '#3b82f6',
      testingUrl: 'https://play.google.com/apps/testing/co.intcalculator.ap',
      isActive: true,
      features: ['Scientific Mode', 'History', 'Themes'],
      privateAreaNote: 'Hide your calculation history with password'
    }
  ];
}
