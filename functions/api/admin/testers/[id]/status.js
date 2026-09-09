export async function onRequestPost(context) {
  const { request, env, params } = context;
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  try {
    console.log('Status update endpoint hit');
    console.log('Params:', params);
    
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

    const testerId = params.id;
    const body = await request.json();
    const { status } = body;
    
    console.log('Updating tester:', { testerId, status });

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Status si sahihi'
      }), { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Get the registration
    const reg = await env.DB.prepare(
      'SELECT * FROM registrations WHERE id = ?'
    ).bind(testerId).first();

    if (!reg) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Usajili haukupatikana'
      }), { 
        status: 404,
        headers: corsHeaders 
      });
    }

    // Get testing URL if approving
    let testingUrl = null;
    if (status === 'approved') {
      // First try to get from apps table
      const app = await env.DB.prepare(
        'SELECT testing_url FROM apps WHERE id = ?'
      ).bind(reg.app_id).first();
      
      if (app && app.testing_url) {
        testingUrl = app.testing_url;
      } else {
        // Use correct default URLs
        const defaultUrls = {
          'pdf-office': 'https://play.google.com/apps/testing/co.pdfoffice.ap',
          'free-screen-recorder': 'https://play.google.com/apps/testing/co.freescreenrecorder.ap',
          'jobsreport': 'https://play.google.com/apps/testing/co.jobsreport.ap',
          'music-play': 'https://play.google.com/apps/testing/co.musicplay.ap',
          'top-file-manager': 'https://play.google.com/apps/testing/co.topfilemanager.ap',
          'int-calculator': 'https://play.google.com/apps/testing/co.intcalculator.ap'
        };
        testingUrl = defaultUrls[reg.app_id] || null;
      }
    }

    // Update status
    const now = new Date().toISOString();
    await env.DB.prepare(
      'UPDATE registrations SET status = ?, testing_url = ?, updated_at = ? WHERE id = ?'
    ).bind(status, testingUrl, now, testerId).run();

    // Get updated registration
    const updatedReg = await env.DB.prepare(`
      SELECT r.*, t.email, t.session_id, t.device_id
      FROM registrations r
      JOIN testers t ON r.tester_id = t.id
      WHERE r.id = ?
    `).bind(testerId).first();

    return new Response(JSON.stringify({
      success: true,
      message: 'Status imesasishwa',
      tester: {
        id: updatedReg.id,
        appId: updatedReg.app_id,
        appName: updatedReg.app_name,
        status: updatedReg.status,
        testingUrl: updatedReg.testing_url,
        createdAt: updatedReg.created_at,
        email: updatedReg.email,
        sessionId: updatedReg.session_id,
        deviceInfo: updatedReg.device_id
      }
    }), { headers: corsHeaders });

  } catch (error) {
    console.error('Error updating status:', error);
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
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}

async function validateAdminToken(token, env) {
  try {
    const result = await env.DB.prepare(
      'SELECT * FROM admin_tokens WHERE token = ? AND expires_at > ?'
    ).bind(token, new Date().toISOString()).first();
    
    return !!result;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
}
