require('dotenv').config({ path: require('path').resolve(__dirname, '../backend/.env') });
const { getEstimates } = require('../backend/src/controllers/estimates.core.controller');
const mockRes = require('../backend/tests/helpers/mockRes');

async function testHO() {
  const reqUser = { mobile_number: '+919999999999', role: 'ho' };
  
  const resEst = mockRes();
  await getEstimates({ query: { status: 'Final Approved', limit: 1000 }, user: reqUser }, resEst);
  console.log('--- ESTIMATES API RESPONSE ---');
  console.log('Success:', resEst.jsonData.success);
  console.log('Count:', resEst.jsonData.estimates?.length);
  console.log('Returned estimates:', resEst.jsonData.estimates?.map(e => ({ work_order_no: e.work_order_no, status: e.estimate_status })));
}

testHO();
