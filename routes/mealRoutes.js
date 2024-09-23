const express = require('express');
const router = express.Router();
const mealController = require('../controllers/mealController');
const Meal = require("../models/Meal");
const { createAsyncCheck, or, isAdmin} = require("../middleware/authMiddleware");

const isChef = createAsyncCheck(async (req) => {
    const mealId = req.params.mealId;
    const meal = await Meal.query().findById(mealId);
    return meal && meal.chefId === req.user.id;
});

// POST: Insert meal into database
router.post('', mealController.addMeal);

// GET: Get meals per event ID
router.get('/:eventId', mealController.getMealsOnEvent)

// DELETE: Delete meal by meal ID
router.delete('/:mealId', or(isChef, isAdmin), mealController.deleteMeal);

// PUT: Update meal
router.put('/:mealId', or(isChef, isAdmin), mealController.updateMeal);

module.exports = router;
