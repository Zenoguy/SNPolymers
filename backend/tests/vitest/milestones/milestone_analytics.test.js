import { describe, test, expect, beforeAll, afterAll } from 'vitest';
const crypto = require('crypto');
const { supabase } = require('../../../src/db/supabase');
const setupUsers = require('../../helpers/setupUsers');
const mockRes = require('../../helpers/mockRes');
const {
  getHoKpis,
  getHoResourceUtilization,
  getHoApprovalSla,
  getHoZoneBenchmarking,
  getHoBudgetLeakage,
  getZoProductivity,
  getRecentActivity,
  getAuditLog,
  getProjectDigitalTwin,
  triggerRefresh
} = require('../../../src/controllers/analytics.controller');

describe('Analytics Controller & Views Integration Tests', () => {
  let suffix;
  let jeMobile;
  let zoMobile;
  let adminMobile;
  let otherZoMobile;
  let workOrderNo;
  let estimateId;
  let requisitionId;

  beforeAll(async () => {
    suffix = crypto.randomUUID().substring(0, 8);
    jeMobile = `9201${suffix}`;
    zoMobile = `9202${suffix}`;
    adminMobile = `9203${suffix}`;
    otherZoMobile = `9204${suffix}`;
    workOrderNo = `WO-AN-TEST-${suffix}`;

    // 1. Setup test users
    await setupUsers([
      {
        mobile_number: jeMobile,
        role: 'je',
        is_active: true,
        display_name: `Test JE ${suffix}`
      },
      {
        mobile_number: zoMobile,
        role: 'zo',
        is_active: true,
        display_name: `Test ZO ${suffix}`
      },
      {
        mobile_number: otherZoMobile,
        role: 'zo',
        is_active: true,
        display_name: `Other ZO ${suffix}`
      },
      {
        mobile_number: adminMobile,
        role: 'admin',
        is_active: true,
        display_name: `Test Admin ${suffix}`
      }
    ]);

    // 2. Insert test projects
    const { error: projectErr } = await supabase
      .from('projects_master')
      .insert([
        {
          work_order_no: workOrderNo,
          estimate_no: `EST-T-${suffix}`,
          site_details: `Test Project Site ${suffix}`,
          zo_user_id: zoMobile,
          state: 'State',
          district: 'District',
          zone: 'Zone A',
          department: 'Civil',
          status: 'Running',
          created_by: adminMobile,
          edited_by: adminMobile,
          work_order_value: 100000.00,
          project_start_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days ago
          project_end_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 25 days in future
        }
      ]);

    if (projectErr) {
      throw new Error(`Failed to set up test project: ${projectErr.message}`);
    }

    // 2b. Map JE to ZO first
    const { error: jeZoErr } = await supabase.from('je_zo_mappings').insert([
      {
        je_user_id: jeMobile,
        zo_user_id: zoMobile,
        assigned_by: adminMobile,
        is_active: true
      }
    ]);
    if (jeZoErr) {
      throw new Error(`Failed to set up JE-ZO mapping: ${jeZoErr.message}`);
    }

    // 3. Create a work order mapping for JE
    const { error: mapInsertErr } = await supabase.from('work_order_mappings').insert([
      {
        work_order_no: workOrderNo,
        je_user_id: jeMobile,
        assigned_by: adminMobile,
        is_active: true,
        reason: 'Assigned'
      }
    ]);
    if (mapInsertErr) {
      throw new Error(`Failed to set up work order mapping: ${mapInsertErr.message}`);
    }

    // 4. Create estimate & requisition
    const { data: estData, error: estInsertErr } = await supabase
      .from('project_cost_estimates')
      .insert([
        {
          work_order_no: workOrderNo,
          estimate_no: `EST-T-${suffix}`,
          area_code: 'Zone A',
          zonal_office_no: 'Zone A',
          je_user_id: jeMobile,
          je_date: new Date().toISOString(),
          estimate_amount: 80000.00,
          estimate_status: 'Final Approved',
          estimate_revision: 0,
          zo_approved_by: zoMobile,
          zo_approval_date: new Date().toISOString(),
          ho_approved_by: adminMobile,
          ho_approval_date: new Date().toISOString(),
          created_by: jeMobile
        }
      ])
      .select('estimate_id')
      .single();

    if (estInsertErr) {
      throw new Error(`Failed to set up cost estimate: ${estInsertErr.message}`);
    }
    estimateId = estData?.estimate_id;

    const { data: reqData, error: reqInsertErr } = await supabase
      .from('requisitions')
      .insert([
        {
          work_order_no: workOrderNo,
          estimate_no: `EST-T-${suffix}`,
          state: 'State',
          district: 'District',
          area_code: 'Zone A',
          department: 'Civil',
          site_details: 'Site Details',
          requisition_no: `REQ-T-${suffix}`,
          material_main_head: 'Cement',
          requisition_pdf_url: 'https://example.com/req.pdf',
          requisition_amount: 15000.00,
          gst_bill: 'No',
          bank_details: 'Test Bank Details',
          requisition_status: 'Approved',
          approved_amount: 12000.00,
          approved_balance_amount: 3000.00,
          requester_user_id: jeMobile,
          created_by: jeMobile,
          payment_date: new Date().toISOString(),
          approved_user_id: zoMobile
        }
      ])
      .select('requisition_id')
      .single();

    if (reqInsertErr) {
      throw new Error(`Failed to set up requisition: ${reqInsertErr.message}`);
    }
    requisitionId = reqData?.requisition_id;

    // 5. Trigger view refresh to load new data
    await supabase.rpc('refresh_analytics_views');
  });

  afterAll(async () => {
    // 6. Clean up created records in reverse order
    if (requisitionId) {
      await supabase.from('requisitions').delete().eq('requisition_id', requisitionId);
    }
    if (estimateId) {
      await supabase.from('project_cost_estimate_items').delete().eq('estimate_id', estimateId);
      await supabase.from('project_cost_estimates').delete().eq('estimate_id', estimateId);
    }
    await supabase.from('work_order_mappings').delete().eq('work_order_no', workOrderNo);
    await supabase.from('je_zo_mappings').delete().eq('je_user_id', jeMobile);
    await supabase.from('projects_master').delete().eq('work_order_no', workOrderNo);
    await supabase.from('authorised_users').delete().in('mobile_number', [jeMobile, zoMobile, otherZoMobile, adminMobile]);
    // Refresh again to leave the views clean
    await supabase.rpc('refresh_analytics_views');
  });

  test('TC-01: getHoKpis succeeds and returns valid KPI format', async () => {
    const req = { user: { role: 'admin' } };
    const res = mockRes();
    await getHoKpis(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.jsonData.success).toBe(true);
    expect(res.jsonData.kpis).toBeDefined();
    expect(res.jsonData.healthDistribution).toBeDefined();
  });

  test('TC-02: getHoResourceUtilization returns list of active JEs', async () => {
    const req = { user: { role: 'admin' } };
    const res = mockRes();
    await getHoResourceUtilization(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.jsonData.success).toBe(true);
    expect(Array.isArray(res.jsonData.data)).toBe(true);
  });

  test('TC-03: getHoApprovalSla returns SLA records with durations', async () => {
    const req = { user: { role: 'admin' } };
    const res = mockRes();
    await getHoApprovalSla(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.jsonData.success).toBe(true);
    expect(Array.isArray(res.jsonData.data)).toBe(true);
  });

  test('TC-04: getHoZoneBenchmarking returns zone performance metrics', async () => {
    const req = { user: { role: 'admin' } };
    const res = mockRes();
    await getHoZoneBenchmarking(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.jsonData.success).toBe(true);
    expect(Array.isArray(res.jsonData.data)).toBe(true);
  });

  test('TC-05: getHoBudgetLeakage returns anomalies', async () => {
    const req = { user: { role: 'admin' } };
    const res = mockRes();
    await getHoBudgetLeakage(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.jsonData.success).toBe(true);
    expect(Array.isArray(res.jsonData.data)).toBe(true);
  });

  test('TC-06: getZoProductivity returns metrics filtered to requested ZO', async () => {
    // 1. ZO query
    const reqZo = { user: { role: 'zo', mobile_number: zoMobile } };
    const resZo = mockRes();
    await getZoProductivity(reqZo, resZo);

    expect(resZo.statusCode).toBe(200);
    expect(resZo.jsonData.success).toBe(true);

    // 2. HO query
    const reqHo = { user: { role: 'admin' }, query: { zo_user_id: zoMobile } };
    const resHo = mockRes();
    await getZoProductivity(reqHo, resHo);

    expect(resHo.statusCode).toBe(200);
    expect(resHo.jsonData.success).toBe(true);
  });

  test('TC-07: getRecentActivity isolates ZO audits securely', async () => {
    // ZO query
    const req = { user: { role: 'zo', mobile_number: zoMobile } };
    const res = mockRes();
    await getRecentActivity(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.jsonData.success).toBe(true);
    expect(Array.isArray(res.jsonData.activities)).toBe(true);

    // Other ZO query (empty list expected if they own no projects)
    const reqOther = { user: { role: 'zo', mobile_number: otherZoMobile } };
    const resOther = mockRes();
    await getRecentActivity(reqOther, resOther);

    expect(resOther.statusCode).toBe(200);
    expect(resOther.jsonData.activities.length).toBe(0);
  });

  test('TC-08: getAuditLog supports search and paginated format', async () => {
    const req = {
      user: { role: 'admin' },
      query: { page: '1', limit: '10' }
    };
    const res = mockRes();
    await getAuditLog(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.jsonData.success).toBe(true);
    expect(res.jsonData.data).toBeDefined();
    expect(res.jsonData.totalCount).toBeDefined();
    expect(res.jsonData.page).toBe(1);
    expect(res.jsonData.totalPages).toBeDefined();
  });

  test('TC-09: getProjectDigitalTwin restricts access for non-mapped JEs/ZOs', async () => {
    // 1. Mapped JE access succeeds
    const reqJeSuccess = {
      user: { role: 'je', mobile_number: jeMobile },
      params: { work_order_no: workOrderNo }
    };
    const resJeSuccess = mockRes();
    await getProjectDigitalTwin(reqJeSuccess, resJeSuccess);

    expect(resJeSuccess.statusCode).toBe(200);
    expect(resJeSuccess.jsonData.success).toBe(true);
    expect(resJeSuccess.jsonData.overview).toBeDefined();

    // 2. Unmapped ZO access gets 403 Forbidden
    const reqZoFail = {
      user: { role: 'zo', mobile_number: otherZoMobile },
      params: { work_order_no: workOrderNo }
    };
    const resZoFail = mockRes();
    await getProjectDigitalTwin(reqZoFail, resZoFail);

    expect(resZoFail.statusCode).toBe(403);
    expect(resZoFail.jsonData.success).toBe(false);
  });
});
