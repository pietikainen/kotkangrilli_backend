/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('locations', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('address').notNullable();
        table.string('city').notNullable();
        table.integer('capacity').unsigned().notNullable();
        table.string('description');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('locations');
};
