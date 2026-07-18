const { supabase } = require('./src/db/supabase');

async function checkSchema() {
  const { data, error } = await supabase.rpc('run_sql', {
    query: `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'ra_final_bills';
    `
  });

  if (error) {
    console.error('Error fetching schema:', error);
  } else {
    console.log('Columns in ra_final_bills:', data);
  }
  process.exit(0);
}

checkSchema();
