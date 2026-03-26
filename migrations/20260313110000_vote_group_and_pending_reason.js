/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .alterTable("games", (table) => {
      table.string("voteGroup");
    })
    .alterTable("game_votes", (table) => {
      table.string("voteGroup");
      table.string("pendingReason");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .alterTable("game_votes", (table) => {
      table.dropColumn("pendingReason");
      table.dropColumn("voteGroup");
    })
    .alterTable("games", (table) => {
      table.dropColumn("voteGroup");
    });
};
