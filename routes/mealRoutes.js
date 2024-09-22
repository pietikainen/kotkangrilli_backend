const express = require('express');
const router = express.Router();
const mealController = require('../controllers/mealController');

// POST: Insert meal into database
router.post('', mealController.addMeal);

// GET: Get meals per event ID
router.get('/:eventId', mealController.getMealsOnEvent)

// DELETE: Delete meal by meal ID
router.delete('/:mealId', mealController.deleteMeal);

// PUT: Update meal
router.put('/:mealId', mealController.updateMeal);

module.exports = router;