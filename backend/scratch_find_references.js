const { supabase } = require('./src/db/supabase');

async function findReferences() {
  const target = '+91629118153';
  console.log('Searching database references for:', target);

  const tables = [
    { name: 'zo_balances', field: 'zo_user_id' },
    { name: 'je_zo_mappings', field: 'je_user_id' },
    { name: 'je_zo_mappings', field: 'zo_user_id' },
    { name: 'je_zo_mappings', field: 'assigned_by' },
    { name: 'work_order_mappings', field: 'je_user_id' },
    { name: 'work_order_mappings', field: 'assigned_by' },
    { name: 'projects_master', field: 'zo_user_id' },
    { name: 'zo_fund_ledger', field: 'zo_user_id' },
    { name: 'zo_fund_ledger', field: 'created_by' },
    { name: 'excess_fund_returns', field: 'zo_user_id' },
    { name: 'excess_fund_returns', field: 'requested_by' },
    { name: 'requisitions', field: 'zo_user_id' },
    { name: 'daily_progress_reports', field: 'zo_user_id' }
  ];

  for (const t of tables) {
    const { data, error } = await supabase
      .from(t.name)
      .select('*')
      .eq(t.field, target);

    if (error) {
      console.error(`Error querying ${t.name}.${t.field}:`, error.message);
    } else if (data && data.length > 0) {
      console.log(`Found ${data.length} match(es) in ${t.name}.${t.field}:`, data);
    }
  }

  console.log('Search finished.');
  process.exit(0);
}

findReferences();
