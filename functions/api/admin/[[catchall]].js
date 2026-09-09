
// This handles all other admin routes like:
// /api/admin/testers/:id/status
// /api/admin/testers/:id/change-app
// /api/admin/testers/:id (DELETE)
// /api/admin/apps/:id (PUT)

export async function onRequestPost(context) {
  const { request, env, params } = context;
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, PUT, DELETE, OPTIONS',
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

    const path = params.catchall || '';
    const url = new URL(request.url);
    const pathParts = path.split('/');

    // Handle /api/admin/testers/:id/status
    if (pathParts[0] === 'testers' && pathParts[2] === 'status') {
      const id = pathParts[1];
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

      // Get the app's testing URL if approving
      let testingUrl = null;
      if (status === 'approved') {
        const reg = await env.DB.prepare(
          'SELECT app_id FROM registrations WHERE id = ?'
        ).bind(id).first();
        
        if (reg) {
          const app = await env.DB.prepare(
            'SELECT testing_url FROM apps WHERE id = ?'
          ).bind(reg.app_id).first();
          
          if (app) {
            testingUrl = app.testing_url;
          }
        }
      }

      const now = new Date().toISOString();
      await env.DB.prepare(
        'UPDATE registrations SET status = ?, testing_url = ?, updated_at = ? WHERE id = ?'
      ).bind(status, testingUrl, now, id).run();

      const updatedReg = await env.DB.prepare(`
        SELECT r.*, t.email, t.session_id, t.device_id
        FROM registrations r
        JOIN testers t ON r.tester_id = t.id
        WHERE r.id = ?
      `).bind(id).first();

      return new Response(JSON.stringify({
        success: true,
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
    }

    // Handle /api/admin/testers/:id/change-app
    if (pathParts[0] === 'testers' && pathParts[2] === 'change-app') {
      const id = pathParts[1];
      const { appId } = await request.json();
      
      const app = await env.DB.prepare(
        'SELECT * FROM apps WHERE id = ?'
      ).bind(appId).first();

      if (!app) {
        return new Response(JSON.stringify({
          success: false,
          message: 'App haikupatikana'
        }), { 
          status: 404,
          headers: corsHeaders 
        });
      }

      const now = new Date().toISOString();
      await env.DB.prepare(
        'UPDATE registrations SET app_id = ?, app_name = ?, updated_at = ? WHERE id = ?'
      ).bind(appId, app.name, now, id).run();

      return new Response(JSON.stringify({
        success: true,
        message: 'App imebadilishwa kikamilifu'
      }), { headers: corsHeaders });
    }

    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Route not found' 
    }), { 
      status: 404,
      headers: corsHeaders 
    });
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

export async function onRequestDelete(context) {
  const { request, env, params } = context;
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, PUT, DELETE, OPTIONS',
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

    const path = params.catchall || '';
    const pathParts = path.split('/');

    // Handle /api/admin/testers/:id (DELETE)
    if (pathParts[0] === 'testers' && pathParts.length === 2) {
      const id = pathParts[1];
      
      await env.DB.prepare(
        'DELETE FROM registrations WHERE id = ?'
      ).bind(id).run();

      return new Response(JSON.stringify({
        success: true,
        message: 'Usajili umefutwa kikamilifu'
      }), { headers: corsHeaders });
    }

    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Route not found' 
    }), { 
      status: 404,
      headers: corsHeaders 
    });
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

export async function onRequestPut(context) {
  const { request, env, params } = context;
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, PUT, DELETE, OPTIONS',
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

    const path = params.catchall || '';
    const pathParts = path.split('/');

    // Handle /api/admin/apps/:id (PUT)
    if (pathParts[0] === 'apps' && pathParts.length === 2) {
      const id = pathParts[1];
      const appData = await request.json();
      const now = new Date().toISOString();

      await env.DB.prepare(`
        UPDATE apps SET 
          name = ?,
          tagline = ?,
          description = ?,
          testing_url = ?,
          is_active = ?,
          dual_camera_note = ?,
          private_area_note = ?,
          updated_at = ?
        WHERE id = ?
      `).bind(
        appData.name || '',
        appData.tagline || '',
        appData.description || '',
        appData.testingUrl || '',
        appData.isActive ? 1 : 0,
        appData.dualCameraNote || null,
        appData.privateAreaNote || null,
        now,
        id
      ).run();

      return new Response(JSON.stringify({
        success: true,
        message: 'App imesasishwa kikamilifu'
      }), { headers: corsHeaders });
    }

    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Route not found' 
    }), { 
      status: 404,
      headers: corsHeaders 
    });
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
      'Access-Control-Allow-Methods': 'POST, PUT, DELETE, OPTIONS',
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
