const { supabase } = require('../src/db/supabase');

async function run() {
  const { data: users, error } = await supabase
    .from('authorised_users')
    .select('mobile_number, role, display_name, telegram_chat_id, is_active');
  
  if (error) {
    console.error('Error finding users:', error);
    return;
  }
  
  const realUsers = users.filter(u => 
    !u.display_name.startsWith('Test') && 
    u.display_name !== 'Other JE User' && 
    u.display_name !== 'ZO User' && 
    u.display_name !== 'JE User A'
  );
  
  console.log('REAL/NON-TEST USERS:');
  console.log(JSON.stringify(realUsers, null, 2));
}

run();
