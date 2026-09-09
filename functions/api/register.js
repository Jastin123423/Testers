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
    const { email, sessionId, deviceId, appId, appName, platform } = await request.json();
    
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

      // Register for ALL apps
      const apps = await env.DB.prepare(
        'SELECT * FROM apps WHERE is_active = 1'
      ).all();

      const registrations = [];
      
      for (const app of apps.results) {
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

      return new Response(JSON.stringify({
        success: true,
        message: 'Usajili umefanikiwa kwa programu zote 6',
        tester: {
          id: tester.id,
          email: tester.email,
          sessionId: tester.session_id,
          deviceId: tester.device_id
        },
        registrations
      }), { headers: corsHeaders });
    } else {
      // Update session ID
      await env.DB.prepare(
        'UPDATE testers SET session_id = ?, updated_at = ? WHERE id = ?'
      ).bind(sessionId, new Date().toISOString(), tester.id).run();

      // Get all existing registrations
      const existingRegs = await env.DB.prepare(
        'SELECT * FROM registrations WHERE tester_id = ? ORDER BY created_at DESC'
      ).bind(tester.id).all();

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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
