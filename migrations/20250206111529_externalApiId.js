/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.alterTable('votes', table => {
    table.integer('externalApiId');
  });

  // Migrate data from games table to votes.externalApiId
  const votes = await knex('votes').select('*');

  for (const vote of votes) {
    const game = await knex('games').where({ id: vote.gameId }).first();
    if (game) {
      await knex('votes').where({ id: vote.id }).update({
        externalApiId: game.externalApiId,
      });
    } else {
      console.warn(`Game not found for vote with gameId: ${vote.gameId}`);
    }
  }

  await knex.schema.alterTable('votes', table => {
    table.dropColumn('gameId');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.alterTable('votes', table => {
    table.integer('gameId').notNullable().references('id').inTable('games');
    table.dropColumn('externalApiId');
  });

  //Revert the data migration
  const votes = await knex('votes').select('*');

  for (const vote of votes) {
    const game = await knex('games').where({ externalApiId: vote.externalApiId }).first();
    if (game) {
      await knex('votes').where({ id: vote.id }).update({
        gameId: game.id,
      });
    } else {
      console.warn(`Game not found for vote with externalApiId: ${vote.externalApiId}`);
    }
  }
};
