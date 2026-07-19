const { supabase } = require('./src/db/supabase');

async function searchNeymar() {
  const { data: users, error } = await supabase
    .from('authorised_users')
    .select('*')
    .ilike('display_name', '%neymar%');

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Search matches for neymar:', users);
  }
  process.exit(0);
}

searchNeymar();
