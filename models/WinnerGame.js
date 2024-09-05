// WinnerGame.js

const { Model } = require('objection');

class WinnerGame extends Model {
  static get tableName() {
    return 'winnerGames';
  }

  static get relationMappings() {
    const Game = require('./Game');
    const User = require('./User');

    return {
      game: {
        relation: Model.BelongsToOneRelation,
        modelClass: Game,
        join: {
          from: 'winnerGames.gameId',
          to: 'games.id'
        }
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'winnerGames.userId',
          to: 'users.id'
        }
      }
    };
  }
}