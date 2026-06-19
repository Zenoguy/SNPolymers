const { supabase } = require('../db/supabase');

/**
 * GET /api/v1/auth/master-data/version
 * Fetches the current master data catalog version.
 */
async function getMasterDataVersion(req, res) {
  try {
    const { data, error } = await supabase
      .from('master_data_versions')
      .select('version')
      .eq('id', 1)
      .maybeSingle();

    if (error) {
      console.warn(`master_data_versions table query failed, returning fallback version 1. Detail: ${error.message}`);
      return res.status(200).json({ success: true, version: 1 });
    }

    const version = data ? Number(data.version) : 1;
    return res.status(200).json({ success: true, version });
  } catch (error) {
    console.error(`getMasterDataVersion failed: ${error.message}`);
    // Safe fallback version
    return res.status(200).json({ success: true, version: 1 });
  }
}

/**
 * GET /api/v1/auth/master-data/catalog
 * Fetches version, material hierarchy, and purchase sources.
 */
async function getMasterDataCatalog(req, res) {
  try {
    // 1. Fetch Version (gracefully default if table is not yet migrated/created)
    let version = 1;
    try {
      const { data: verData, error: verErr } = await supabase
        .from('master_data_versions')
        .select('version')
        .eq('id', 1)
        .maybeSingle();
      
      if (!verErr && verData) {
        version = Number(verData.version);
      } else if (verErr) {
        console.warn(`master_data_versions table query failed: ${verErr.message}. Defaulting to catalog version 1.`);
      }
    } catch (verCatch) {
      console.warn(`Failed to fetch master data version: ${verCatch.message}. Defaulting to catalog version 1.`);
    }

    // 2. Fetch Active Materials
    const { data: materials, error: matErr } = await supabase
      .from('material_master')
      .select('id, Material_Main_Head, Material_Sub_Head, Material_Details, M_Unit')
      .eq('is_active', true);
    
    if (matErr) throw matErr;

    // 3. Fetch Active Purchase Sources
    const { data: purchaseSources, error: purErr } = await supabase
      .from('purchase_data')
      .select('id, name')
      .eq('is_active', true);
    
    if (purErr) throw purErr;

    // 4. Construct hierarchical structure
    // Group by Main Head -> Sub Head -> Material details
    const categoryMap = {};

    (materials || []).forEach(mat => {
      const mainHead = mat.Material_Main_Head;
      const subHead = mat.Material_Sub_Head;

      if (!categoryMap[mainHead]) {
        categoryMap[mainHead] = {
          name: mainHead,
          subHeadsMap: {}
        };
      }

      if (!categoryMap[mainHead].subHeadsMap[subHead]) {
        categoryMap[mainHead].subHeadsMap[subHead] = {
          name: subHead,
          materials: []
        };
      }

      categoryMap[mainHead].subHeadsMap[subHead].materials.push({
        id: mat.id,
        name: mat.Material_Details,
        unit: mat.M_Unit
      });
    });

    const categories = Object.values(categoryMap).map(cat => {
      const subHeads = Object.values(cat.subHeadsMap).map(sub => ({
        name: sub.name,
        materials: sub.materials
      }));
      return {
        name: cat.name,
        subHeads
      };
    });

    return res.status(200).json({
      success: true,
      version,
      categories,
      purchaseSources
    });

  } catch (error) {
    console.error(`getMasterDataCatalog failed: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Failed to retrieve master data catalog.' });
  }
}

module.exports = {
  getMasterDataVersion,
  getMasterDataCatalog
};
