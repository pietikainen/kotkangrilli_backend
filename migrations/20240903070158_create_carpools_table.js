/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('carpools', (table) => {
    table.increments('id').primary();
    table.integer('eventId').unsigned().notNullable().references('id').inTable('events');
    table.integer('driverId').unsigned().notNullable().references('id').inTable('users');
    table.integer('seats').unsigned().notNullable();
    table.string('departureCity').notNullable();
    table.date('departureTime').notNullable();
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('carpools');
};
