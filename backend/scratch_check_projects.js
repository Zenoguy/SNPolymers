const { supabase } = require('./src/db/supabase');

async function checkProjects() {
  const target = '+91629118153';
  console.log('Checking projects_master for zo_user_id =', target);

  const { data: projects, error } = await supabase
    .from('projects_master')
    .select('work_order_no, site_details, zo_user_id')
    .eq('zo_user_id', target);

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Projects referencing this user:', projects);
  }
  process.exit(0);
}

checkProjects();
