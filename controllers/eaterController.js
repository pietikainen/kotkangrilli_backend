// eaterController

const Eater = require('../models/Eater');
const Meal = require('../models/Meal');
const { transaction } = require('objection');
const {
    PAYMENT_REQUEST_TYPES,
    syncUserToPaymentRequests,
    clearOrCancelUserPaymentRequests,
    hasPaymentRequests
} = require('../services/paymentRequestService');

// POST: Add eater to meal
exports.postEater = async (req, res) => {
    const mealId = req.params.mealId;
    const eaterId = req.user.id;
    const { comment } = req.body;

    try {
        const meal = await Meal.query()
            .select('eventId', 'chefId', 'signupEnd', 'requiresComment')
            .where('id', mealId).first()

        if (!meal) {
            return res.status(404).json({
                success: false,
                message: 'Meal not found'
            });
        }

        const isAdmin = req.user.userlevel >= 8;
        const isChef = meal.chefId === req.user.id;

        if (!isAdmin && !isChef && meal.signupEnd && meal.signupEnd <= new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Meal signup has ended'
            });
        }

        if (meal.requiresComment && (!comment || String(comment).trim().length === 0)) {
            return res.status(400).json({
                success: false,
                message: 'Comment is required for this meal'
            });
        }

        const addEater = await transaction(Eater.knex(), async (trx) => {
            const insertedEater = await Eater.query(trx)
                .insert({
                    eaterId,
                    mealId,
                    comment: comment ?? null
                });

            await syncUserToPaymentRequests(trx, {
                type: PAYMENT_REQUEST_TYPES.MEAL,
                eventId: meal.eventId,
                sourceId: Number(mealId),
                userId: eaterId
            });

            return insertedEater;
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
            .where('mealId', mealId).orderBy('id')

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
          .select('chefId', 'signupEnd', 'eventId')
          .where('id', eater.mealId).first();

        const isAdmin = req.user.userlevel >= 8;
        const isChef = meal.chefId === req.user.id;
        const isSelf = eater.eaterId === req.user.id;

        if (!isAdmin && !isChef && !isSelf) {
            return res.status(403).json({
                success: false,
                message: "Forbidden"
            })
        }

        const hasPaymentRequestsForMeal = await hasPaymentRequests(null, {
            type: PAYMENT_REQUEST_TYPES.MEAL,
            eventId: meal.eventId,
            sourceId: eater.mealId
        });

        if (hasPaymentRequestsForMeal && !isAdmin) {
            return res.status(400).json({
                success: false,
                message: 'Meal signup cannot be cancelled because payment requests exist for this meal'
            });
        }

        if (!isAdmin && meal.chefId !== req.user.id && meal.signupEnd && meal.signupEnd <= new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Meal signup has ended'
            });
        }

        const deleteEater = await transaction(Eater.knex(), async (trx) => {
            await clearOrCancelUserPaymentRequests(trx, {
                type: PAYMENT_REQUEST_TYPES.MEAL,
                eventId: meal.eventId,
                sourceId: eater.mealId,
                userId: eater.eaterId,
                cancelledBy: req.user.id
            });

            return Eater.query(trx).deleteById(id);
        })

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

// PATCH: Update eater comment (allowed until signupEnd for eater; chef may edit anytime)
exports.setComment = async (req, res) => {
    const { id } = req.params;
    const { comment } = req.body;

    try {
        const eater = await Eater.query().findById(id);
        if (!eater) {
            return res.status(404).json({ success: false, message: 'Eater not found' });
        }

        const meal = await Meal.query()
          .select('chefId', 'signupEnd', 'requiresComment')
          .where('id', eater.mealId).first();

        const isChef = meal.chefId === req.user.id;
        const isSelf = eater.eaterId === req.user.id;
        if (!isChef && !isSelf) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        if (!isChef && meal.signupEnd && meal.signupEnd <= new Date()) {
            return res.status(400).json({ success: false, message: 'Meal signup has ended' });
        }

        if (meal.requiresComment && (!comment || String(comment).trim().length === 0)) {
            return res.status(400).json({ success: false, message: 'Comment is required for this meal' });
        }

        const updated = await Eater.query().patchAndFetchById(id, { comment: comment ?? null });
        return res.status(200).json({ success: true, data: updated });
    } catch (error) {
        console.log('error updating eater comment', error.message);
        return res.status(500).json({ success: false, message: 'Error updating eater comment', error: error.message });
    }
}
