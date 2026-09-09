export async function onRequestPost(context) {
  const { request, env } = context;
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    const { email, sessionId } = await request.json();
    
    console.log('Check email:', { email, sessionId });

    let tester = null;
    
    if (email) {
      tester = await env.DB.prepare(
        'SELECT * FROM testers WHERE email = ?'
      ).bind(email.toLowerCase()).first();
    }
    
    if (!tester && sessionId) {
      tester = await env.DB.prepare(
        'SELECT * FROM testers WHERE session_id = ?'
      ).bind(sessionId).first();
    }

    console.log('Tester found:', tester);

    const isReturning = !!tester;
    let registrations = [];

    if (tester) {
      const regsResult = await env.DB.prepare(
        'SELECT * FROM registrations WHERE tester_id = ? ORDER BY created_at DESC'
      ).bind(tester.id).all();
      
      console.log('Registrations found:', regsResult.results.length);

      registrations = regsResult.results.map(reg => ({
        id: reg.id,
        appId: reg.app_id,
        appName: reg.app_name,
        status: reg.status,
        testingUrl: reg.testing_url,
        createdAt: reg.created_at,
        email: tester.email,
        sessionId: tester.session_id,
        deviceInfo: tester.device_id
      }));
    }

    return new Response(JSON.stringify({
      success: true,
      isReturning,
      tester: tester ? {
        id: tester.id,
        email: tester.email,
        sessionId: tester.session_id,
        deviceId: tester.device_id,
        createdAt: tester.created_at,
        updatedAt: tester.updated_at
      } : null,
      registrations
    }), { headers: corsHeaders });
  } catch (error) {
    console.error('Check email error:', error);
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
