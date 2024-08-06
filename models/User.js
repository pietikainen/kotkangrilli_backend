// models/User.js
const { Model } = require('objection');

class User extends Model {
  static get tableName() {
    return 'users';
  }

  static get relationMappings() {
    const Event = require('./Event');
    const Game = require('./Game');
    const Vote = require('./Vote');

    return {
      events: {
        relation: Model.HasManyRelation,
        modelClass: Event,
        join: {
          from: 'users.id',
          to: 'events.userId'
        }
      },
      games: {
        relation: Model.HasManyRelation,
        modelClass: Game,
        join: {
          from: 'users.id',
          to: 'games.submitted_by'
        }
      },
      votes: {
        relation: Model.HasManyRelation,
        modelClass: Vote,
        join: {
          from: 'users.id',
          to: 'votes.userId'
        }
      }
    };
  }
}

module.exports = User;
