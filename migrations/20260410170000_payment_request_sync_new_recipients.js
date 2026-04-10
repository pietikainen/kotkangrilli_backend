/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.alterTable('payment_requests', function (table) {
    table.boolean('syncNewRecipients').notNullable().defaultTo(true);
  });

  await knex('payment_requests')
    .where('amount', '<', 0)
    .update({
      syncNewRecipients: false,
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('payment_requests', function (table) {
    table.dropColumn('syncNewRecipients');
  });
};
