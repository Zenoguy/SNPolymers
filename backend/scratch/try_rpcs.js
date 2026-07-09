const { supabase } = require('../src/db/supabase');

async function run() {
  const rpcs = [
    'run_sql',
    'exec_sql',
    'execute_sql',
    'sql',
    'query',
    'run_query',
    'exec_query',
    'execute_query'
  ];
  
  for (const rpc of rpcs) {
    try {
      const { data, error } = await supabase.rpc(rpc, { query: 'SELECT 1' });
      if (error) {
        console.log(`RPC '${rpc}' failed:`, error.message);
      } else {
        console.log(`RPC '${rpc}' SUCCEEDED:`, data);
      }
    } catch (err) {
      console.log(`RPC '${rpc}' threw exception:`, err.message);
    }
  }
}

run();
