/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
      .alterTable('events', table => {
      table.timestamp('startDate').notNullable().alter();
      table.timestamp('endDate').notNullable().alter();
  })
      .alterTable('carpools', table => {
          table.timestamp('departureTime').notNullable().alter();
      })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
      .alterTable('events', table => {
          table.date('startDate').notNullable().alter();
          table.date('endDate').notNullable().alter();
      })
      .alterTable('carpools', table => {
          table.date('departureTime').notNullable().alter();
      })
};
