/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.table('events', (table) => {
    table.integer('votingState').defaultTo(0);
  });

  await knex('events').update('votingState', knex.raw('CASE WHEN "votingOpen" = true THEN 1 ELSE 0 END'));

  await knex.schema.table('events', (table) => {
    table.dropColumn('votingOpen');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.table('events', (table) => {
    table.boolean('votingOpen').defaultTo(false);
  });

  await knex('events').update('votingOpen', knex.raw('CASE WHEN "votingState" = 0 THEN false ELSE true END'));

  await knex.schema.table('events', (table) => {
    table.dropColumn('votingState');
  });
};
