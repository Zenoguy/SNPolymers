const { supabase } = require('../src/db/supabase');

const keepMobiles = [
  '+919883321834', // Aswint Guha
  '+918276071523', // Shreyan Ghosh
  '+917980526576', // Aryak Pal
  '+919910076148', // JE
  '+919920076148', // ZO
  '+919930076148', // HO
  '+919940076148'  // Admin
];

async function clean() {
  console.log('Initiating database cleanup...');

  try {
    // 1. Delete all revisions
    const { error: revErr } = await supabase
      .from('estimate_revision_log')
      .delete()
      .neq('revision_cycle', -1); // Deletes all rows safely
    if (revErr) throw revErr;
    console.log('- Cleared all project cost estimate revisions.');

    // 2. Delete all estimate items
    const { error: itemErr } = await supabase
      .from('project_cost_estimate_items')
      .delete()
      .neq('qty', -9999);
    if (itemErr) throw itemErr;
    console.log('- Cleared all project cost estimate items.');

    // 3. Clear/Re-associate FK references in project_cost_estimates to release other users
    console.log('Re-associating estimate creator/modifier FKs to default admin (+918276071523)...');
    const { error: updEstErr } = await supabase
      .from('project_cost_estimates')
      .update({
        created_by: '+918276071523',
        last_modified_by: '+918276071523',
        je_user_id: '+918276071523',
        zo_approved_by: null,
        ho_approved_by: null
      })
      .neq('created_by', '+918276071523');
    if (updEstErr) throw updEstErr;

    // Also update any other remaining references that might point to test users
    const { error: updEstErr2 } = await supabase
      .from('project_cost_estimates')
      .update({
        last_modified_by: '+918276071523',
        je_user_id: '+918276071523',
        zo_approved_by: null,
        ho_approved_by: null
      })
      .neq('last_modified_by', '+918276071523');
    if (updEstErr2) throw updEstErr2;

    // 4. Delete whitelisted test users (except standard seeds)
    const { error: userErr } = await supabase
      .from('authorised_users')
      .delete()
      .not('mobile_number', 'in', `("${keepMobiles.join('","')}")`);
    if (userErr) throw userErr;
    console.log('- Cleared all test and temporary whitelisted user accounts.');

    console.log('Database cleanup completed successfully!');
  } catch (error) {
    console.error('Cleanup failed with error:', error);
  }
}

clean();
