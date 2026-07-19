const { supabase } = require('./src/db/supabase');

async function findUser() {
  const { data: users, error } = await supabase
    .from('authorised_users')
    .select('*');

  if (error) {
    console.error('Error fetching users:', error);
  } else {
    const neymarUsers = users.filter(u => 
      (u.display_name && u.display_name.toLowerCase().includes('neymar')) || 
      (u.mobile_number && u.mobile_number.includes('629118153'))
    );
    console.log('Matches found in DB:', neymarUsers);
  }
  process.exit(0);
}

findUser();
