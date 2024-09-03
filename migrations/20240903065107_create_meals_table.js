/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('meals', (table) => {
    table.increments('id');
    table.integer('eventId').unsigned().notNullable().references('id').inTable('events');
    table.integer('chefId').unsigned().notNullable().references('id').inTable('users');
    table.string('name').notNullable();
    table.text('description');
    table.integer('price').unsigned().notNullable();
    table.boolean('mobilepay').defaultTo(false);
    table.boolean('banktransfer').defaultTo(false);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('meals');
};
