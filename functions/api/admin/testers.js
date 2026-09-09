export async function onRequestGet(context) {
  const { request, env } = context;
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  try {
    // Validate token
    const authHeader = request.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    
    if (!token || !(await validateAdminToken(token, env))) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Unauthorized' 
      }), { 
        status: 401,
        headers: corsHeaders 
      });
    }

    const result = await env.DB.prepare(`
      SELECT r.*, t.email, t.session_id, t.device_id
      FROM registrations r
      JOIN testers t ON r.tester_id = t.id
      ORDER BY r.created_at DESC
    `).all();

    const testers = result.results.map(reg => ({
      id: reg.id,
      appId: reg.app_id,
      appName: reg.app_name,
      status: reg.status,
      testingUrl: reg.testing_url,
      createdAt: reg.created_at,
      email: reg.email,
      sessionId: reg.session_id,
      deviceInfo: reg.device_id
    }));

    return new Response(JSON.stringify({
      success: true,
      testers
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
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}

async function validateAdminToken(token, env) {
  const result = await env.DB.prepare(
    'SELECT * FROM admin_tokens WHERE token = ? AND expires_at > ?'
  ).bind(token, new Date().toISOString()).first();
  
  return !!result;
}
