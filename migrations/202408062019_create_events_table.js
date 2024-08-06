exports.up = function (knex) {
    return knex.schema.createTable('events', (table) => {
        table.increments('id').primary();
        table.string('eventTitle').notNullable();
        table.string('eventDescription');
        table.date('eventDate').notNullable();
        table.string('eventLocation').notNullable();
        table.integer('eventLanMaster').references('id').inTable('users');
        table.integer('eventPaintCompoWinner').references('id').inTable('users');
        table.integer('eventOrganizer').references('id').inTable('users').notNullable();
        table.timestamps(true, true);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('events');
};
