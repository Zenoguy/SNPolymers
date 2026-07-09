const { supabase } = require('../src/db/supabase');

async function run() {
  const { data: users, error } = await supabase
    .from('authorised_users')
    .select('mobile_number, role, display_name, telegram_chat_id, is_active')
    .not('telegram_chat_id', 'is', null);
  
  if (error) {
    console.error('Error finding users:', error);
    return;
  }
  
  console.log('USERS WITH TELEGRAM CHAT ID LINKED:');
  console.log(JSON.stringify(users, null, 2));
}

run();
