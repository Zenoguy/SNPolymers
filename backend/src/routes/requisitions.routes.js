const express = require('express');
const {
  createRequisition,
  getRequisitions,
  getRequisitionById,
  actOnRequisition,
  cancelRequisition
} = require('../controllers/requisitions.controller');
const verifyJwt = require('../middleware/verifyJwt');
const requireRole = require('../middleware/requireRole');
const validateRequest = require('../middleware/validateRequest');
const {
  createRequisitionSchema,
  actOnRequisitionSchema,
  cancelRequisitionSchema
} = require('../validation/requisition.schema');

const router = express.Router();

router.use(verifyJwt);

const readerRoles = ['je', 'zo', 'ho', 'admin'];
const requesterRoles = ['je', 'admin'];
const approverRoles = ['zo', 'ho', 'admin'];

// Read endpoints
router.get('/', requireRole(readerRoles), getRequisitions);
router.get('/:id', requireRole(readerRoles), getRequisitionById);

// Create endpoint
router.post('/', requireRole(requesterRoles), validateRequest(createRequisitionSchema), createRequisition);

// Workflow endpoints
router.patch('/:id/action', requireRole(approverRoles), validateRequest(actOnRequisitionSchema), actOnRequisition);
router.patch('/:id/cancel', requireRole(requesterRoles), validateRequest(cancelRequisitionSchema), cancelRequisition);

module.exports = router;
