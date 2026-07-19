const { supabase } = require('./src/db/supabase');

async function testDelete() {
  const target = '+91629118153';
  console.log('Attempting to delete user:', target);

  // Get user details
  const { data: user, error: getErr } = await supabase
    .from('authorised_users')
    .select('*')
    .eq('mobile_number', target)
    .maybeSingle();

  if (getErr) {
    console.error('Error fetching user:', getErr);
    process.exit(1);
  }

  if (!user) {
    console.log('User not found.');
    process.exit(0);
  }

  console.log('User found in authorised_users:', user);

  // Invalidate sessions first
  await supabase
    .from('sessions')
    .update({ is_active: false })
    .eq('user_id', user.id);

  // Pre-cleanup
  await supabase.from('zo_balances').delete().eq('zo_user_id', target);
  await supabase.from('je_zo_mappings').delete().or(`je_user_id.eq.${target},zo_user_id.eq.${target}`);
  await supabase.from('work_order_mappings').delete().eq('je_user_id', target);

  // Delete from authorised_users
  const { error: delErr } = await supabase
    .from('authorised_users')
    .delete()
    .eq('id', user.id);

  if (delErr) {
    console.error('Delete failed. Exact Postgres Error:', delErr);
  } else {
    console.log('Delete succeeded!');
  }

  process.exit(0);
}

testDelete();
