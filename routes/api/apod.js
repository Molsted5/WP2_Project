const express = require('express');
const router = express.Router();
const apodController = require('../../controllers/apodController');

router.route('/save')
    .get(apodController.fetchAndStoreApod)

router.route('/get')
    .get(apodController.getApod)

module.exports = router;