const { supabase } = require('./src/db/supabase');

async function listUsers() {
  const { data: users, error } = await supabase
    .from('authorised_users')
    .select('*');

  if (error) {
    console.error('Error fetching users:', error);
  } else {
    console.log('Whitelisted users in DB:', users.map(u => ({ id: u.id, name: u.display_name, mobile: u.mobile_number, role: u.role })));
  }
  process.exit(0);
}

listUsers();
