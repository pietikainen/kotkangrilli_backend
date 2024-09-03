// locationRoutes.js

const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

router.get('/', locationController.getAllLocations);
router.post('/', locationController.addLocation);
router.patch('/:locationId', locationController.updateLocation);
router.get('/:locationId', locationController.getLocationById);
router.delete('/:locationId', locationController.deleteLocation);

module.exports = router;