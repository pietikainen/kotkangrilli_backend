/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('game_votes', table => {
    table.increments('id').primary();
    table.integer('eventId').notNullable().references('id').inTable('events');
    table.integer('voting_round').notNullable().defaultTo(1);
    table.integer('externalApiId').notNullable();
    table.string('title').notNullable();
    table.string('image');
    table.integer('price');
    table.string('link');
    table.string('store');
    table.integer('players');
    table.boolean('isLan');
    table.integer('submittedBy').notNullable().references('id').inTable('users');
    table.text('description');
    table.integer('votes_amount').notNullable().defaultTo(0);
    table.boolean('is_winner').notNullable().defaultTo(false);
    table.boolean('finalized').notNullable().defaultTo(false);
    table.timestamps(true, true);
    table.unique(['eventId', 'voting_round', 'externalApiId']);
  }).alterTable('votes', table => {
    table.integer('voting_round').notNullable().defaultTo(1);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('game_votes').alterTable('votes', table => {
    table.dropColumn('voting_round');
  });
};
