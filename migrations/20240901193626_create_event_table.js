/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('events', (table) => {
    table.increments('id').primary();
    table.string('title').notNullable();
    table.string('description');
    table.integer('location').unsigned().notNullable().references('id').inTable('locations');
    table.date('startDate').notNullable();
    table.date('endDate').notNullable();
    table.boolean('votingOpen').defaultTo(false);
    table.boolean('active').defaultTo(false);
    table.integer('lanMaster').unsigned().references('id').inTable('users');
    table.integer('paintCompoWinner').unsigned().references('id').inTable('users');
    table.integer('organizer').unsigned().notNullable();

    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('events');
};
