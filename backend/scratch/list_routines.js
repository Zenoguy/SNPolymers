const { supabase } = require('../src/db/supabase');

async function run() {
  const { data, error } = await supabase
    .from('authorised_users') // bypass RLS/access, let's query via standard RPC if possible, or wait!
    .select('*')
    .limit(1);

  // We can run a select on pg_proc or information_schema.routines by using a direct select if we have table access,
  // or we can see if we can query it:
  const { data: routines, error: routError } = await supabase
    .rpc('run_sql', { query: "SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public'" })
    .catch(e => ({ error: e }));

  console.log('Routines error:', routError);
  console.log('Routines data:', routines);
}

run();
