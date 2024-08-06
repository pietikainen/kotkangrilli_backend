// models/Game.js
const { Model } = require('objection');

class Game extends Model {
  static get tableName() {
    return 'games';
  }

  static get relationMappings() {
    const User = require('./User');

    return {
      submittedBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'games.gameSubmittedBy',
          to: 'users.id'
        }
      }
    };
  }
}

module.exports = Game;
