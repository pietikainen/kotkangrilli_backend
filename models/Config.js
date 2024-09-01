const { Model } = require('objection');

class Config extends Model {
    static get tableName() {
        return 'config';
    }

    static get keyColumn() {
        return 'key';
    }

    static get valueColumn() {
        return 'value';
    }
}

module.exports = Config;