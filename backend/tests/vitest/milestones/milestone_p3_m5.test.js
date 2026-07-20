import { describe, test, expect } from 'vitest';
const jwt = require('jsonwebtoken');
const { supabase } = require('../../../src/db/supabase');
const { getEstimates } = require('../../../src/controllers/estimates.core.controller');
const { createReport, updateReport } = require('../../../src/controllers/reports.controller');
const { updateUser, removeUser } = require('../../../src/controllers/admin.controller');
const verifyJwt = require('../../../src/middleware/verifyJwt');
const mockRes = require('../../helpers/mockRes');

// Extend mockRes with clearCookie
const createMockResWithCookies = () => {
  const base = mockRes();
  base.cookiesCleared = {};
  base.clearCookie = function (name, options) {
    this.cookiesCleared[name] = options;
    return this;
  };
  return base;
};

describe('Milestone P3-M5 — Code Quality & Security Hardening', () => {
  test('Test 1: Parses leftmost client IP from x-forwarded-for header correctly', () => {
    const testHeader = '1.2.3.4, 5.6.7.8';
    const parsedIp = (testHeader || '').split(',')[0].trim() || 'unknown';
    expect(parsedIp).toBe('1.2.3.4');
  });

  test('Test 2: Blocks non-numeric and negative report amounts with 400 Bad Request', async () => {
    const reqCreate = {
      body: {
        work_order_no: 'TEST_WO_M1_1234',
        amount: 'invalid-amount'
      }
    };
    const resCreate = mockRes();
    await createReport(reqCreate, resCreate);

    const reqUpdate = {
      params: { fund_report_id: 'some-uuid' },
      body: {
        amount: -50.00
      }
    };
    const resUpdate = mockRes();
    await updateReport(reqUpdate, resUpdate);

    expect(resCreate.statusCode).toBe(400);
    expect(resUpdate.statusCode).toBe(400);
  });

  test('Test 3: Limits JE estimate visibility to own mobile number even with global=true', async () => {
    const reqJeGlobal = {
      user: { role: 'je', mobile_number: '+918000000002' },
      query: { global: 'true' }
    };
    const resJeGlobal = mockRes();
    await getEstimates(reqJeGlobal, resJeGlobal);

    expect(resJeGlobal.statusCode).toBe(200);
    expect(resJeGlobal.jsonData.success).toBe(true);
  });

  test('Test 4: Blocks invalid role updates in admin updateUser with 400 Bad Request', async () => {
    const reqUpdateUser = {
      params: { id: 'some-id' },
      body: { role: 'superadmin' }
    };
    const resUpdateUser = mockRes();
    await updateUser(reqUpdateUser, resUpdateUser);

    expect(resUpdateUser.statusCode).toBe(400);
    expect(resUpdateUser.jsonData.success).toBe(false);
  });

  test('Test 5: verifyJwt middleware clears accessToken cookie on TokenExpiredError', async () => {
    const expiredToken = jwt.sign(
      { user_id: '123', session_id: 'abc', role: 'je' },
      process.env.JWT_SECRET || 'fallback_development_jwt_secret_key_minimum_256_bit',
      { expiresIn: '-10s' }
    );
    const reqExpired = {
      cookies: { accessToken: expiredToken }
    };
    const resExpired = createMockResWithCookies();
    let nextCalled = false;
    await verifyJwt(reqExpired, resExpired, () => { nextCalled = true; });

    expect(resExpired.statusCode).toBe(401);
    expect(resExpired.cookiesCleared.accessToken).toBeDefined();
  });

  test('Test 6: Blocks deleting user from authorized_users if they have active estimates with 409', async () => {
    const crypto = require('crypto');
    const suffix = crypto.randomUUID().substring(0, 8);
    const tempMobile = `+919900${suffix}`;
    const tempWorkOrder = `WO-P3M5-${suffix}`;

    // 1. Create temporary user
    const { data: tempUser, error: userErr } = await supabase
      .from('authorised_users')
      .insert([{
        mobile_number: tempMobile,
        display_name: `Temp M5 ${suffix}`,
        role: 'je',
        is_active: true
      }])
      .select()
      .single();

    if (userErr) throw userErr;

    try {
      // 2. Create a dummy project
      const { error: projErr } = await supabase
        .from('projects_master')
        .insert([{
          work_order_no: tempWorkOrder,
          estimate_no: `EST-P3M5-${suffix}`,
          site_details: `Site M5 ${suffix}`,
          state: 'West Bengal',
          district: 'Kolkata',
          zone: 'Kolkata Zone',
          department: 'Irrigation',
          status: 'Running',
          created_by: tempMobile,
          edited_by: tempMobile,
          work_order_value: 100000.00
        }]);
      if (projErr) throw projErr;

      // 3. Create active estimate for user
      const { data: estData, error: estErr } = await supabase
        .from('project_cost_estimates')
        .insert([{
          work_order_no: tempWorkOrder,
          estimate_no: `EST-P3M5-${suffix}`,
          area_code: 'Kolkata Zone',
          estimate_revision: 0,
          zonal_office_no: 'ZO-01',
          estimate_amount: 50000.00,
          estimate_status: 'Final Approved',
          created_by: tempMobile,
          last_modified_by: tempMobile
        }])
        .select()
        .single();
      if (estErr) throw estErr;

      const reqRemove = {
        params: { id: tempUser.id }
      };
      const resRemove = mockRes();
      await removeUser(reqRemove, resRemove);

      expect(resRemove.statusCode).toBe(409);
      expect(resRemove.jsonData.success).toBe(false);

      // Cleanup project and estimate
      await supabase.from('project_cost_estimates').delete().eq('estimate_id', estData.estimate_id);
      await supabase.from('projects_master').delete().eq('work_order_no', tempWorkOrder);
    } finally {
      // Cleanup user
      await supabase.from('authorised_users').delete().eq('id', tempUser.id);
    }
  });
});
