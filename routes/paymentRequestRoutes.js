const express = require('express');
const router = express.Router();

const paymentRequestController = require('../controllers/paymentRequestController');

router.get('/me', paymentRequestController.getMyPaymentRequests);
router.get('/owned', paymentRequestController.getOwnedPaymentRequests);
router.get('/event/:eventId', paymentRequestController.getPaymentRequestsForEvent);
router.post('', paymentRequestController.createPaymentRequest);
router.patch('/assignments/:id/paid', paymentRequestController.setPaymentRequestRecipientPaid);

module.exports = router;
