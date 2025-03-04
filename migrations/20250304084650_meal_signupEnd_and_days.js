/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.alterTable('meals', function (table) {
    table.datetime('signupEnd');
    table.specificType('days', 'INTEGER[]');
  });

  const meals = await knex('meals').select('*');
  const events = await knex('events').select('*');

  for (const meal of meals) {
    const event = events.find(e => e.id === meal.eventId);
    if (event) {
      await knex('meals').where({ id: meal.id }).update({
        signupEnd: event.startDate,
        days: [],
      });
    } else {
      console.log(`Event not found for meal with id: ${meal.id}`);
    }
  }

  await knex.schema.alterTable('meals', function (table) {
    table.datetime('signupEnd').notNullable().alter();
    table.specificType('days', 'INTEGER[]').notNullable().defaultTo(knex.raw("'{}'::INTEGER[]")).alter();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('meals', function (table) {
    table.dropColumn('signupEnd');
    table.dropColumn('days');
  });
};
