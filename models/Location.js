// Location.js

const { Model } = require('objection');

class Location extends Model {
    static get tableName() {
        return 'locations';
    }

    static get relationMappings() {
        const Event = require('./Event');

        return {
            event: {
                relation: Model.HasManyRelation,
                modelClass: Event,
                join: {
                    from: 'locations.id',
                    to: 'events.location',
                }
            }
        }
    };
}

module.exports = Location;