export async function onRequestGet(context) {
  const { env } = context;
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
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
    const apps = await env.DB.prepare(
      'SELECT * FROM apps WHERE is_active = 1 ORDER BY id'
    ).all();

    if (apps.results.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        apps: getDefaultApps()
      }), { headers: corsHeaders });
    }

    const parsedApps = apps.results.map(app => ({
      id: app.id,
      name: app.name,
      tagline: app.tagline || '',
      description: app.description || '',
      category: app.category || 'Tools',
      platform: app.platform || 'Android',
      iconName: app.icon_name || 'file-text',
      accentColor: app.accent_color || '#06b6d4',
      testingUrl: correctUrls[app.id] || app.testing_url || '',
      isActive: app.is_active === 1,
      features: app.features ? JSON.parse(app.features) : [],
      dualCameraNote: app.dual_camera_note || null,
      privateAreaNote: app.private_area_note || null
    }));

    return new Response(JSON.stringify({
      success: true,
      apps: parsedApps
    }), { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching apps:', error);
    return new Response(JSON.stringify({
      success: true,
      apps: getDefaultApps()
    }), { headers: corsHeaders });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}

function getDefaultApps() {
  return [
    {
      id: 'pdf-office',
      name: 'PDF Office',
      tagline: 'Programu ya kufungua, kusoma na kuhariri nyaraka kwenye simu yako.',
      description: 'Tumia programu hii kufanya kazi na nyaraka za PDF, Word na Office kwa wepesi kutoka kwenye kifaa chako cha Android popote ulipo.',
      category: 'Tija & Nyaraka (Productivity)',
      platform: 'Android',
      iconName: 'file-text',
      accentColor: '#EF4444',
      testingUrl: 'https://play.google.com/apps/testing/co.pdfoffice.ap',
      isActive: true,
      features: ['Kufungua PDF haraka', 'Kusoma nyaraka mbalimbali', 'Kuhariri nyaraka kwa urahisi', 'Kufanya kazi na nyaraka za office', 'Kiolesura rafiki kwa simu za mkononi']
    },
    {
      id: 'free-screen-recorder',
      name: 'Free Screen Recorder',
      tagline: 'Rekodi kinachoonekana kwenye screen ya simu yako kwa urahisi.',
      description: 'Njia bora ya kurekodi screen ya simu kwa ajili ya video za maelekezo, michezo (gameplay), tutorials za mafunzo na maudhui ya mitandao ya kijamii.',
      category: 'Video & Vyombo vya Habari',
      platform: 'Android',
      iconName: 'video',
      accentColor: '#10B981',
      testingUrl: 'https://play.google.com/apps/testing/co.freescreenrecorder.ap',
      isActive: true,
      features: ['Screen recording bila vikwazo', 'Kutengeneza video zenye sauti safi', 'Kurekodi tutorials na masomo', 'Kurekodi gameplay za michezo', 'Face camera / camera overlay inayofanya kazi bila kukwama', 'Creating instructional videos za kuelimisha'],
      dualCameraNote: 'App ina kipengele cha kutumia kamera ya mbele na kamera ya nyuma kwa wakati mmoja kwa ajili ya kurekodi matukio huku ukijirekodi pia.'
    },
    {
      id: 'jobsreport',
      name: 'JobsReport',
      tagline: 'Programu inayokusaidia kupata taarifa za nafasi za kazi na fursa mbalimbali za ajira.',
      description: 'Imeundwa maalum kwa ajili ya wanaotafuta kazi Tanzania na Afrika Mashariki, kuwezesha upatikanaji wa matangazo ya ajira kwa wakati bila usumbufu.',
      category: 'Ajira & Kazi (Jobs & Careers)',
      platform: 'Android',
      iconName: 'briefcase',
      accentColor: '#F59E0B',
      testingUrl: 'https://play.google.com/apps/testing/co.jobsreport.ap',
      isActive: true,
      features: ['Kuangalia nafasi mpya za kazi kila siku', 'Kutafuta fursa kulingana na aina na taaluma', 'Kusoma maelezo na vigezo vya ajira', 'Kufuatilia fursa mpya kwa urahisi na arifa', 'Kuhifadhi kazi unazopenda kusoma baadaye']
    },
    {
      id: 'music-play',
      name: 'Music Play',
      tagline: 'Music player iliyoundwa kukupa uzoefu mzuri wa kusikiliza muziki kwenye simu yako.',
      description: 'Cheza muziki uliohifadhiwa kwenye kifaa chako kwa ubora wa juu wa sauti na kiolesura cha kisasa chenye kuvutia.',
      category: 'Muziki & Sauti (Audio)',
      platform: 'Android',
      iconName: 'music',
      accentColor: '#8B5CF6',
      testingUrl: 'https://play.google.com/apps/testing/co.musicplay.ap',
      isActive: true,
      features: ['Kusikiliza muziki ulio kwenye simu', 'Kuonyesha Album artwork zenye kuvutia', 'Kupanga kwa Wasanii (Artists) & Albamu', 'Kupanga nyimbo, Folders na Playlists zako', 'Modern music-player interface na kusawazisha sauti (equalizer)', 'Smooth music playback bila kukatika']
    },
    {
      id: 'top-file-manager',
      name: 'Top File Manager',
      tagline: 'File manager ya kupanga, kusimamia na kulinda mafaili yako kwenye simu.',
      description: 'Panga storage yako, fikia mafaili haraka na uweke maudhui yako ya siri salama kwa mfumo thabiti wa usalama.',
      category: 'Usimamizi wa Mafaili (Utility)',
      platform: 'Android',
      iconName: 'folder-lock',
      accentColor: '#06B6D4',
      testingUrl: 'https://play.google.com/apps/testing/co.topfilemanager.ap',
      isActive: true,
      features: ['Kupanga mafaili na kumbukumbu ya simu', 'Kusimamia documents za kazi na shule', 'Kusimamia picha na video kwa makundi', 'Kufungua aina mbalimbali za mafaili', 'Hide/private area for selected files', 'Kulinda maudhui binafsi kwa nenosiri/PIN'],
      privateAreaNote: 'Kipengele maalum cha faragha (hide/private area) kinakuwezesha kulinda na kuficha picha, video na nyaraka mbali na machoni pa watu wengine.'
    },
    {
      id: 'int-calculator',
      name: 'Int Calculator',
      tagline: 'Calculator yenye uwezo wa kufanya mahesabu na pia kutoa eneo la faragha kwa kulinda baadhi ya taarifa zako.',
      description: 'Unaweza kutumia calculator kufanya mahesabu ya kawaida, huku ikiwa pia na eneo maalum la faragha kwa ajili ya kulinda taarifa zako binafsi.',
      category: 'Mahesabu & Faragha (Security & Utility)',
      platform: 'Android',
      iconName: 'calculator',
      accentColor: '#3B82F6',
      testingUrl: 'https://play.google.com/apps/testing/co.intcalculator.ap',
      isActive: true,
      features: ['Mahesabu ya haraka ya hisabati na fedha', 'Private area ya kulinda taarifa binafsi', 'Kulinda Contacts (Majina ya simu ya siri)', 'Kuficha Pictures na Videos binafsi', 'Kulinda Documents na maelezo ya siri', 'Mwonekano safi wa calculator halisi'],
      privateAreaNote: 'Inajumuisha sehemu ya siri (vault) iliyofichwa nyuma ya nenosiri la hesabu kwa ajili ya kulinda Contacts, Picha, Video na Nyaraka zako muhimu.'
    }
  ];
}
