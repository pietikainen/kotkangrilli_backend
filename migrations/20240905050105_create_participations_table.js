/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('participations', (table) => {
    table.increments('id').primary();
    table.integer('eventId').unsigned().notNullable().references('id').inTable('events');
    table.integer('userId').unsigned().notNullable().references('id').inTable('users');
    table.timestamp('arrivalDate');
    table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('participations');
};
