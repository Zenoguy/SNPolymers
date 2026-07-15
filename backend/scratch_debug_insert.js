const { supabase } = require('./src/db/supabase');

async function debug() {
  const suffix = 'debug456';
  const jeMobile = '+91900003_debu';
  const zoMobile = '+91900001_debu';

  // Insert mock requisition
  const reqNo = `REQ_${suffix}`;
  const { data, error } = await supabase.from('requisitions').insert({
    requisition_no: reqNo,
    work_order_no: 'WO_debug123', // Let's try some WO
    requisition_amount: 15000.00,
    status: 'Pending',
    created_by: jeMobile,
    zo_user_id: zoMobile
  }).select();

  console.log('Requisition insert result:', { data, error });
}

debug();
