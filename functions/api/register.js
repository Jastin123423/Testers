// functions/api/register.js
export async function onRequestPost(context) {
  const { request, env } = context;
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    const { email, sessionId, deviceId } = await request.json();
    
    console.log('Register attempt:', { email, sessionId });

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

    const cleanEmail = email.toLowerCase().trim();

    // Check if tester exists
    let tester = await env.DB.prepare(
      'SELECT * FROM testers WHERE email = ?'
    ).bind(cleanEmail).first();

    let testerId;

    if (tester) {
      // Update session ID
      testerId = tester.id;
      await env.DB.prepare(
        'UPDATE testers SET session_id = ?, updated_at = ? WHERE id = ?'
      ).bind(sessionId, new Date().toISOString(), testerId).run();
      
      console.log('Existing tester found:', testerId);
    } else {
      // Create new tester
      testerId = crypto.randomUUID();
      const now = new Date().toISOString();
      
      await env.DB.prepare(
        'INSERT INTO testers (id, email, session_id, device_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(testerId, cleanEmail, sessionId, deviceId || null, now, now).run();
      
      console.log('New tester created:', testerId);
    }

    // Define all 6 apps
    const allApps = [
      { id: 'pdf-office', name: 'PDF Office' },
      { id: 'free-screen-recorder', name: 'Free Screen Recorder' },
      { id: 'jobsreport', name: 'JobsReport' },
      { id: 'music-play', name: 'Music Play' },
      { id: 'top-file-manager', name: 'Top File Manager' },
      { id: 'int-calculator', name: 'Int Calculator' }
    ];

    // Get existing registrations for this tester
    const existingRegs = await env.DB.prepare(
      'SELECT app_id FROM registrations WHERE tester_id = ?'
    ).bind(testerId).all();
    
    const existingAppIds = new Set(existingRegs.results.map(r => r.app_id));

    // Create missing registrations
    const registrations = [];
    
    for (const app of allApps) {
      if (!existingAppIds.has(app.id)) {
        const registrationId = crypto.randomUUID();
        const regNow = new Date().toISOString();
        
        await env.DB.prepare(
          'INSERT INTO registrations (id, tester_id, app_id, app_name, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).bind(registrationId, testerId, app.id, app.name, 'pending', regNow, regNow).run();
        
        console.log('Created registration for:', app.name);
      }
    }

    // Get ALL registrations for this tester
    const allRegs = await env.DB.prepare(
      'SELECT * FROM registrations WHERE tester_id = ? ORDER BY created_at DESC'
    ).bind(testerId).all();

    console.log('Total registrations:', allRegs.results.length);

    const registrationList = allRegs.results.map(reg => ({
      id: reg.id,
      appId: reg.app_id,
      appName: reg.app_name,
      status: reg.status,
      testingUrl: reg.testing_url,
      createdAt: reg.created_at,
      email: cleanEmail,
      sessionId: sessionId
    }));

    return new Response(JSON.stringify({
      success: true,
      message: 'Usajili umefanikiwa',
      tester: {
        id: testerId,
        email: cleanEmail,
        sessionId: sessionId,
        deviceId: deviceId || null
      },
      registrations: registrationList
    }), { headers: corsHeaders });

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
