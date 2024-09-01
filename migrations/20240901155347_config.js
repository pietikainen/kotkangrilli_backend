/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('config', (table) => {
        table.increments('id').primary();
        table.string('key').notNullable();
        table.string('value').notNullable();
        table.timestamps(true, true);
    });
    };

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
