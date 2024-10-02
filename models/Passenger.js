// models/Passenger.js
const { Model } = require('objection');

class Passenger extends Model {
    static get tableName() {
        return 'passengers';
    }

    static get relationMappings() {
        const User = require('./User');
        const Carpool = require('./Carpool');

        return {
            user: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: "passengers.passengerId",
                    to: "users.id"
                }
            },

            carpool: {
                relation: Model.BelongsToOneRelation,
                modelClass: Carpool,
                join: {
                    from: "passengers.carpoolId",
                    to: "carpools.id"
                }
            }
        }
    }
}

module.exports = Passenger;