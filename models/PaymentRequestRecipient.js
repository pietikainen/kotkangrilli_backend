const { Model } = require('objection');

class PaymentRequestRecipient extends Model {
    static get tableName() {
        return 'payment_request_recipients';
    }
}

module.exports = PaymentRequestRecipient;
