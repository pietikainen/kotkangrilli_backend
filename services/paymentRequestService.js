const Event = require('../models/Event');
const Meal = require('../models/Meal');
const Carpool = require('../models/Carpool');
const Participation = require('../models/Participation');
const Eater = require('../models/Eater');
const Passenger = require('../models/Passenger');
const PaymentRequest = require('../models/PaymentRequest');
const PaymentRequestRecipient = require('../models/PaymentRequestRecipient');

const PAYMENT_REQUEST_TYPES = {
    EVENT: 'event',
    MEAL: 'meal',
    RIDE: 'ride'
};

const normalizeUserIds = (userIds) => [...new Set((userIds ?? []).filter(Boolean))];

const getScopedSource = async (trx, type, eventId, sourceId) => {
    if (type === PAYMENT_REQUEST_TYPES.EVENT) {
        const event = await Event.query(trx).findById(eventId);

        if (!event) {
            return null;
        }

        return {
            eventId: event.id,
            sourceId: null,
            ownerId: event.organizer
        };
    }

    if (type === PAYMENT_REQUEST_TYPES.MEAL) {
        const meal = await Meal.query(trx)
            .select('id', 'eventId', 'chefId')
            .findById(sourceId);

        if (!meal) {
            return null;
        }

        if (eventId && Number(eventId) !== meal.eventId) {
            return { mismatch: true };
        }

        return {
            eventId: meal.eventId,
            sourceId: meal.id,
            ownerId: meal.chefId
        };
    }

    if (type === PAYMENT_REQUEST_TYPES.RIDE) {
        const carpool = await Carpool.query(trx)
            .select('id', 'eventId', 'driverId')
            .findById(sourceId);

        if (!carpool) {
            return null;
        }

        if (eventId && Number(eventId) !== carpool.eventId) {
            return { mismatch: true };
        }

        return {
            eventId: carpool.eventId,
            sourceId: carpool.id,
            ownerId: carpool.driverId
        };
    }

    return null;
};

const getRecipientUserIds = async (trx, type, eventId, sourceId) => {
    if (type === PAYMENT_REQUEST_TYPES.EVENT) {
        const participations = await Participation.query(trx)
            .select('userId')
            .where('eventId', eventId);

        return participations.map((participation) => participation.userId);
    }

    if (type === PAYMENT_REQUEST_TYPES.MEAL) {
        const eaters = await Eater.query(trx)
            .select('eaterId')
            .where('mealId', sourceId);

        return eaters.map((eater) => eater.eaterId);
    }

    if (type === PAYMENT_REQUEST_TYPES.RIDE) {
        const passengers = await Passenger.query(trx)
            .select('passengerId')
            .where('carpoolId', sourceId);

        return passengers.map((passenger) => passenger.passengerId);
    }

    return [];
};

const assignUsersToPaymentRequest = async (trx, paymentRequestId, userIds, paid = 0) => {
    const uniqueUserIds = normalizeUserIds(userIds);

    if (uniqueUserIds.length === 0) {
        return;
    }

    await PaymentRequestRecipient.query(trx)
        .insert(uniqueUserIds.map((userId) => ({
            paymentRequestId,
            userId,
            paid
        })))
        .onConflict(['paymentRequestId', 'userId'])
        .ignore();
};

const createPaymentRequestWithRecipients = async (trx, { type, eventId, sourceId, amount, comment, user, userIds }) => {
    const scopedSource = await getScopedSource(trx, type, eventId, sourceId);

    if (!scopedSource) {
        return { status: 404, message: 'Target not found' };
    }

    if (scopedSource.mismatch) {
        return { status: 400, message: 'Event and target do not match' };
    }

    const isAdmin = user && user.userlevel >= 8;
    if (!isAdmin && scopedSource.ownerId !== user.id) {
        return { status: 403, message: 'Forbidden' };
    }

    const eligibleRecipientUserIds = await getRecipientUserIds(
        trx,
        type,
        scopedSource.eventId,
        scopedSource.sourceId
    );

    const hasExplicitRecipients = Array.isArray(userIds);
    let recipientUserIds = hasExplicitRecipients ? normalizeUserIds(userIds) : eligibleRecipientUserIds;

    if (hasExplicitRecipients) {
        const eligibleRecipientSet = new Set(eligibleRecipientUserIds);
        const invalidUserIds = recipientUserIds.filter((recipientUserId) => !eligibleRecipientSet.has(recipientUserId));

        if (invalidUserIds.length > 0) {
            return {
                status: 400,
                message: 'Some userIds are not assigned to this event, meal, or ride'
            };
        }
    }

    const paymentRequest = await PaymentRequest.query(trx).insertAndFetch({
        eventId: scopedSource.eventId,
        type,
        sourceId: scopedSource.sourceId,
        createdBy: user.id,
        amount,
        comment: comment ?? null,
        syncNewRecipients: !hasExplicitRecipients
    });

    await assignUsersToPaymentRequest(
        trx,
        paymentRequest.id,
        recipientUserIds,
        amount < 0 ? 2 : 0
    );

    return {
        status: 201,
        paymentRequest,
        recipientCount: recipientUserIds.length
    };
};

const syncUserToPaymentRequests = async (trx, { type, eventId, sourceId, userId }) => {
    const paymentRequests = await PaymentRequest.query(trx)
        .select('id')
        .where({
            type,
            eventId,
            sourceId: sourceId ?? null,
            syncNewRecipients: true
        });

    if (paymentRequests.length === 0) {
        return;
    }

    await PaymentRequestRecipient.query(trx)
        .insert(paymentRequests.map((paymentRequest) => ({
            paymentRequestId: paymentRequest.id,
            userId
        })))
        .onConflict(['paymentRequestId', 'userId'])
        .merge({
            cancelledAt: null,
            cancelledBy: null
        });
};

const removeUserFromPaymentRequests = async (trx, { type, eventId, sourceId, userId }) => {
    const paymentRequests = await PaymentRequest.query(trx)
        .select('id')
        .where({
            type,
            eventId,
            sourceId: sourceId ?? null
        });

    if (paymentRequests.length === 0) {
        return;
    }

    await PaymentRequestRecipient.query(trx)
        .delete()
        .whereIn('paymentRequestId', paymentRequests.map((paymentRequest) => paymentRequest.id))
        .andWhere('userId', userId);
};

const hasPaymentRequestAssignments = async (trx, { type, eventId, sourceId, userId }) => {
    const assignment = await PaymentRequestRecipient.query(trx)
        .select('payment_request_recipients.id')
        .join('payment_requests', 'payment_requests.id', 'payment_request_recipients.paymentRequestId')
        .where('payment_request_recipients.userId', userId)
        .andWhere('payment_requests.type', type)
        .andWhere('payment_requests.eventId', eventId)
        .andWhere('payment_requests.sourceId', sourceId ?? null)
        .first();

    return Boolean(assignment);
};

const hasPaymentRequests = async (trx, { type, eventId, sourceId }) => {
    const paymentRequest = await PaymentRequest.query(trx)
        .select('id')
        .where({
            type,
            eventId,
            sourceId: sourceId ?? null
        })
        .first();

    return Boolean(paymentRequest);
};

const clearOrCancelUserPaymentRequests = async (trx, { type, eventId, sourceId, userId, cancelledBy }) => {
    const paymentRequests = await PaymentRequest.query(trx)
        .select('id')
        .where({
            type,
            eventId,
            sourceId: sourceId ?? null
        });

    if (paymentRequests.length === 0) {
        return;
    }

    const paymentRequestIds = paymentRequests.map((paymentRequest) => paymentRequest.id);

    await PaymentRequestRecipient.query(trx)
        .delete()
        .whereIn('paymentRequestId', paymentRequestIds)
        .andWhere('userId', userId)
        .andWhere('paid', 0);

    await PaymentRequestRecipient.query(trx)
        .patch({
            cancelledAt: new Date().toISOString(),
            cancelledBy
        })
        .whereIn('paymentRequestId', paymentRequestIds)
        .andWhere('userId', userId)
        .andWhere('paid', '>', 0)
        .andWhereNull('cancelledAt');
};

module.exports = {
    PAYMENT_REQUEST_TYPES,
    clearOrCancelUserPaymentRequests,
    createPaymentRequestWithRecipients,
    getScopedSource,
    hasPaymentRequests,
    hasPaymentRequestAssignments,
    removeUserFromPaymentRequests,
    syncUserToPaymentRequests
};
