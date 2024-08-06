const { Model } = require("objection");

class Vote extends Model {
    static get tableName() {
        return "votes";
    }

    static get relationMappings() {
        const User = require("./User");
        const Game = require("./Game");
        return {
            user: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: "votes.userId",
                    to: "users.id",
                }
            },
            game: {
                relation: Model.BelongsToOneRelation,
                modelClass: Game,
                join: {
                    from: "votes.gameId",
                    to: "games.id",
                }
            }
        };
    }
}