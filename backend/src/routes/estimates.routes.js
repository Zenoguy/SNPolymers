const express = require('express');
const {
  getEstimates,
  getEstimateById,
  createEstimate,
  saveDraftItems
} = require('../controllers/estimates.controller');
const verifyJwt = require('../middleware/verifyJwt');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

router.use(verifyJwt);

// Read endpoints
router.get('/', getEstimates);
router.get('/:id', getEstimateById);

// Write endpoints for JE / Staff / Admin
const jeRoles = ['je', 'staff', 'admin'];
router.post('/', requireRole(jeRoles), createEstimate);
router.put('/:id/items', requireRole(jeRoles), saveDraftItems);

module.exports = router;
