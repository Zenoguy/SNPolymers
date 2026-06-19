const express = require('express');
const { getMasterDataVersion, getMasterDataCatalog } = require('../controllers/masterData.controller');
const verifyJwt = require('../middleware/verifyJwt');

const router = express.Router();

// Guard all master data catalog routes with JWT verification
router.use(verifyJwt);

router.get('/version', getMasterDataVersion);
router.get('/catalog', getMasterDataCatalog);

module.exports = router;
