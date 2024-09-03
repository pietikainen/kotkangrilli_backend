/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('eaters', (table) => {
    table.increments('id').primary();
    table.integer('eaterId').unsigned().notNullable().references('id').inTable('users');
    table.integer('mealId').unsigned().notNullable().references('id').inTable('meals');
    table.integer('paid').unsigned().defaultTo(0);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('eaters');
  
};
