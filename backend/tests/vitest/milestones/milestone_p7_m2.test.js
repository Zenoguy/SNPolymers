import { describe, test, expect, beforeAll, afterAll } from 'vitest';
const crypto = require('crypto');
const { supabase } = require('../../../src/db/supabase');
const setupUsers = require('../../helpers/setupUsers');
const mockRes = require('../../helpers/mockRes');
const {
  createOrUpdateUserMapping,
  getUserMappings
} = require('../../../src/controllers/userMappings.controller');

describe('Milestone P7-M2 — User Mappings Controller Integration Tests', () => {
  let suffix;
  let jeMobile;
  let zoMobile1;
  let zoMobile2;
  let adminMobile;
  let fakeJeMobile;
  let workOrderNo;

  beforeAll(async () => {
    suffix = crypto.randomUUID().substring(0, 8);
    jeMobile = `9101${suffix}`;
    zoMobile1 = `9102${suffix}`;
    zoMobile2 = `9103${suffix}`;
    adminMobile = `9104${suffix}`;
    fakeJeMobile = `9105${suffix}`;
    workOrderNo = `WO-P7-M2-${suffix}`;

    // Create test users
    await setupUsers([
      {
        mobile_number: jeMobile,
        role: 'je',
        is_active: true,
        display_name: `Test JE ${suffix}`
      },
      {
        mobile_number: zoMobile1,
        role: 'zo',
        is_active: true,
        display_name: `Test ZO 1 ${suffix}`
      },
      {
        mobile_number: zoMobile2,
        role: 'zo',
        is_active: true,
        display_name: `Test ZO 2 ${suffix}`
      },
      {
        mobile_number: adminMobile,
        role: 'admin',
        is_active: true,
        display_name: `Test Admin ${suffix}`
      },
      {
        mobile_number: fakeJeMobile,
        role: 'ho', // NOT a JE role
        is_active: true,
        display_name: `Fake JE ${suffix}`
      }
    ]);

    // Create a project/work order owned by ZO 1
    const { error: projectErr } = await supabase
      .from('projects_master')
      .insert([
        {
          work_order_no: workOrderNo,
          estimate_no: `EST-M2-${suffix}`,
          site_details: `Site Details M2-${suffix}`,
          zo_user_id: zoMobile1,
          state: 'State',
          district: 'District',
          zone: 'Zone',
          department: 'Dept',
          created_by: adminMobile,
          edited_by: adminMobile,
          work_order_value: 500000.00
        }
      ]);

    if (projectErr) {
      throw new Error(`Failed to set up test project: ${projectErr.message}`);
    }
  });

  afterAll(async () => {
    // Clean up created records in reverse order
    await supabase.from('work_order_mappings').delete().eq('work_order_no', workOrderNo);
    await supabase.from('je_zo_mappings').delete().eq('assigned_by', adminMobile);
    await supabase.from('projects_master').delete().eq('work_order_no', workOrderNo);
    await supabase.from('authorised_users').delete().in('mobile_number', [jeMobile, zoMobile1, zoMobile2, adminMobile, fakeJeMobile]);
  });

  test('M2-TC-01: Successfully creates user mapping as Admin/HO', async () => {
    const req = {
      user: { mobile_number: adminMobile, role: 'admin' },
      body: {
        je_mobile_number: jeMobile,
        zo_mobile_number: zoMobile1
      }
    };
    const res = mockRes();
    await createOrUpdateUserMapping(req, res);

    expect(res.statusCode).toBe(201);
    expect(res.jsonData.success).toBe(true);
    expect(res.jsonData.mapping).toBeDefined();
    expect(res.jsonData.mapping.je_user_id).toBe(jeMobile);
    expect(res.jsonData.mapping.zo_user_id).toBe(zoMobile1);
    expect(res.jsonData.mapping.is_active).toBe(true);
  });

  test('M2-TC-02: Rejects mapping setup if JE is not a Junior Engineer role', async () => {
    const req = {
      user: { mobile_number: adminMobile, role: 'admin' },
      body: {
        je_mobile_number: fakeJeMobile, // role is ho
        zo_mobile_number: zoMobile1
      }
    };
    const res = mockRes();
    await createOrUpdateUserMapping(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.jsonData.success).toBe(false);
    expect(res.jsonData.message).toContain('is not a Junior Engineer');
  });

  test('M2-TC-03: Rejects mapping setup if ZO is not a Zonal Office role', async () => {
    const req = {
      user: { mobile_number: adminMobile, role: 'admin' },
      body: {
        je_mobile_number: jeMobile,
        zo_mobile_number: jeMobile // role is je
      }
    };
    const res = mockRes();
    await createOrUpdateUserMapping(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.jsonData.success).toBe(false);
    expect(res.jsonData.message).toContain('is not a Zonal Office user');
  });

  test('M2-TC-04: Blocks JE transfer when JE has requisitions in Pending or Hold status', async () => {
    // 1. Create a dummy requisition for this JE in 'Pending' status
    const reqId = crypto.randomUUID();
    const { error: reqErr } = await supabase
      .from('requisitions')
      .insert([
        {
          requisition_id: reqId,
          work_order_no: workOrderNo,
          estimate_no: `EST-M2-${suffix}`,
          requisition_no: `REQ-M2-${suffix}`,
          material_main_head: 'CEMENT',
          requisition_pdf_url: `http://example.com/req-${suffix}.pdf`,
          requisition_amount: 1000.00,
          gst_bill: 'No',
          bank_details: 'Mock Bank',
          requisition_status: 'Pending',
          requester_user_id: jeMobile,
          created_by: jeMobile,
          state: 'State',
          district: 'District',
          area_code: 'Zone',
          department: 'Dept',
          site_details: `Site Details M2-${suffix}`
        }
      ]);
    expect(reqErr).toBeNull();

    // 2. Attempt transfer to zoMobile2
    const reqTransfer = {
      user: { mobile_number: adminMobile, role: 'admin' },
      body: {
        je_mobile_number: jeMobile,
        zo_mobile_number: zoMobile2
      }
    };
    const resTransfer = mockRes();
    await createOrUpdateUserMapping(reqTransfer, resTransfer);

    expect(resTransfer.statusCode).toBe(400);
    expect(resTransfer.jsonData.success).toBe(false);
    expect(resTransfer.jsonData.message).toContain('Cannot transfer JE. Uncompleted requisitions remain.');

    // 3. Clean up requisition by updating status to 'Cancelled' (prohibits hard deletes)
    const { error: cancelErr } = await supabase
      .from('requisitions')
      .update({ requisition_status: 'Cancelled' })
      .eq('requisition_id', reqId);
    expect(cancelErr).toBeNull();
  });

  test('M2-TC-05: Successful transfer deactivates old mapping and deallocates work orders', async () => {
    // 2. Assign JE to the project under ZO 1 (enforces consistency)
    const { error: woMapErr } = await supabase
      .from('work_order_mappings')
      .insert([
        {
          work_order_no: workOrderNo,
          je_user_id: jeMobile,
          is_active: true,
          reason: 'Assigned',
          assigned_by: adminMobile
        }
      ]);
    expect(woMapErr).toBeNull();

    // 3. Perform transfer to zoMobile2 (since no pending/hold requisitions exist)
    const reqTransfer = {
      user: { mobile_number: adminMobile, role: 'admin' },
      body: {
        je_mobile_number: jeMobile,
        zo_mobile_number: zoMobile2
      }
    };
    const resTransfer = mockRes();
    await createOrUpdateUserMapping(reqTransfer, resTransfer);

    expect(resTransfer.statusCode).toBe(201);
    expect(resTransfer.jsonData.success).toBe(true);

    // 4. Verify old mapping is deactivated
    const { data: mappings, error: fetchErr } = await supabase
      .from('je_zo_mappings')
      .select('*')
      .eq('je_user_id', jeMobile)
      .order('assigned_at', { ascending: true });

    expect(fetchErr).toBeNull();
    expect(mappings.length).toBe(2);
    expect(mappings[0].zo_user_id).toBe(zoMobile1);
    expect(mappings[0].is_active).toBe(false);
    expect(mappings[0].deactivated_by).toBe(adminMobile);

    expect(mappings[1].zo_user_id).toBe(zoMobile2);
    expect(mappings[1].is_active).toBe(true);

    // 5. Verify work order mapping on ZO 1 project was deactivated
    const { data: woMap, error: woFetchErr } = await supabase
      .from('work_order_mappings')
      .select('*')
      .eq('work_order_no', workOrderNo)
      .eq('je_user_id', jeMobile)
      .single();

    expect(woFetchErr).toBeNull();
    expect(woMap.is_active).toBe(false);
    expect(woMap.reason).toBe('Transferred');
    expect(woMap.deactivated_by).toBe(adminMobile);
  });

  test('M2-TC-06: Listing user mappings filters appropriately', async () => {
    // 1. List as Admin/HO
    const reqAdmin = {
      user: { mobile_number: adminMobile, role: 'admin' }
    };
    const resAdmin = mockRes();
    await getUserMappings(reqAdmin, resAdmin);

    expect(resAdmin.statusCode).toBe(200);
    expect(resAdmin.jsonData.success).toBe(true);
    expect(resAdmin.jsonData.mappings.length).toBeGreaterThan(0);

    // 2. List as ZO 1 (should only see mappings matching zoMobile1)
    const reqZo = {
      user: { mobile_number: zoMobile1, role: 'zo' }
    };
    const resZo = mockRes();
    await getUserMappings(reqZo, resZo);

    expect(resZo.statusCode).toBe(200);
    expect(resZo.jsonData.success).toBe(true);
    resZo.jsonData.mappings.forEach(m => {
      expect(m.zo_user_id).toBe(zoMobile1);
    });
  });
});
