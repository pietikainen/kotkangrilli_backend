/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.alterTable('meals', (table) => {
    table.boolean('requiresComment').notNullable().defaultTo(false);
  });

  await knex.schema.alterTable('eaters', (table) => {
    table.text('comment'); // nullable by default
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.alterTable('eaters', (table) => {
    table.dropColumn('comment');
  });

  await knex.schema.alterTable('meals', (table) => {
    table.dropColumn('requiresComment');
  });
};
