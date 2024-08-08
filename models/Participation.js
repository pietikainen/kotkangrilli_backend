// models/Participation.js

const { Model } = require('objection');

class Participation extends Model {
    static get tableName() {
        return 'event_participants';
    }
    
    static get relationMappings() {
        const User = require('./User');
        const Event = require('./Event');
        return {
        user: {
            relation: Model.BelongsToOneRelation,
            modelClass: User,
            join: {
            from: 'event_participants.userId',
            to: 'users.id',
            },
        },
        event: {
            relation: Model.BelongsToOneRelation,
            modelClass: Event,
            join: {
            from: 'event_participants.eventId',
            to: 'events.id',
            },
        },
        };
    }
    }