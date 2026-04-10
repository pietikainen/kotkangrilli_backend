const { transaction } = require('objection');

const PaymentRequest = require('../models/PaymentRequest');
const PaymentRequestRecipient = require('../models/PaymentRequestRecipient');
const {
    PAYMENT_REQUEST_TYPES,
    createPaymentRequestWithRecipients
} = require('../services/paymentRequestService');

const VALID_TYPES = Object.values(PAYMENT_REQUEST_TYPES);
const VALID_PAID_LEVELS = [0, 1, 2];

exports.createPaymentRequest = async (req, res) => {
    const { type, eventId, sourceId, amount, comment, userIds } = req.body;
    const numericAmount = Number(amount);

    if (!VALID_TYPES.includes(type)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid payment request type'
        });
    }

    if (!Number.isInteger(numericAmount) || numericAmount === 0) {
        return res.status(400).json({
            success: false,
            message: 'Amount must be a non-zero integer'
        });
    }

    if (type === PAYMENT_REQUEST_TYPES.EVENT && !eventId) {
        return res.status(400).json({
            success: false,
            message: 'Event payment requests require eventId'
        });
    }

    if (type !== PAYMENT_REQUEST_TYPES.EVENT && !sourceId) {
        return res.status(400).json({
            success: false,
            message: 'Meal and ride payment requests require sourceId'
        });
    }

    if (numericAmount < 0 && (!Array.isArray(userIds) || userIds.length === 0)) {
        return res.status(400).json({
            success: false,
            message: 'Negative payment requests require explicit userIds'
        });
    }

    try {
        const result = await transaction(PaymentRequest.knex(), async (trx) => {
            return createPaymentRequestWithRecipients(trx, {
                type,
                eventId,
                sourceId,
                amount: numericAmount,
                comment,
                user: req.user,
                userIds
            });
        });

        if (result.status !== 201) {
            return res.status(result.status).json({
                success: false,
                message: result.message
            });
        }

        return res.status(201).json({
            success: true,
            data: {
                ...result.paymentRequest,
                recipientCount: result.recipientCount
            }
        });
    } catch (error) {
        console.log('error creating payment request', error.message);
        return res.status(500).json({
            success: false,
            message: 'Error creating payment request',
            error: error.message
        });
    }
};

exports.getPaymentRequestsForEvent = async (req, res) => {
    const { eventId } = req.params;

    try {
        const paymentRequests = await PaymentRequest.query()
            .where('eventId', eventId)
            .orderBy('created_at', 'asc');

        const paymentRequestIds = paymentRequests.map((paymentRequest) => paymentRequest.id);
        const recipients = paymentRequestIds.length === 0
            ? []
            : await PaymentRequestRecipient.query()
                .select(
                    'payment_request_recipients.*',
                    'users.username',
                    'users.nickname'
                )
                .join('users', 'users.id', 'payment_request_recipients.userId')
                .whereIn('paymentRequestId', paymentRequestIds)
                .orderBy('payment_request_recipients.id', 'asc');

        const data = paymentRequests.map((paymentRequest) => {
            const requestRecipients = recipients.filter((recipient) => recipient.paymentRequestId === paymentRequest.id);

            return {
                ...paymentRequest,
                recipients: requestRecipients,
                summary: {
                    recipientCount: requestRecipients.length,
                    unpaidCount: requestRecipients.filter((recipient) => recipient.paid === 0).length,
                    awaitingConfirmationCount: requestRecipients.filter((recipient) => recipient.paid === 1).length,
                    confirmedCount: requestRecipients.filter((recipient) => recipient.paid === 2).length
                }
            };
        });

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.log('error getting payment requests', error.message);
        return res.status(500).json({
            success: false,
            message: 'Error getting payment requests',
            error: error.message
        });
    }
};

exports.getMyPaymentRequests = async (req, res) => {
    try {
        const recipients = await PaymentRequestRecipient.query()
            .select(
                'payment_request_recipients.*',
                'payment_requests.eventId',
                'payment_requests.type',
                'payment_requests.sourceId',
                'payment_requests.amount',
                'payment_requests.comment',
                'payment_requests.createdBy',
                'event_owners.username as eventOwnerUsername',
                'event_owners.nickname as eventOwnerNickname',
                'event_owners.avatar as eventOwnerAvatar',
                'event_owners.snowflake as eventOwnerSnowflake',
                'meal_owners.username as mealOwnerUsername',
                'meal_owners.nickname as mealOwnerNickname',
                'meal_owners.avatar as mealOwnerAvatar',
                'meal_owners.snowflake as mealOwnerSnowflake',
                'carpool_owners.username as carpoolOwnerUsername',
                'carpool_owners.nickname as carpoolOwnerNickname',
                'carpool_owners.avatar as carpoolOwnerAvatar',
                'carpool_owners.snowflake as carpoolOwnerSnowflake',
                'meals.name as mealName',
                'carpools.departureCity as carpoolDepartureCity'
            )
            .join('payment_requests', 'payment_requests.id', 'payment_request_recipients.paymentRequestId')
            .join('events', 'events.id', 'payment_requests.eventId')
            .leftJoin('meals', (joinBuilder) => {
                joinBuilder.on('meals.id', '=', 'payment_requests.sourceId')
                    .andOnVal('payment_requests.type', '=', PAYMENT_REQUEST_TYPES.MEAL);
            })
            .leftJoin('carpools', (joinBuilder) => {
                joinBuilder.on('carpools.id', '=', 'payment_requests.sourceId')
                    .andOnVal('payment_requests.type', '=', PAYMENT_REQUEST_TYPES.RIDE);
            })
            .leftJoin('users as event_owners', 'event_owners.id', 'events.organizer')
            .leftJoin('users as meal_owners', 'meal_owners.id', 'meals.chefId')
            .leftJoin('users as carpool_owners', 'carpool_owners.id', 'carpools.driverId')
            .where('payment_request_recipients.userId', req.user.id)
            .orderBy('payment_requests.created_at', 'asc');

        return res.status(200).json({
            success: true,
            data: {
                assignments: recipients
            }
        });
    } catch (error) {
        console.log('error getting own payment requests', error.message);
        return res.status(500).json({
            success: false,
            message: 'Error getting own payment requests',
            error: error.message
        });
    }
};

exports.getOwnedPaymentRequests = async (req, res) => {
    try {
        const recipients = await PaymentRequestRecipient.query()
            .select(
                'payment_request_recipients.*',
                'payment_requests.eventId',
                'payment_requests.type',
                'payment_requests.sourceId',
                'payment_requests.amount',
                'payment_requests.comment',
                'payment_requests.createdBy',
                'users.username',
                'users.nickname',
                'users.avatar',
                'users.snowflake',
                'meals.name as mealName',
                'carpools.departureCity as carpoolDepartureCity'
            )
            .join('payment_requests', 'payment_requests.id', 'payment_request_recipients.paymentRequestId')
            .join('users', 'users.id', 'payment_request_recipients.userId')
            .join('events', 'events.id', 'payment_requests.eventId')
            .leftJoin('meals', (joinBuilder) => {
                joinBuilder.on('meals.id', '=', 'payment_requests.sourceId')
                    .andOnVal('payment_requests.type', '=', PAYMENT_REQUEST_TYPES.MEAL);
            })
            .leftJoin('carpools', (joinBuilder) => {
                joinBuilder.on('carpools.id', '=', 'payment_requests.sourceId')
                    .andOnVal('payment_requests.type', '=', PAYMENT_REQUEST_TYPES.RIDE);
            })
            .where((builder) => {
                builder.where((eventQuery) => {
                    eventQuery.where('payment_requests.type', PAYMENT_REQUEST_TYPES.EVENT)
                        .andWhere('events.organizer', req.user.id);
                })
                    .orWhere((mealQuery) => {
                        mealQuery.where('payment_requests.type', PAYMENT_REQUEST_TYPES.MEAL)
                            .andWhere('meals.chefId', req.user.id);
                    })
                    .orWhere((rideQuery) => {
                        rideQuery.where('payment_requests.type', PAYMENT_REQUEST_TYPES.RIDE)
                            .andWhere('carpools.driverId', req.user.id);
                    });
            })
            .orderBy('payment_requests.created_at', 'asc')
            .orderBy('payment_request_recipients.id', 'asc');

        return res.status(200).json({
            success: true,
            data: {
                assignments: recipients
            }
        });
    } catch (error) {
        console.log('error getting owned payment requests', error.message);
        return res.status(500).json({
            success: false,
            message: 'Error getting owned payment requests',
            error: error.message
        });
    }
};

exports.setPaymentRequestRecipientPaid = async (req, res) => {
    const { id } = req.params;
    const { paidLevel } = req.body;
    const numericPaidLevel = Number(paidLevel);

    if (!VALID_PAID_LEVELS.includes(numericPaidLevel)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid paidLevel'
        });
    }

    try {
        const recipient = await PaymentRequestRecipient.query()
            .select('payment_request_recipients.*', 'payment_requests.createdBy')
            .join('payment_requests', 'payment_requests.id', 'payment_request_recipients.paymentRequestId')
            .where('payment_request_recipients.id', id)
            .first();

        if (!recipient) {
            return res.status(404).json({
                success: false,
                message: 'Payment recipient not found'
            });
        }

        const isAdmin = req.user.userlevel >= 8;
        const isOwner = recipient.userId === req.user.id;
        const isCreator = recipient.createdBy === req.user.id;

        if (!isAdmin && !isOwner && !isCreator) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden'
            });
        }

        if (!isAdmin && !isCreator && (numericPaidLevel === 2 || recipient.paid === 2)) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden'
            });
        }

        const updated = await PaymentRequestRecipient.query()
            .patchAndFetchById(id, { paid: numericPaidLevel });

        return res.status(200).json({
            success: true,
            data: updated
        });
    } catch (error) {
        console.log('error updating payment request recipient', error.message);
        return res.status(500).json({
            success: false,
            message: 'Error updating payment request recipient',
            error: error.message
        });
    }
};
