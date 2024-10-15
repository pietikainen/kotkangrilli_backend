const { Model } = require('objection');
const Event = require("./Event");

class Activity extends Model {
    static get tableName() {
        return 'activities';
    }

    static get relationMappings() {
        return {
            event: {
                relation: Model.BelongsToOneRelation,
                modelClass: Event,
                join: {
                    from: 'activities.eventId',
                    to: 'events.id',
                },
            },
        };
    }
}

module.exports = Activity;
