/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('passengers', (table) => {
        table.increments('id').primary();
        table.integer('passengerId').unsigned().notNullable().references('id').inTable('users');
        table.integer('carpoolId').unsigned().notNullable().references('id').inTable('carpools');
        table.timestamps(true, true);  
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('passengers');
};
