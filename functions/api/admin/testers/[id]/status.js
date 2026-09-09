export async function onRequestPost(context) {
  const { request, env, params } = context;
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
    const { status } = await request.json();

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Status si sahihi'
      }), { 
        status: 400,
        headers: corsHeaders 
      });
    }

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

    let testingUrl = null;
    if (status === 'approved') {
      testingUrl = correctUrls[reg.app_id] || reg.testing_url;
    }

    const now = new Date().toISOString();
    await env.DB.prepare(
      'UPDATE registrations SET status = ?, testing_url = ?, updated_at = ? WHERE id = ?'
    ).bind(status, testingUrl, now, testerId).run();

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
