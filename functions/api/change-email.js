export async function onRequestPost(context) {
  const { request, env } = context;
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    const { oldEmail, newEmail, sessionId } = await request.json();
    
    // Validate new email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Barua pepe mpya si sahihi'
      }), { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Find tester by old email or session
    let tester = null;
    if (oldEmail) {
      tester = await env.DB.prepare(
        'SELECT * FROM testers WHERE email = ?'
      ).bind(oldEmail.toLowerCase()).first();
    }
    
    if (!tester && sessionId) {
      tester = await env.DB.prepare(
        'SELECT * FROM testers WHERE session_id = ?'
      ).bind(sessionId).first();
    }

    if (!tester) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Mtumiaji hakupatikana'
      }), { 
        status: 404,
        headers: corsHeaders 
      });
    }

    // Check if new email already exists
    const existingTester = await env.DB.prepare(
      'SELECT * FROM testers WHERE email = ? AND id != ?'
    ).bind(newEmail.toLowerCase(), tester.id).first();

    if (existingTester) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Barua pepe hii tayari imesajiliwa na mtumiaji mwingine'
      }), { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Update email
    const now = new Date().toISOString();
    await env.DB.prepare(
      'UPDATE testers SET email = ?, updated_at = ? WHERE id = ?'
    ).bind(newEmail.toLowerCase(), now, tester.id).run();

    // Get all registrations for this tester
    const regsResult = await env.DB.prepare(
      'SELECT * FROM registrations WHERE tester_id = ? ORDER BY created_at DESC'
    ).bind(tester.id).all();

    const registrations = regsResult.results.map(reg => ({
      id: reg.id,
      appId: reg.app_id,
      appName: reg.app_name,
      status: reg.status,
      testingUrl: reg.testing_url,
      createdAt: reg.created_at,
      email: newEmail.toLowerCase(),
      sessionId: tester.session_id,
      deviceInfo: tester.device_id
    }));

    return new Response(JSON.stringify({
      success: true,
      message: 'Barua pepe imesasishwa kikamilifu',
      registrations
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
