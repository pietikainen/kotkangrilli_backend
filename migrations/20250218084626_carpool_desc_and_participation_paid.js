/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('participations', function (table) {
    table.integer('paid').defaultTo(0);
  }).alterTable('carpools', function (table) {
    table.string('description').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('participations', function (table) {
    table.dropColumn('paid');
  }).alterTable('carpools', function (table) {
    table.dropColumn('description');
  });
};
