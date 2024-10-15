// models/Memo.js

const { Model } = require('objection');

class Memo extends Model {
    static get tableName() {
        return 'memo';
    }
}

module.exports = Memo;