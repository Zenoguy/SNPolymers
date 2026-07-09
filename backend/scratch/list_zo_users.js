const { supabase } = require('../src/db/supabase');

async function run() {
  const { data: users, error } = await supabase
    .from('authorised_users')
    .select('mobile_number, role, display_name, telegram_chat_id, is_active')
    .eq('role', 'zo');
  
  if (error) {
    console.error('Error finding ZO users:', error);
    return;
  }
  
  console.log('ALL ZO USERS:');
  console.log(JSON.stringify(users, null, 2));
}

run();
