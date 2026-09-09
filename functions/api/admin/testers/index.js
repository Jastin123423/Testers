export async function onRequestGet(context) {
  const { request, env } = context;
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  try {
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

    // Get all testers with their registrations
    const result = await env.DB.prepare(`
      SELECT t.id as tester_id, t.email, t.session_id, t.device_id, t.created_at as tester_created_at,
             r.id as reg_id, r.app_id, r.app_name, r.status, r.testing_url, r.created_at as reg_created_at
      FROM testers t
      LEFT JOIN registrations r ON t.id = r.tester_id
      ORDER BY t.created_at DESC
    `).all();

    // Group by tester (email)
    const testersMap = new Map();
    
    for (const row of result.results) {
      if (!testersMap.has(row.tester_id)) {
        testersMap.set(row.tester_id, {
          testerId: row.tester_id,
          email: row.email,
          sessionId: row.session_id,
          deviceInfo: row.device_id,
          createdAt: row.tester_created_at,
          registrations: []
        });
      }
      
      const tester = testersMap.get(row.tester_id);
      
      if (row.reg_id) {
        tester.registrations.push({
          id: row.reg_id,
          appId: row.app_id,
          appName: row.app_name,
          status: row.status,
          testingUrl: row.testing_url,
          createdAt: row.reg_created_at
        });
      }
    }

    const testers = Array.from(testersMap.values());

    return new Response(JSON.stringify({
      success: true,
      testers
    }), { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching testers:', error);
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
