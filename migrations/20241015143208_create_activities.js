/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('activities', (table) => {
    table.increments('id').primary();
    table.integer('eventId').unsigned().notNullable().references('id').inTable('events');
    table.string('title').notNullable();
    table.datetime('startDate').notNullable();
    table.datetime('endDate').notNullable();
    table.string('color').notNullable();
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('activities');
};
