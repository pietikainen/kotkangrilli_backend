// Carpool.js

const { Model } = require('objection');

class Carpool extends Model {
    static get tableName() {
        return 'carpools';
    }

    static get relationMappings() {
        const User = require('./User');
        return {
            user: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: "carpools.driverId",
                    to: "users.id",
                },

            },
            event: {
                relation: Model.BelongsToOneRelation,
                modelClass: Event,
                join: {
                    from: "carpools.eventId",
                    to: "events.id"
                }
            }
        }
    }
}

module.exports = Carpool;