// Eater.js

const { Model } = require('objection');

class Eater extends Model {
    static get tableName() {
        return "eaters";
    }

    static get relationMappings() {
        const User = require("./User");
        return {
            user:  {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: "eaters.eaterId",
                    to: "users.id",
                }
            }
        }
    }
}

module.exports = Eater;