const express = require('express');
const {
  createOrUpdateUserMapping,
  getUserMappings
} = require('../controllers/userMappings.controller');
const verifyJwt = require('../middleware/verifyJwt');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

router.use(verifyJwt);

// Route registration
router.post(
  '/',
  requireRole(['admin', 'ho']),
  createOrUpdateUserMapping
);

router.get(
  '/',
  requireRole(['admin', 'ho', 'zo']),
  getUserMappings
);

module.exports = router;
