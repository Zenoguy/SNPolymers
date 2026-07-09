const { supabase } = require('../src/db/supabase');

async function run() {
  const { data: requests, error } = await supabase
    .from('fund_requests')
    .select('zo_user_id');
  
  if (error) {
    console.error('Error finding fund requests:', error);
    return;
  }
  
  const uniqueZos = Array.from(new Set(requests.map(r => r.zo_user_id)));
  console.log('Unique ZO User IDs in fund requests:', uniqueZos);
}

run();
