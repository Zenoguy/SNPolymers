import { describe, test, expect, beforeAll, afterAll } from 'vitest';
const crypto = require('crypto');
const { supabase } = require('../../../src/db/supabase');
const setupUsers = require('../../helpers/setupUsers');

describe('Milestone P7-M1 — Database Schema Foundation Tests', () => {
  let suffix;
  let jeMobile;
  let zoMobile;
  let adminMobile;
  let fakeJeMobile; // user who has role other than 'je'
  let workOrderNo;

  beforeAll(async () => {
    suffix = crypto.randomUUID().substring(0, 8);
    jeMobile = `9001${suffix}`;
    zoMobile = `9002${suffix}`;
    adminMobile = `9003${suffix}`;
    fakeJeMobile = `9004${suffix}`;
    workOrderNo = `WO-P7-M1-${suffix}`;

    // Create test users
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

    // Create a project/work order for test mapping validation
    const { error: projectErr } = await supabase
      .from('projects_master')
      .insert([
        {
          work_order_no: workOrderNo,
          estimate_no: `EST-${suffix}`,
          site_details: `Site Details ${suffix}`,
          zo_user_id: zoMobile,
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
    await supabase.from('zo_balances').delete().eq('zo_user_id', zoMobile);
    await supabase.from('projects_master').delete().eq('work_order_no', workOrderNo);
    await supabase.from('authorised_users').delete().in('mobile_number', [jeMobile, zoMobile, adminMobile, fakeJeMobile]);
  });

  test('M1-TC-01: All 5 new tables exist in schema', async () => {
    const newTables = ['je_zo_mappings', 'work_order_mappings', 'zo_balances', 'zo_fund_ledger', 'excess_fund_returns'];
    for (const table of newTables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(0);
      expect(error).toBeNull();
      expect(data).toBeDefined();
    }
  });

  test('M1-TC-02: Negative available balance rejected by DB constraint', async () => {
    const { error } = await supabase
      .from('zo_balances')
      .update({ available_balance: -50.00 })
      .eq('zo_user_id', zoMobile);
    
    expect(error).not.toBeNull();
    expect(error.message).toContain('chk_zo_balance_positive');
  });

  test('M1-TC-03: ZO auto-balance row initializes on ZO user creation', async () => {
    const tempZoMobile = `9005${crypto.randomUUID().substring(0, 8)}`;
    // Clean up just in case
    await supabase.from('zo_balances').delete().eq('zo_user_id', tempZoMobile);
    await supabase.from('authorised_users').delete().eq('mobile_number', tempZoMobile);

    const { error: userErr } = await supabase
      .from('authorised_users')
      .insert([
        {
          mobile_number: tempZoMobile,
          role: 'zo',
          is_active: true,
          display_name: `Temp ZO`
        }
      ]);
    expect(userErr).toBeNull();

    // Verify balance was automatically initialized
    const { data: balanceData, error: balanceErr } = await supabase
      .from('zo_balances')
      .select('*')
      .eq('zo_user_id', tempZoMobile)
      .single();

    expect(balanceErr).toBeNull();
    expect(balanceData).toBeDefined();
    expect(Number(balanceData.available_balance)).toBe(0.00);

    // Clean up temp ZO
    await supabase.from('zo_balances').delete().eq('zo_user_id', tempZoMobile);
    await supabase.from('authorised_users').delete().eq('mobile_number', tempZoMobile);
  });

  test('M1-TC-04: User Mapping role guard rejects wrong JE role', async () => {
    const { error } = await supabase
      .from('je_zo_mappings')
      .insert([
        {
          je_user_id: fakeJeMobile, // role is 'ho'
          zo_user_id: zoMobile,
          assigned_by: adminMobile
        }
      ]);

    expect(error).not.toBeNull();
    expect(error.message).toContain('is not a Junior Engineer');
  });

  test('M1-TC-05: User Mapping role guard rejects wrong ZO role', async () => {
    const { error } = await supabase
      .from('je_zo_mappings')
      .insert([
        {
          je_user_id: jeMobile,
          zo_user_id: jeMobile, // role is 'je', not 'zo'
          assigned_by: adminMobile
        }
      ]);

    expect(error).not.toBeNull();
    expect(error.message).toContain('is not a Zonal Office user');
  });

  test('M1-TC-06: User Mapping enforces unique active mapping per JE', async () => {
    // Insert first mapping
    const { error: err1 } = await supabase
      .from('je_zo_mappings')
      .insert([
        {
          je_user_id: jeMobile,
          zo_user_id: zoMobile,
          is_active: true,
          assigned_by: adminMobile
        }
      ]);
    expect(err1).toBeNull();

    // Attempt second active mapping for same JE
    const { error: err2 } = await supabase
      .from('je_zo_mappings')
      .insert([
        {
          je_user_id: jeMobile,
          zo_user_id: zoMobile,
          is_active: true,
          assigned_by: adminMobile
        }
      ]);

    expect(err2).not.toBeNull();
    // Unique index active mapping violation
    expect(err2.code).toBe('23505');
  });

  test('M1-TC-07: Work Order assignment enforces unique active assignment per JE + WO', async () => {
    // Insert first assignment
    const { error: err1 } = await supabase
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
    expect(err1).toBeNull();

    // Attempt second assignment for same WO and JE
    const { error: err2 } = await supabase
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

    expect(err2).not.toBeNull();
    expect(err2.code).toBe('23505');
  });

  test('M1-TC-08: Zonal fund ledger prevents duplicate postings on reference', async () => {
    const referenceId = crypto.randomUUID();
    const ledgerRow = {
      zo_user_id: zoMobile,
      transaction_type: 'ALLOCATION',
      reference_type: 'FUND_REQUEST',
      reference_id: referenceId,
      amount: 1000.00,
      work_order_no: workOrderNo,
      created_by: adminMobile
    };

    const { error: err1 } = await supabase
      .from('zo_fund_ledger')
      .insert([ledgerRow]);
    expect(err1).toBeNull();

    const { error: err2 } = await supabase
      .from('zo_fund_ledger')
      .insert([ledgerRow]);
    
    expect(err2).not.toBeNull();
    expect(err2.code).toBe('23505');

    // Cleanup ledger
    await supabase.from('zo_fund_ledger').delete().eq('reference_id', referenceId);
  });

  test('M1-TC-09: zo_user_id column is present in projects_master', async () => {
    const { data, error } = await supabase
      .from('projects_master')
      .select('zo_user_id')
      .eq('work_order_no', workOrderNo)
      .single();

    expect(error).toBeNull();
    expect(data.zo_user_id).toBe(zoMobile);
  });

  test('M1-TC-10: zo_user_id column is present in requisitions and daily_progress_reports', async () => {
    const { error: errReq } = await supabase
      .from('requisitions')
      .select('zo_user_id')
      .limit(0);
    expect(errReq).toBeNull();

    const { error: errDpr } = await supabase
      .from('daily_progress_reports')
      .select('zo_user_id')
      .limit(0);
    expect(errDpr).toBeNull();
  });

  test('M1-TC-11: work_order_no column is present in fund_requests', async () => {
    const { error } = await supabase
      .from('fund_requests')
      .select('work_order_no')
      .limit(0);
    expect(error).toBeNull();
  });

  test('M1-TC-12: Audit triggers execute and log to audit_log table', async () => {
    // Check if the insert in setup / earlier tests triggered audit log records
    const { data, error } = await supabase
      .from('audit_log')
      .select('*')
      .eq('module_name', 'je_zo_mappings')
      .eq('user_id', adminMobile)
      .limit(1);

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.length).toBeGreaterThan(0);
    expect(data[0].action).toBe('INSERT');
  });
});
