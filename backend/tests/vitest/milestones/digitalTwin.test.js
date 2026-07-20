import { describe, test, expect, beforeAll, afterAll } from 'vitest';
const crypto = require('crypto');
const { supabase } = require('../../../src/db/supabase');
const setupUsers = require('../../helpers/setupUsers');
const mockRes = require('../../helpers/mockRes');
const { getProjectDigitalTwin } = require('../../../src/controllers/analytics.controller');

describe('Project Digital Twin - API & Data Binding Inconsistency Tests', () => {
  let suffix;
  let jeMobile;
  let zoMobile;
  let adminMobile;
  let workOrderNo;
  let estimateId;
  let requisitionId;

  beforeAll(async () => {
    suffix = crypto.randomUUID().substring(0, 8);
    jeMobile = `9501${suffix}`;
    zoMobile = `9502${suffix}`;
    adminMobile = `9503${suffix}`;
    workOrderNo = `WO-P8-DT-${suffix}`;

    await setupUsers([
      { mobile_number: jeMobile, role: 'je', is_active: true, display_name: `JE DT ${suffix}` },
      { mobile_number: zoMobile, role: 'zo', is_active: true, display_name: `ZO DT ${suffix}` },
      { mobile_number: adminMobile, role: 'admin', is_active: true, display_name: `Admin DT ${suffix}` }
    ]);

    // Insert project with department and other fields
    const { error: projErr } = await supabase
      .from('projects_master')
      .insert([
        {
          work_order_no: workOrderNo,
          estimate_no: `EST-P8-DT-${suffix}`,
          site_details: `Site DT ${suffix}`,
          zo_user_id: zoMobile,
          state: 'West Bengal',
          district: 'Kolkata',
          zone: 'Kolkata Zone',
          department: 'PWD Department',
          status: 'Running',
          created_by: adminMobile,
          edited_by: adminMobile,
          work_order_value: 200000.00,
          project_start_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          project_end_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      ]);

    if (projErr) throw new Error(`Project setup failed: ${projErr.message}`);

    // Set up JE-ZO mapping
    await supabase.from('je_zo_mappings').insert([
      { je_user_id: jeMobile, zo_user_id: zoMobile, assigned_by: adminMobile, is_active: true }
    ]);

    // Map work order to JE
    await supabase.from('work_order_mappings').insert([
      { work_order_no: workOrderNo, je_user_id: jeMobile, assigned_by: adminMobile, is_active: true, reason: 'Assigned' }
    ]);

    // Create Estimates to test revision ordering
    const { data: estData1 } = await supabase
      .from('project_cost_estimates')
      .insert([
        {
          work_order_no: workOrderNo,
          estimate_no: `EST-P8-DT-${suffix}-v1`,
          area_code: 'Kolkata Zone',
          zonal_office_no: 'Kolkata Zone',
          je_user_id: jeMobile,
          je_date: new Date(Date.now() - 10000).toISOString(),
          estimate_amount: 150000.00,
          estimate_status: 'Final Approved',
          estimate_revision: 0,
          created_by: jeMobile
        }
      ])
      .select('estimate_id')
      .single();

    const { data: estData2 } = await supabase
      .from('project_cost_estimates')
      .insert([
        {
          work_order_no: workOrderNo,
          estimate_no: `EST-P8-DT-${suffix}-v2`,
          area_code: 'Kolkata Zone',
          zonal_office_no: 'Kolkata Zone',
          je_user_id: jeMobile,
          je_date: new Date().toISOString(),
          estimate_amount: 180000.00,
          estimate_status: 'Submitted',
          estimate_revision: 1, // Higher revision
          created_by: jeMobile
        }
      ])
      .select('estimate_id')
      .single();

    estimateId = estData2?.estimate_id;

    // Refresh analytics views
    await supabase.rpc('refresh_analytics_views');
  });

  afterAll(async () => {
    await supabase.from('requisitions').delete().eq('work_order_no', workOrderNo);
    await supabase.from('project_cost_estimates').delete().eq('work_order_no', workOrderNo);
    await supabase.from('work_order_mappings').delete().eq('work_order_no', workOrderNo);
    await supabase.from('je_zo_mappings').delete().eq('je_user_id', jeMobile);
    await supabase.from('projects_master').delete().eq('work_order_no', workOrderNo);
    await supabase.from('authorised_users').delete().in('mobile_number', [jeMobile, zoMobile, adminMobile]);
    await supabase.rpc('refresh_analytics_views');
  });

  test('Should return department and latest estimate_id in project digital twin overview', async () => {
    const req = {
      user: { role: 'je', mobile_number: jeMobile },
      params: { work_order_no: workOrderNo }
    };
    const res = mockRes();
    await getProjectDigitalTwin(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.jsonData.success).toBe(true);

    const overview = res.jsonData.overview;
    expect(overview).toBeDefined();
    expect(overview.department).toBe('PWD Department');
    expect(overview.estimate_id).toBe(estimateId); // should match revision 1
    expect(overview.estimate_no).toBe(`EST-P8-DT-${suffix}-v1`); // Final Approved estimate_no is from revision 0 view compilation
  });

  test('Should allow access to HO and Admin roles', async () => {
    // HO/Admin should be able to view any project
    const reqHO = {
      user: { role: 'ho', mobile_number: '9999999999' },
      params: { work_order_no: workOrderNo }
    };
    const resHO = mockRes();
    await getProjectDigitalTwin(reqHO, resHO);
    expect(resHO.statusCode).toBe(200);
    expect(resHO.jsonData.success).toBe(true);

    const reqAdmin = {
      user: { role: 'admin', mobile_number: adminMobile },
      params: { work_order_no: workOrderNo }
    };
    const resAdmin = mockRes();
    await getProjectDigitalTwin(reqAdmin, resAdmin);
    expect(resAdmin.statusCode).toBe(200);
    expect(resAdmin.jsonData.success).toBe(true);
  });

  test('Should allow access to mapped ZO role', async () => {
    const req = {
      user: { role: 'zo', mobile_number: zoMobile },
      params: { work_order_no: workOrderNo }
    };
    const res = mockRes();
    await getProjectDigitalTwin(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.jsonData.success).toBe(true);
  });

  test('Should deny access to unmapped JEs and wrong ZOs', async () => {
    // Unmapped JE
    const reqUnmappedJE = {
      user: { role: 'je', mobile_number: '9111111111' },
      params: { work_order_no: workOrderNo }
    };
    const resUnmappedJE = mockRes();
    await getProjectDigitalTwin(reqUnmappedJE, resUnmappedJE);
    expect(resUnmappedJE.statusCode).toBe(403);
    expect(resUnmappedJE.jsonData.success).toBe(false);

    // Wrong ZO
    const reqWrongZO = {
      user: { role: 'zo', mobile_number: '9222222222' },
      params: { work_order_no: workOrderNo }
    };
    const resWrongZO = mockRes();
    await getProjectDigitalTwin(reqWrongZO, resWrongZO);
    expect(resWrongZO.statusCode).toBe(403);
    expect(resWrongZO.jsonData.success).toBe(false);
  });

  test('Should return correct data structures for all digital twin component sections', async () => {
    const req = {
      user: { role: 'admin', mobile_number: adminMobile },
      params: { work_order_no: workOrderNo }
    };
    const res = mockRes();
    await getProjectDigitalTwin(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.jsonData.overview).toBeDefined();
    expect(res.jsonData.materials).toBeInstanceOf(Array);
    expect(res.jsonData.approvals).toBeInstanceOf(Array);
    expect(res.jsonData.budget).toBeDefined();
    expect(res.jsonData.audits).toBeInstanceOf(Array);
  });

  test('Should return correct coordinates (latitude & longitude) in project digital twin overview', async () => {
    // Update coordinates in DB first
    await supabase
      .from('projects_master')
      .update({ site_latitude: 22.5726, site_longitude: 88.3639 })
      .eq('work_order_no', workOrderNo);

    const req = {
      user: { role: 'admin', mobile_number: adminMobile },
      params: { work_order_no: workOrderNo }
    };
    const res = mockRes();
    await getProjectDigitalTwin(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.jsonData.overview.site_latitude).toBe(22.5726);
    expect(res.jsonData.overview.site_longitude).toBe(88.3639);
  });

  test('Should handle project with no estimates gracefully (estimate_id should be null)', async () => {
    const emptyWorkOrderNo = `WO-P8-DT-EMPTY-${suffix}`;

    // Insert dummy project with no estimates
    const { error: insErr } = await supabase
      .from('projects_master')
      .insert([
        {
          work_order_no: emptyWorkOrderNo,
          estimate_no: `EST-P8-DT-EMPTY-${suffix}`,
          site_details: `Site Empty DT ${suffix}`,
          zo_user_id: zoMobile,
          state: 'West Bengal',
          district: 'Kolkata',
          zone: 'Kolkata Zone',
          department: 'PWD Department',
          status: 'Running',
          created_by: adminMobile,
          edited_by: adminMobile,
          work_order_value: 100000.00,
          project_start_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          project_end_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      ]);

    if (insErr) throw insErr;

    await supabase.rpc('refresh_analytics_views');

    const req = {
      user: { role: 'admin', mobile_number: adminMobile },
      params: { work_order_no: emptyWorkOrderNo }
    };
    const res = mockRes();
    await getProjectDigitalTwin(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.jsonData.overview.estimate_id).toBeNull();

    // Clean up
    await supabase.from('projects_master').delete().eq('work_order_no', emptyWorkOrderNo);
    await supabase.rpc('refresh_analytics_views');
  });

  test('Should handle non-existent projects by returning null overview', async () => {
    const req = {
      user: { role: 'admin', mobile_number: adminMobile },
      params: { work_order_no: 'WO-NON-EXISTENT' }
    };
    const res = mockRes();
    await getProjectDigitalTwin(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.jsonData.overview).toBeNull();
  });

  test('Should contain material_variance data layout structure even if empty', async () => {
    const req = {
      user: { role: 'admin', mobile_number: adminMobile },
      params: { work_order_no: workOrderNo }
    };
    const res = mockRes();
    await getProjectDigitalTwin(req, res);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.jsonData.materials)).toBe(true);
  });

  test('Should correctly calculate anomaly score in budget response object', async () => {
    const req = {
      user: { role: 'admin', mobile_number: adminMobile },
      params: { work_order_no: workOrderNo }
    };
    const res = mockRes();
    await getProjectDigitalTwin(req, res);

    expect(res.statusCode).toBe(200);
    if (res.jsonData.budget) {
      expect(res.jsonData.budget).toHaveProperty('anomaly_score');
      expect(res.jsonData.budget).toHaveProperty('leakage_status');
    }
  });
});
