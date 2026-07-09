const { supabase } = require('../src/db/supabase');

async function run() {
  const { data: requests, error } = await supabase
    .from('fund_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (error) {
    console.error('Error finding fund requests:', error);
    return;
  }
  
  console.log('LATEST FUND REQUESTS:');
  console.log(JSON.stringify(requests, null, 2));
}

run();
