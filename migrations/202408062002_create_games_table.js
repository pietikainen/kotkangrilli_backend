exports.up = function(knex) {
    return knex.schema.createTable('games', (table) => {
      table.increments('id').primary();
      table.integer('gameExternalApiId').notNullable();
      table.string('gameName').unique().notNullable();
      table.integer('gamePrice').notNullable();
      table.string('gameStore').notNullable();
      table.text('gameDescription');
      table.string('gameLink');
      table.integer('gamePlayers').notNullable();
      table.boolean('gameIsLan').notNullable();
      table.integer('gameSubmittedBy').references('id').inTable('users').notNullable();
      table.timestamps(true, true);
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('games');
  };
  