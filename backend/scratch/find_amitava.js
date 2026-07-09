const { supabase } = require('../src/db/supabase');

async function run() {
  const { data: users, error } = await supabase
    .from('authorised_users')
    .select('*')
    .ilike('display_name', '%amit%');
  
  if (error) {
    console.error('Error finding user:', error);
    return;
  }
  
  console.log('Matching Users:', users);
}

run();
