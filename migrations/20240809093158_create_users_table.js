/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('users', (table) => {
      table.increments('id').primary();
      table.bigInteger('snowflake').unique().notNullable();
      table.string('username').unique().notNullable();
      table.string('nickname');
      table.string('avatar');
      table.string('email');
      table.integer('phone');
      table.string('bankaccount');
      table.integer('userlevel').notNullable();
      table.timestamps(true, true);
    });
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function(knex) {
    return knex.schema.dropTable('users');
  };