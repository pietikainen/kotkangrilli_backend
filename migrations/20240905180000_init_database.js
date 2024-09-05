/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable('users', (table) => {
      table.increments('id').primary();
      table.bigInteger('snowflake').unique().notNullable();
      table.string('username').unique().notNullable();
      table.string('nickname');
      table.string('avatar');
      table.string('email');
      table.string('phone');
      table.string('bankaccount');
      table.integer('userlevel').notNullable();
      table.timestamps(true, true);
    })
    .createTable('games', (table) => {
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
    })
    .createTable('config', (table) => {
      table.increments('id').primary();
      table.string('key').unique().notNullable();
      table.string('value').notNullable();
      table.timestamps(true, true);
    })
    .createTable('locations', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('address').notNullable();
      table.string('city').notNullable();
      table.integer('capacity').unsigned().notNullable();
      table.string('description');
      table.timestamps(true, true);
    })
    .createTable('events', (table) => {
      table.increments('id').primary();
      table.string('title').notNullable();
      table.string('description');
      table.integer('location').unsigned().notNullable().references('id').inTable('locations');
      table.date('startDate').notNullable();
      table.date('endDate').notNullable();
      table.integer('winnerGamesCount').defaultTo(4);
      table.boolean('votingOpen').defaultTo(false);
      table.boolean('active').defaultTo(false);
      table.integer('lanMaster').unsigned().references('id').inTable('users');
      table.integer('paintCompoWinner').unsigned().references('id').inTable('users');
      table.integer('organizer').unsigned().notNullable();
      table.timestamps(true, true);
    })
    .createTable('meals', (table) => {
      table.increments('id');
      table.integer('eventId').unsigned().notNullable().references('id').inTable('events');
      table.integer('chefId').unsigned().notNullable().references('id').inTable('users');
      table.string('name').notNullable();
      table.text('description');
      table.integer('price').unsigned().notNullable();
      table.boolean('mobilepay').defaultTo(false);
      table.boolean('banktransfer').defaultTo(false);
      table.timestamps(true, true);
    })
    .createTable('eaters', (table) => {
      table.increments('id').primary();
      table.integer('eaterId').unsigned().notNullable().references('id').inTable('users');
      table.integer('mealId').unsigned().notNullable().references('id').inTable('meals');
      table.integer('paid').unsigned().defaultTo(0);
      table.timestamps(true, true);
    })
    .createTable('carpools', (table) => {
      table.increments('id').primary();
      table.integer('eventId').unsigned().notNullable().references('id').inTable('events');
      table.integer('driverId').unsigned().notNullable().references('id').inTable('users');
      table.integer('seats').unsigned().notNullable();
      table.string('departureCity').notNullable();
      table.date('departureTime').notNullable();
      table.timestamps(true, true);
    })
    .createTable('passengers', (table) => {
      table.increments('id').primary();
      table.integer('passengerId').unsigned().notNullable().references('id').inTable('users');
      table.integer('carpoolId').unsigned().notNullable().references('id').inTable('carpools');
      table.timestamps(true, true);
    })
    .createTable('votes', (table) => {
      table.increments('id').primary();
      table.integer('eventId').unsigned().notNullable().references('id').inTable('events');
      table.integer('userId').unsigned().notNullable().references('id').inTable('users');
      table.integer('gameId').unsigned().notNullable().references('id').inTable('games');
      table.timestamps(true, true);
      })
      .createTable('winner_games', (table) => {
        table.increments('id').primary();
        table.integer('eventId').unsigned().notNullable().references('id').inTable('events');
        table.integer('votes_amount').unsigned().notNullable();
        table.integer('externalApiId').unsigned().notNullable();
        table.string('title').notNullable();
        table.string('image');
        table.integer('price').unsigned();
        table.string('link');
        table.string('store');
        table.integer('players').unsigned();
        table.boolean('isLan');
        table.integer('submittedBy').unsigned().notNullable().references('id').inTable('users');
        table.text('description');
        table.timestamps(true, true);
      })
      .createTable('participations', (table) => {
        table.increments('id').primary();
        table.integer('eventId').unsigned().notNullable().references('id').inTable('events');
        table.integer('userId').unsigned().notNullable().references('id').inTable('users');
        table.timestamp('arrivalDate');
        table.timestamps(true, true);
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .dropTable('users')
    .dropTable('games')
    .dropTable('config')
    .dropTable('locations')
    .dropTable('events')
    .dropTable('meals')
    .dropTable('eaters')
    .dropTable('carpools')
    .dropTable('passengers')
    .dropTable('votes')
    .dropTable('winner_games')
    .dropTable('participations');
};
