const { supabase } = require('./supabase');
const materials = require('./materials.json');

async function seed() {
  console.log(`Starting seeding of ${materials.length} materials...`);
  
  // Chunk inserts to prevent payload size limits (e.g. 100 rows per insert)
  const chunkSize = 100;
  for (let i = 0; i < materials.length; i += chunkSize) {
    const chunk = materials.slice(i, i + chunkSize);
    const { error } = await supabase.from('material_master').insert(chunk);
    if (error) {
      console.error(`Error inserting chunk ${i} to ${i + chunk.length}:`, error);
      process.exit(1);
    }
    console.log(`Inserted chunk ${i} to ${i + chunk.length}`);
  }
  
  console.log('Seeding completed successfully!');
  
  // Verify count
  const { count, error } = await supabase.from('material_master').select('*', { count: 'exact', head: true });
  if (error) {
    console.error('Error verifying count:', error);
  } else {
    console.log(`Verified row count in database: ${count}`);
  }
}

seed();
