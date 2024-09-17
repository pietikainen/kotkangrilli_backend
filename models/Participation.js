// models/Participation.js

const { Model } = require('objection');

class Participation extends Model {
    static get tableName() {
        return 'participations';
    }
    
    static get relationMappings() {
        const User = require('./User');
        const Event = require('./Event');
        return {
        user: {
            relation: Model.BelongsToOneRelation,
            modelClass: User,
            join: {
            from: 'participations.userId',
            to: 'users.id',
            },
        },
        event: {
            relation: Model.BelongsToOneRelation,
            modelClass: Event,
            join: {
            from: 'participations.eventId',
            to: 'events.id',
            },
        },
        };
    }
}

module.exports = Participation;