/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('winner_games', (table) => {
    table.increments('id').primary();
    table.integer('eventId').unsigned().notNullable().references('id').inTable('events');
    table.integer('votes_amount').unsigned().notNullable();
    table.integer('externalApiId').unsigned().notNullable();
    table.string('title').notNullable();
    table.string('image');
    table.integer('price').unsigned();
    table.string('link');
    table.string('store');
    table.integer('players').unsigned();
    table.boolean('isLan');
    table.integer('submittedBy').unsigned().notNullable().references('id').inTable('users');
    table.text('description');
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('winner_games');
};
