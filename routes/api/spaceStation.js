const express = require('express');
const router = express.Router();
const spaceStationController = require('../../controllers/spaceStationController');

router.route('/save')
    .get(spaceStationController.fetchAndStoreSpaceStation)

router.route('/get')
    .get(spaceStationController.getSpaceStation)

module.exports = router;