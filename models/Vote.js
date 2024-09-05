const { Model } = require("objection");

class Vote extends Model {
    static get tableName() {
        return "votes";
    }

    static get relationMappings() {
        const User = require("./User");
        const Game = require("./Game");
        const Event = require("./Event");
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
            },

            event: {
                relation: Model.BelongsToOneRelation,
                modelClass: Event,
                join: {
                    from: "votes.eventId",
                    to: "events.id",
                }
            }
        };
    }
}

module.exports = Vote;