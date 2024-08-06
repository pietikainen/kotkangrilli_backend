const { Model } = require("objection");

class Event extends Model {

    static get tableName() {
        return "events";
    }

    static get relationMappings() {
        const User = require("./User");
        const Game = require("./Game");
        return {
            user: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: "events.userId",
                    to: "users.id",
                }
            },
            games: {
                relation: Model.ManyToManyRelation,
                modelClass: Game,
                join: {
                    from: "events.id",
                    through: {
                        from: "events_games.eventId",
                        to: "events_games.gameId",
                    },
                    to: "games.id",
                }
            }
        };
    }

}