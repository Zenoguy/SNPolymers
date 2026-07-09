const { supabase } = require('../src/db/supabase');

async function run() {
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const { data: requests, error } = await supabase
    .from('fund_requests')
    .select('*')
    .gte('created_at', todayStart.toISOString());
  
  if (error) {
    console.error('Error finding today\'s requests:', error);
    return;
  }
  
  console.log('TODAY\'S FUND REQUESTS (UTC):', requests.length);
  console.log(JSON.stringify(requests, null, 2));
}

run();
