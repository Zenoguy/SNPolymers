const { supabase } = require('../src/db/supabase');
const { notifyHoFundRequestSubmitted } = require('../src/services/telegram.service');

async function run() {
  const { data: request, error } = await supabase
    .from('fund_requests')
    .select('*')
    .eq('zo_fr_no', '1000')
    .maybeSingle();
  
  if (error || !request) {
    console.error('Error finding request:', error || 'Not found');
    return;
  }
  
  console.log('Found request:', request);
  console.log('Triggering notifyHoFundRequestSubmitted...');
  await notifyHoFundRequestSubmitted(request);
  console.log('Done!');
}

run();
