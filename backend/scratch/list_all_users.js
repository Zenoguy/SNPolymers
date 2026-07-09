const { supabase } = require('../src/db/supabase');

async function run() {
  const { data: users, error } = await supabase
    .from('authorised_users')
    .select('mobile_number, role, display_name, telegram_chat_id, is_active');
  
  if (error) {
    console.error('Error finding users:', error);
    return;
  }
  
  console.log('ALL USERS IN DB:');
  console.log(JSON.stringify(users, null, 2));
}

run();
