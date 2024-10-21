// eaterController

const Eater = require('../models/Eater');
const Meal = require('../models/Meal');

// POST: Add eater to meal
exports.postEater = async (req, res) => {
    const mealId = req.params.mealId;
    const eaterId = req.user.id;

    try {
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
    const mealId = req.params.mealId;
    const eaterId = req.params.eaterId;

    try {
        const meal = await Meal.query()
          .select('chefId')
          .where('id', mealId).first();

        if (eaterId !== req.user.id && meal.chefId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Forbidden"
            })
        }

        const deleteEater = await Eater.query().deleteById(eaterId)

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
        console.log("error response data: ", error.response ? error.response.data : null)
        return res.status(500).json({
            success: false,
            message: 'Error deleting Eater',
            error: error.response ? error.response.data : null
        })
    }
}

// PATCH: Set meal paid for eater
// (default: 0, eater: 1, chefConfirmed: 2)
exports.setPaid = async (req, res) => {
    const mealId = req.params.mealId;
    const eaterId = req.params.eaterId;
    const paidLevel = req.params.paidLevel;

    try {
        const meal = await Meal.query()
          .select('chefId')
          .where('id', mealId).first();

        if (meal.chefId !== req.user.id && paidLevel === 2) {
            return res.status(403).json({
                success: false,
                message: "Forbidden"
            })
        }

        const setPaid = await Eater.query().patch({
            paid: paidLevel
        })
            .findById(eaterId);

        if (!setPaid) {
            return res.status(404).json({
                success: false,
                message: "eater not found"
            })
        } else {
            return res.status(200).json({
                success: true,
                data: {
                    eaterId: eaterId,
                    paidLevel: paidLevel
                }
            })
        }
    } catch (error) {
            console.log("error updating Eater", error.message);
            res.status(500).json({
                success: false,
                message: "Error updating eater",
                error: error.message
            })
        }
}
