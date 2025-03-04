// controllers/mealController.js

const Meal = require('../models/Meal');

// POST: Add meal for event
exports.addMeal = async (req, res) => {
    const { eventId, name, description, price, mobilepay, banktransfer, signupEnd, days } = req.body;
    const chefId = req.user.id;

    try {
        const newMeal = await Meal.query().insert({
            eventId,
            chefId,
            name,
            description,
            price,
            mobilepay,
            banktransfer,
            signupEnd,
            days
        });

        res.status(201).json({
            success: true,
            data: newMeal
        });
    } catch (error) {
        console.log("Error adding Meal", error.message);
        res.status(500).json({
            success: false,
            message: 'Error adding meal',
        })
    }
}

// GET: Meals per event ID
exports.getMealsOnEvent = async (req, res) => {
    const eventId = req.params.eventId;

    try {
        const meals = await Meal.query().where('eventId', eventId);

        if (!meals) {
            return res.status(404).json({
                success: false,
                message: "Meals not found"
            })
        } else {
            return res.status(200).json({
                success: true,
                data: meals
            });
        }
    } catch (error) {
        console.log("error getting meals", error.message);
        res.status(500).json({
            success: false,
            message: 'Error getting meals',
            error: error.message
        })
    }
}

// PUT: Update the meal data
exports.updateMeal = async (req, res) => {
    const { eventId, name, description, price, mobilepay, banktransfer, signupEnd, days } = req.body;

    const mealId = req.params.mealId;
    const userId = req.user.id;

    try {
        const meal = await Meal.query()
            .select('id', 'chefId')
            .where('id', mealId)

        if (meal.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Meal not found"
            })
        }
        const updateMeal = await Meal.query().updateAndFetchById(mealId, {
            eventId,
            chefId: userId,
            name,
            description,
            price,
            mobilepay,
            banktransfer,
            signupEnd,
            days
        });

        if(!updateMeal) {
            return res.status(400).json({
                success: false,
                message: "Error updating meal",
            })
        } else {
            res.status(201).json({
                success: true,
                message: "Meal updated successfully",
                data: updateMeal
            })
        }

    } catch (error) {
        console.log("error: updating meal", error.message);
        return res.status(500).json({
            success: false,
            message: 'Error updating meal',
            error: error.message
        })
    }
}


// DELETE: Delete meal with Meal ID
exports.deleteMeal = async (req, res) => {
    const mealId = req.params.mealId;

    try {
        // Check if user is the original chef
        const meal = await Meal.query()
            .select('id', 'chefId')
            .where('id', mealId)

        if (meal.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Meal not found"
            })
        }

        const deleteMeal = await Meal.query()
            .deleteById(mealId);

        if (!deleteMeal) {
            return res.status(404).json({
                success: false,
                message: 'Error: Unable to delete'
            })
        } else {
            return res.status(200).json({
                success: true,
            })
        }
    } catch (error) {
        console.log("error deleting meal", error.message);
        res.status(500).json({
            success: false,
            message: 'Error deleting meal',
            error: error.message
        })
    }
}
