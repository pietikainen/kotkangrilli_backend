/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('payment_requests', function (table) {
      table.increments('id').primary();
      table.integer('eventId').unsigned().notNullable().references('id').inTable('events').onDelete('CASCADE');
      table.string('type').notNullable();
      table.integer('sourceId').unsigned().nullable();
      table.integer('createdBy').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.integer('amount').notNullable();
      table.text('comment').nullable();
      table.timestamps(true, true);

      table.index(['eventId']);
      table.index(['type', 'sourceId']);
    })
    .createTable('payment_request_recipients', function (table) {
      table.increments('id').primary();
      table.integer('paymentRequestId').unsigned().notNullable().references('id').inTable('payment_requests').onDelete('CASCADE');
      table.integer('userId').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.integer('paid').unsigned().notNullable().defaultTo(0);
      table.timestamp('cancelledAt').nullable();
      table.integer('cancelledBy').unsigned().nullable().references('id').inTable('users').onDelete('SET NULL');
      table.timestamps(true, true);

      table.unique(['paymentRequestId', 'userId']);
      table.index(['userId', 'paid']);
    })
    .then(async () => {
      const eventPaymentSources = await knex('participations')
        .join('events', 'events.id', 'participations.eventId')
        .select(
          'participations.eventId',
          'events.organizer as createdBy'
        )
        .whereNotNull('participations.paid')
        .groupBy('participations.eventId', 'events.organizer');

      for (const source of eventPaymentSources) {
        const paymentRequest = await knex('payment_requests')
          .insert({
            eventId: source.eventId,
            type: 'event',
            sourceId: null,
            createdBy: source.createdBy,
            amount: 0,
            comment: 'Maksu vanhasta järjestelmästä',
            created_at: knex.fn.now(),
            updated_at: knex.fn.now()
          })
          .returning(['id']);

        const paymentRequestId = paymentRequest[0].id ?? paymentRequest[0];

        const recipients = await knex('participations')
          .select('userId')
          .max('paid as paid')
          .where('eventId', source.eventId)
          .whereNotNull('paid')
          .groupBy('userId');

        if (recipients.length > 0) {
          await knex('payment_request_recipients').insert(
            recipients.map((recipient) => ({
              paymentRequestId,
              userId: recipient.userId,
              paid: recipient.paid,
              created_at: knex.fn.now(),
              updated_at: knex.fn.now()
            }))
          );
        }
      }

      const mealPaymentSources = await knex('eaters')
        .join('meals', 'meals.id', 'eaters.mealId')
        .select(
          'meals.id as sourceId',
          'meals.eventId',
          'meals.chefId as createdBy',
          'meals.price as amount'
        )
        .whereNotNull('eaters.paid')
        .groupBy('meals.id', 'meals.eventId', 'meals.chefId', 'meals.price');

      for (const source of mealPaymentSources) {
        const paymentRequest = await knex('payment_requests')
          .insert({
            eventId: source.eventId,
            type: 'meal',
            sourceId: source.sourceId,
            createdBy: source.createdBy,
            amount: source.amount,
            comment: 'Maksu vanhasta järjestelmästä',
            created_at: knex.fn.now(),
            updated_at: knex.fn.now()
          })
          .returning(['id']);

        const paymentRequestId = paymentRequest[0].id ?? paymentRequest[0];

        const recipients = await knex('eaters')
          .select('eaterId as userId')
          .max('paid as paid')
          .where('mealId', source.sourceId)
          .whereNotNull('paid')
          .groupBy('eaterId');

        if (recipients.length > 0) {
          await knex('payment_request_recipients').insert(
            recipients.map((recipient) => ({
              paymentRequestId,
              userId: recipient.userId,
              paid: recipient.paid,
              created_at: knex.fn.now(),
              updated_at: knex.fn.now()
            }))
          );
        }
      }
    })
    .then(() =>
      knex.schema
        .alterTable('participations', (table) => {
          table.dropColumn('paid');
        })
        .alterTable('eaters', (table) => {
          table.dropColumn('paid');
        }),
    );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .alterTable('participations', (table) => {
      table.integer('paid').defaultTo(0);
    })
    .alterTable('eaters', (table) => {
      table.integer('paid').unsigned().defaultTo(0);
    })
    .then(async () => {
      await knex('participations')
        .update({
          paid: knex.raw(`
            COALESCE((
              SELECT MAX(prr.paid)
              FROM payment_request_recipients prr
              JOIN payment_requests pr ON pr.id = prr."paymentRequestId"
              WHERE pr.type = 'event'
                AND pr."eventId" = participations."eventId"
                AND prr."userId" = participations."userId"
            ), 0)
          `)
        });

      await knex('eaters')
        .update({
          paid: knex.raw(`
            COALESCE((
              SELECT MAX(prr.paid)
              FROM payment_request_recipients prr
              JOIN payment_requests pr ON pr.id = prr."paymentRequestId"
              WHERE pr.type = 'meal'
                AND pr."sourceId" = eaters."mealId"
                AND prr."userId" = eaters."eaterId"
            ), 0)
          `)
        });
    })
    .dropTable('payment_request_recipients')
    .dropTable('payment_requests');
};
