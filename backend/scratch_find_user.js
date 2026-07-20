const { supabase } = require('./src/db/supabase');

async function findUser() {
  const { data: users, error } = await supabase
    .from('authorised_users')
    .select('*');

  if (error) {
    console.error('Error fetching users:', error);
  } else {
    const targetUsers = users.filter(u => 
      u.mobile_number && u.mobile_number.includes('8276071523')
    );
    console.log('Matches found in DB:', targetUsers);
  }
  process.exit(0);
}

findUser();
