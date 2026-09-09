export async function onRequestPost(context) {
  const { request, env } = context;
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    const { password } = await request.json();
    
    if (password !== env.ADMIN_PASSWORD) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Nenosiri si sahihi'
      }), { 
        status: 401,
        headers: corsHeaders 
      });
    }

    // Generate token
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + parseInt(env.ADMIN_TOKEN_EXPIRY || '86400') * 1000).toISOString();
    
    await env.DB.prepare(
      'INSERT INTO admin_tokens (token, created_at, expires_at) VALUES (?, ?, ?)'
    ).bind(token, new Date().toISOString(), expiresAt).run();

    return new Response(JSON.stringify({
      success: true,
      token,
      message: 'Umefanikiwa kuingia'
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
