// models/GameVote.js
const { Model } = require("objection");

class GameVote extends Model {
  static get tableName() {
    return "game_votes";
  }

  static get relationMappings() {
    const User = require("./User");

    return {
      submittedByUser: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "game_votes.submittedBy",
          to: "users.id",
        },
      },
    };
  }

  $parseDatabaseJson(json) {
    json = super.$parseDatabaseJson(json);
    return {
      ...json,
      submittedBy: json.submittedBy,
    };
  }

  $formatDatabaseJson(json) {
    json = super.$formatDatabaseJson(json);
    return {
      ...json,
      submittedBy: json.submittedBy,
    };
  }
}

module.exports = GameVote;
