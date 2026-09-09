export async function onRequestPost(context) {
  const { request, env } = context;
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  const correctUrls = {
    'pdf-office': 'https://play.google.com/apps/testing/co.pdfoffice.ap',
    'free-screen-recorder': 'https://play.google.com/apps/testing/co.freescreenrecorder.ap',
    'jobsreport': 'https://play.google.com/apps/testing/co.jobsreport.ap',
    'music-play': 'https://play.google.com/apps/testing/co.musicplay.ap',
    'top-file-manager': 'https://play.google.com/apps/testing/co.topfilemanager.ap',
    'int-calculator': 'https://play.google.com/apps/testing/co.intcalculator.ap'
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

    const { email, status } = await request.json();
    
    if (!email) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Email inahitajika'
      }), { 
        status: 400,
        headers: corsHeaders 
      });
    }

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Status si sahihi'
      }), { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Find tester by email
    const tester = await env.DB.prepare(
      'SELECT * FROM testers WHERE email = ?'
    ).bind(email.toLowerCase().trim()).first();

    if (!tester) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Tester hakupatikana'
      }), { 
        status: 404,
        headers: corsHeaders 
      });
    }

    // Get all registrations for this tester
    const registrations = await env.DB.prepare(
      'SELECT * FROM registrations WHERE tester_id = ?'
    ).bind(tester.id).all();

    // Update ALL registrations for this tester
    const now = new Date().toISOString();
    
    for (const reg of registrations.results) {
      let testingUrl = null;
      if (status === 'approved') {
        testingUrl = correctUrls[reg.app_id] || reg.testing_url;
      }
      
      await env.DB.prepare(
        'UPDATE registrations SET status = ?, testing_url = ?, updated_at = ? WHERE id = ?'
      ).bind(status, testingUrl, now, reg.id).run();
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Testers wote wa ${email} wamesasishwa kuwa ${status}`,
      updatedCount: registrations.results.length
    }), { headers: corsHeaders });

  } catch (error) {
    console.error('Error updating all statuses:', error);
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
