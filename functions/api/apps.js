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
      tagline: app.tagline,
      description: app.description,
      category: app.category,
      platform: app.platform,
      iconName: app.icon_name,
      accentColor: app.accent_color,
      testingUrl: app.testing_url,
      isActive: app.is_active === 1,
      features: app.features ? JSON.parse(app.features) : [],
      dualCameraNote: app.dual_camera_note,
      privateAreaNote: app.private_area_note
    }));

    return new Response(JSON.stringify({
      success: true,
      apps: parsedApps
    }), { headers: corsHeaders });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: error.message
    }), { 
      status: 500,
      headers: corsHeaders 
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}

function getDefaultApps() {
  return [
    {
      id: 'pdf-office',
      name: 'PDF Office',
      tagline: 'Read, edit & convert PDF files',
      description: 'Complete PDF solution for Android',
      category: 'Productivity',
      iconName: 'file-text',
      accentColor: '#ef4444',
      testingUrl: 'https://play.google.com/apps/testing/com.pdf.office',
      isActive: true,
      features: ['PDF Reader', 'PDF Editor', 'PDF Converter']
    },
    {
      id: 'free-screen-recorder',
      name: 'Free Screen Recorder',
      tagline: 'Record your screen in HD',
      description: 'Best screen recording app',
      category: 'Tools',
      iconName: 'video',
      accentColor: '#8b5cf6',
      testingUrl: 'https://play.google.com/apps/testing/com.screen.recorder',
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
      iconName: 'briefcase',
      accentColor: '#06b6d4',
      testingUrl: 'https://play.google.com/apps/testing/com.jobsreport',
      isActive: true,
      features: ['Job Search', 'CV Builder', 'Job Alerts']
    },
    {
      id: 'music-play',
      name: 'Music Play',
      tagline: 'Listen to your favorite music',
      description: 'Music player with amazing features',
      category: 'Entertainment',
      iconName: 'music',
      accentColor: '#f59e0b',
      testingUrl: 'https://play.google.com/apps/testing/com.music.play',
      isActive: true,
      features: ['MP3 Player', 'Equalizer', 'Playlists']
    },
    {
      id: 'top-file-manager',
      name: 'Top File Manager',
      tagline: 'Manage your files easily',
      description: 'Powerful file manager',
      category: 'Tools',
      iconName: 'folder',
      accentColor: '#10b981',
      testingUrl: 'https://play.google.com/apps/testing/com.file.manager',
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
      iconName: 'calculator',
      accentColor: '#3b82f6',
      testingUrl: 'https://play.google.com/apps/testing/com.int.calculator',
      isActive: true,
      features: ['Scientific Mode', 'History', 'Themes'],
      privateAreaNote: 'Hide your calculation history with password'
    }
  ];
}
