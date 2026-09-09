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

    const testersCount = await env.DB.prepare(
      'SELECT COUNT(DISTINCT tester_id) as total FROM registrations'
    ).first();

    const pendingCount = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM registrations WHERE status = 'pending'"
    ).first();

    const approvedCount = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM registrations WHERE status = 'approved'"
    ).first();

    const rejectedCount = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM registrations WHERE status = 'rejected'"
    ).first();

    const stats = {
      totalTesters: testersCount.total || 0,
      pendingCount: pendingCount.count || 0,
      approvedCount: approvedCount.count || 0,
      rejectedCount: rejectedCount.count || 0
    };

    return new Response(JSON.stringify({
      success: true,
      stats
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

async function validateAdminToken(token, env) {
  const result = await env.DB.prepare(
    'SELECT * FROM admin_tokens WHERE token = ? AND expires_at > ?'
  ).bind(token, new Date().toISOString()).first();
  
  return !!result;
}
