// Meal.js

const { Model } = require('objection');

class Meal extends Model {
    static get tableName() {
        return 'meals';
    }

    static get relationMappings() {
        const User = require('./User');
        const Event = require('./Event');
        return {
            user: {
                relation: Model.HasManyRelation,
                modelClass: User,
                join: {
                    from: 'meals.chefId',
                    to: 'users.id',
                },
            },
            event: {
                relation: Model.BelongsToOneRelation,
                modelClass: Event,
                join: {
                    from: 'meals.chefId',
                    to: 'events.id',
                },
            },
        };
    }
}

module.exports = Meal;
