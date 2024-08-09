// models/Game.js
const { Model } = require('objection');

class Game extends Model {
  static get tableName() {
    return 'games';
  }

  static get relationMappings() {
    const User = require('./User');

    return {
      submittedByUser: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'games.submittedBy',
          to: 'users.id'
        }
      }
    };
  }

  $parseDatabaseJson(json) {
    json = super.$parseDatabaseJson(json);
    return {
      ...json,
      submittedBy: json.submittedBy
    };
  }

  $formatDatabaseJson(json) {
    json = super.$formatDatabaseJson(json);
    return {
      ...json,
      submittedBy: json.submittedBy
    };
  }
}

module.exports = Game;