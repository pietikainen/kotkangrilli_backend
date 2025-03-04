// eaterController

const Eater = require('../models/Eater');
const Meal = require('../models/Meal');

// POST: Add eater to meal
exports.postEater = async (req, res) => {
    const mealId = req.params.mealId;
    const eaterId = req.user.id;

    try {
        const meal = await Meal.query()
            .select('chefId', 'signupEnd')
            .where('id', mealId).first()

        if (meal.chefId !== req.user.id && meal.signupEnd <= new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Meal signup has ended'
            });
        }

        const addEater = await Eater.query()
            .insert({
                eaterId,
                mealId
            });

        if (!addEater) {
            return res.status(400).json({
                success: false,
                message: 'Error creating Eater'
            })
        } else {
            return res.status(201).json({
                success: true,
                data: addEater
            })
        }

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            success: false,
            message: 'Error creating Eater',
            error: error.response ? error.response.data : null
        })
    }
}

// GET: Eaters per meal ID

exports.getEaters = async (req, res) => {
    const mealId = req.params.mealId;

    try {
        const eaters = await Eater.query()
            .where('mealId', mealId)

        if (!eaters) {
            return res.status(404).json({
                success: false,
                message: "Error: No eaters found"
            })
        } else {
            return res.status(200).json({
                success: true,
                data: eaters
            })
        }
    } catch (error) {
        console.log("error getting eaters", error.message);
        res.status(500).json({
            success: false,
            message: 'Error getting eaters',
            error: error.response ? error.response.data : null
        })
    }
}

// DELETE: Delete eater from meal
exports.deleteEater = async (req, res) => {
    const { id } = req.params;

    try {
        const eater = await Eater.query().findById(id);

        if (!eater) {
            return res.status(404).json({
                success: false,
                message: "Eater not found"
            })
        }

        const meal = await Meal.query()
          .select('chefId', 'signupEnd')
          .where('id', eater.mealId).first();

        if (meal.chefId !== req.user.id && meal.signupEnd <= new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Meal signup has ended'
            });
        }

        if (eater.eaterId !== req.user.id && meal.chefId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Forbidden"
            })
        }

        const deleteEater = await Eater.query().deleteById(id)

        if (!deleteEater) {
            return res.status(404).json({
                success: false,
                message: "Error: Eater not found"
            })
        } else {
            return res.status(200).json({
                success: true,
                message: "Eater deleted"
            })
        }
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            success: false,
            message: 'Error deleting Eater',
            error: error.message
        })
    }
}

// PATCH: Set meal paid for eater
// (default: 0, eater: 1, chefConfirmed: 2)
exports.setPaid = async (req, res) => {
    const { id } = req.params;
    const { paidLevel } = req.body;

    try {
        const eater = await Eater.query().findById(id);

        if (!eater) {
            return res.status(404).json({
                success: false,
                message: "Eater not found"
            })
        }

        const meal = await Meal.query()
          .select('chefId')
          .where('id', eater.mealId).first();

        if (eater.eaterId !== req.user.id && meal.chefId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Forbidden"
            })
        }

        if (meal.chefId !== req.user.id && (paidLevel === 2 || eater.paid === 2)) {
            return res.status(403).json({
                success: false,
                message: "Forbidden"
            })
        }

        const updateEater = await Eater.query()
          .patchAndFetchById(id, { paid: paidLevel });

        return res.status(200).json({
            success: true,
            data: updateEater
        })
    } catch (error) {
            console.log("error updating Eater", error.message);
            res.status(500).json({
                success: false,
                message: "Error updating eater",
                error: error.message
            })
        }
}
