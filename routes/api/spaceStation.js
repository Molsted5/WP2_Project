const express = require('express');
const router = express.Router();
const spaceStationController = require('../../controllers/spaceStationController');

router.route('/save')
    .get(spaceStationController.fetchAndStoreApod)

router.route('/get')
    .get(spaceStationController.getApod)

module.exports = router;