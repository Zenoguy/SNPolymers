const { supabase } = require('../src/db/supabase');

const LEGIT_USERS = [
  '+919883321834', // Aswint Guha
  '+918276071523', // Shreyan Ghosh
  '+917980526576', // Aryak Pal
  '+919910076148', // JE
  '+919920076148', // ZO
  '+919930076148', // HO
  '+919940076148'  // Admin
];

async function cleanAll() {
  console.log('Starting DB test remnants cleanup...');

  try {
    const legitCsv = `("${LEGIT_USERS.join('","')}")`;

    // 1. Find all estimates associated with test work orders or test users
    const { data: estimates, error: estErr } = await supabase
      .from('project_cost_estimates')
      .select('estimate_id, work_order_no, created_by, last_modified_by, je_user_id, zo_approved_by, ho_approved_by');
    
    if (estErr) throw estErr;

    const testEstimateIds = [];
    if (estimates) {
      estimates.forEach(e => {
        const isTestWO = e.work_order_no && e.work_order_no.startsWith('TEST_');
        const isCreatedByTest = e.created_by && !LEGIT_USERS.includes(e.created_by);
        const isModifiedByTest = e.last_modified_by && !LEGIT_USERS.includes(e.last_modified_by);
        const isJeByTest = e.je_user_id && !LEGIT_USERS.includes(e.je_user_id);
        const isZoByTest = e.zo_approved_by && !LEGIT_USERS.includes(e.zo_approved_by);
        const isHoByTest = e.ho_approved_by && !LEGIT_USERS.includes(e.ho_approved_by);

        if (isTestWO || isCreatedByTest || isModifiedByTest || isJeByTest || isZoByTest || isHoByTest) {
          testEstimateIds.push(e.estimate_id);
        }
      });
    }

    console.log(`Found ${testEstimateIds.length} test estimates to clean up/dissociate.`);

    if (testEstimateIds.length > 0) {
      // Delete estimate items of test estimates
      const { error: itemDelErr } = await supabase
        .from('project_cost_estimate_items')
        .delete()
        .in('estimate_id', testEstimateIds);
      if (itemDelErr) console.warn('Error deleting estimate items:', itemDelErr.message);

      // Delete revision logs of test estimates
      const { error: revDelErr } = await supabase
        .from('estimate_revision_log')
        .delete()
        .in('estimate_id', testEstimateIds);
      if (revDelErr) console.warn('Error deleting revision logs:', revDelErr.message);
      
      // Dissociate estimate headers so they point to a valid work order and a valid user, allowing deletion of test projects/users
      const { error: updEstErr } = await supabase
        .from('project_cost_estimates')
        .update({
          work_order_no: 'WB_BAN_102',
          created_by: '+918276071523',
          last_modified_by: '+918276071523',
          je_user_id: '+918276071523',
          zo_approved_by: null,
          ho_approved_by: null
        })
        .in('estimate_id', testEstimateIds);
      if (updEstErr) console.warn('Error dissociating estimate headers:', updEstErr.message);
    }

    // 2. Clean up fund reports referencing test users or test projects
    console.log('Deleting fund reports referencing test users or projects...');
    const { error: frDelErr } = await supabase
      .from('fund_reports')
      .delete()
      .or(`created_by.not.in.${legitCsv},work_order_no.like.TEST_%`);
    if (frDelErr) console.warn('Error deleting fund reports:', frDelErr.message);

    // 3. Clean up purchase data referencing test users or test names
    console.log('Deleting purchase data referencing test users...');
    const { error: pdDelErr } = await supabase
      .from('purchase_data')
      .delete()
      .or(`created_by.not.in.${legitCsv},name.like.TEST_%`);
    if (pdDelErr) console.warn('Error deleting purchase data:', pdDelErr.message);

    // 4. Delete test materials
    console.log('Deleting materials referencing test users or starting with "Test "...');
    const { error: matDelErr } = await supabase
      .from('material_master')
      .delete()
      .or(`created_by.not.in.${legitCsv},Material_Details.like.Test %`);
    if (matDelErr) console.warn('Error deleting materials:', matDelErr.message);

    // 5. Clean up projects starting with TEST_
    console.log('Deleting projects starting with TEST_...');
    const { error: projDelErr } = await supabase
      .from('projects_master')
      .delete()
      .like('work_order_no', 'TEST_%');
    if (projDelErr) console.warn('Error deleting projects:', projDelErr.message);

    // 6. Delete test users
    console.log('Deleting test users not in whitelist...');
    const { error: userDelErr } = await supabase
      .from('authorised_users')
      .delete()
      .not('mobile_number', 'in', legitCsv);
    if (userDelErr) console.warn('Error deleting users:', userDelErr.message);

    console.log('Purge cycle completed successfully.');
  } catch (err) {
    console.error('Cleanup failed:', err.message);
  }
}

cleanAll();
