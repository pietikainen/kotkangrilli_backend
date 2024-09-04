// locationController.js

const Location = require('../models/Location');


exports.getAllLocations = async (req, res) => {
    console.log("received GET request to /api/locations");
    try {
        const locations = await Location.query();
        res.status(200).json({
            success: true,
            data: locations
        });
    } catch (error) {
        console.log("error getting locations", error.message);
        res.status(500).json({
            success: false,
            message: 'Error getting locations',
            error: error.message
        });
    }
}

exports.addLocation = async (req, res) => {
    console.log("received POST request to /api/locations");
    const { name, description, address, city, capacity, price } = req.body;

    try {
        const newLocation = await Location.query().insert({
            name,
            description,
            address, // tarvisko tähän vielä lisätä postinumero?
            city,
            capacity,
            price
        });
        res.status(201).json({
            success: true,
            data: newLocation
        });
    } catch (error) {
        console.log("error adding location", error.message);
        res.status(500).json({
            success: false,
            message: 'Error adding location',
            error: error.message
        });
    }
}

exports.deleteLocation = async (req, res) => {
    console.log("received DELETE request to /api/locations/:locationId");
    const locationId = req.params.locationId;

    try {
        const location = await Location.query().findById(locationId);
        if (!location) {
            return res.status(404).json({
                success: false,
                message: 'Location not found'
            });
        }
        await Location.query().deleteById(locationId);
        res.status(200).json({
            success: true,
            message: 'Location deleted'
        });

    } catch (error) {
        console.log("error deleting location", error.message);
        res.status(500).json({
            success: false,
            message: 'Error deleting location',
            error: error.message
        });
    }
}

exports.updateLocation = async (req, res) => {
    console.log("received PUT request to /api/locations/:locationId");
    const locationId = req.params.locationId;
    const { locationName, locationDescription, locationAddress, locationCity, locationCapacity } = req.body;

    try {
        const updatedLocation = await Location.query().updateAndFetchById(locationId, {
            name: locationName,
            description: locationDescription,
            address: locationAddress,
            city: locationCity,
            capacity: locationCapacity
        });

        res.status(200).json({
            success: true,
            data: updatedLocation
        });
    } catch (error) {
        console.log("error updating location", error.message);
        res.status(500).json({
            success: false,
            message: 'Error updating location',
            error: error.message
        });
    }
}

exports.getLocationById = async (req, res) => {
    console.log("received GET request to /api/locations/:locationId");
    const locationId = req.params.locationId;

    try {
        const location = await Location.query().findById(locationId);
        if (!location) {
            return res.status(404).json({
                success: false,
                message: 'Location not found'
            });
        }
        res.status(200).json({
            success: true,
            data: location
        });
    } catch (error) {
        console.log("error getting location", error.message);
        res.status(500).json({
            success: false,
            message: 'Error getting location',
            error: error.message
        });
    }
}