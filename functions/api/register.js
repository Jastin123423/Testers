export async function onRequestPost(context) {
  const { request, env } = context;
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    const { email, sessionId, deviceId, appId, appName, platform } = await request.json();
    
    console.log('Register request:', { email, sessionId, appId, appName });

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Barua pepe si sahihi'
      }), { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Check if tester exists by email
    let tester = await env.DB.prepare(
      'SELECT * FROM testers WHERE email = ?'
    ).bind(email.toLowerCase()).first();

    console.log('Existing tester:', tester);

    if (!tester) {
      // Create new tester
      const testerId = crypto.randomUUID();
      const now = new Date().toISOString();
      
      await env.DB.prepare(
        'INSERT INTO testers (id, email, session_id, device_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(testerId, email.toLowerCase(), sessionId, deviceId || null, now, now).run();
      
      tester = {
        id: testerId,
        email: email.toLowerCase(),
        session_id: sessionId,
        device_id: deviceId || null
      };

      console.log('Created new tester:', tester);

      // Get all active apps
      const appsResult = await env.DB.prepare(
        'SELECT * FROM apps WHERE is_active = 1'
      ).all();

      console.log('Apps found:', appsResult.results.length);

      // If no apps in database, use default apps
      let appsList = appsResult.results;
      if (appsList.length === 0) {
        appsList = getDefaultApps();
      }

      const registrations = [];
      
      // Register for ALL apps
      for (const app of appsList) {
        const registrationId = crypto.randomUUID();
        const regNow = new Date().toISOString();
        
        await env.DB.prepare(
          'INSERT INTO registrations (id, tester_id, app_id, app_name, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).bind(registrationId, testerId, app.id, app.name, 'pending', regNow, regNow).run();
        
        registrations.push({
          id: registrationId,
          appId: app.id,
          appName: app.name,
          status: 'pending',
          testingUrl: null,
          createdAt: regNow,
          email: email.toLowerCase(),
          sessionId: sessionId
        });
      }

      console.log('Created registrations:', registrations.length);

      return new Response(JSON.stringify({
        success: true,
        message: 'Usajili umefanikiwa kwa programu zote',
        tester: {
          id: tester.id,
          email: tester.email,
          sessionId: tester.session_id,
          deviceId: tester.device_id
        },
        registrations
      }), { headers: corsHeaders });
    } else {
      // Update session ID for returning user
      await env.DB.prepare(
        'UPDATE testers SET session_id = ?, updated_at = ? WHERE id = ?'
      ).bind(sessionId, new Date().toISOString(), tester.id).run();

      console.log('Updated session for existing tester');

      // Get all existing registrations
      const existingRegs = await env.DB.prepare(
        'SELECT * FROM registrations WHERE tester_id = ? ORDER BY created_at DESC'
      ).bind(tester.id).all();

      console.log('Existing registrations:', existingRegs.results.length);

      const registrations = existingRegs.results.map(reg => ({
        id: reg.id,
        appId: reg.app_id,
        appName: reg.app_name,
        status: reg.status,
        testingUrl: reg.testing_url,
        createdAt: reg.created_at,
        email: tester.email,
        sessionId: tester.session_id
      }));

      return new Response(JSON.stringify({
        success: true,
        message: 'Tayari umesajiliwa',
        tester: {
          id: tester.id,
          email: tester.email,
          sessionId: tester.session_id,
          deviceId: tester.device_id
        },
        registrations
      }), { headers: corsHeaders });
    }
  } catch (error) {
    console.error('Registration error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: error.message || 'Internal server error'
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}

function getDefaultApps() {
  return [
    { id: 'pdf-office', name: 'PDF Office' },
    { id: 'free-screen-recorder', name: 'Free Screen Recorder' },
    { id: 'jobsreport', name: 'JobsReport' },
    { id: 'music-play', name: 'Music Play' },
    { id: 'top-file-manager', name: 'Top File Manager' },
    { id: 'int-calculator', name: 'Int Calculator' }
  ];
}
