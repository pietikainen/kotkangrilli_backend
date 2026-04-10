const { Model } = require('objection');

class PaymentRequest extends Model {
    static get tableName() {
        return 'payment_requests';
    }
}

module.exports = PaymentRequest;
