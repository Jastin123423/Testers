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
    } else {
      // Update session ID
      await env.DB.prepare(
        'UPDATE testers SET session_id = ?, updated_at = ? WHERE id = ?'
      ).bind(sessionId, new Date().toISOString(), tester.id).run();
    }

    // Check if already registered for this app
    const existingReg = await env.DB.prepare(
      'SELECT * FROM registrations WHERE tester_id = ? AND app_id = ?'
    ).bind(tester.id, appId).first();

    if (existingReg) {
      return new Response(JSON.stringify({
        success: true,
        isReturning: true,
        message: 'Tayari umesajiliwa kwa app hii',
        tester: {
          id: tester.id,
          email: tester.email,
          sessionId: tester.session_id,
          deviceId: tester.device_id
        },
        registration: {
          id: existingReg.id,
          appId: existingReg.app_id,
          appName: existingReg.app_name,
          status: existingReg.status,
          testingUrl: existingReg.testing_url,
          createdAt: existingReg.created_at,
          email: tester.email,
          sessionId: tester.session_id
        }
      }), { headers: corsHeaders });
    }

    // Create new registration
    const registrationId = crypto.randomUUID();
    const now = new Date().toISOString();
    
    await env.DB.prepare(
      'INSERT INTO registrations (id, tester_id, app_id, app_name, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(registrationId, tester.id, appId, appName, 'pending', now, now).run();

    const registration = {
      id: registrationId,
      appId,
      appName,
      status: 'pending',
      testingUrl: null,
      createdAt: now,
      email: tester.email,
      sessionId: tester.session_id
    };

    return new Response(JSON.stringify({
      success: true,
      message: 'Usajili umefanikiwa',
      tester: {
        id: tester.id,
        email: tester.email,
        sessionId: tester.session_id,
        deviceId: tester.device_id
      },
      registration
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
