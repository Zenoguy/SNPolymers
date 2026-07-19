const { supabase } = require('./src/db/supabase');

async function searchNeymar() {
  const target = '+916291181533';
  console.log('Searching for target:', target);

  const { data: user, error } = await supabase
    .from('authorised_users')
    .select('*')
    .eq('mobile_number', target)
    .maybeSingle();

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Search matches for mobile:', user);
  }
  process.exit(0);
}

searchNeymar();
