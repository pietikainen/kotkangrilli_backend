/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('games', (table) => {
    table.increments('id').primary();
    table.integer('externalApiId').unique();
    table.string('title').notNullable();
    table.string('image');
    table.integer('price');
    table.string('link');
    table.string('store');
    table.integer('players');
    table.boolean('isLan').notNullable();
    table.integer('submittedBy').references('users.id').notNullable();
    table.string('description');
    table.timestamps(true, true);
});
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('games');
};
