exports.up = function(knex) {
  return knex.schema.createTable('time_slots', function(table) {
    table.increments('id').primary();
    table.string('slot_name').notNullable(); // e.g., "Period 1", "Morning Slot 1"
    table.time('start_time').notNullable();
    table.time('end_time').notNullable();
    table.enum('day_of_week', ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']).notNullable();
    table.boolean('is_break').defaultTo(false);
    table.integer('duration_minutes').notNullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    
    table.unique(['start_time', 'day_of_week']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('time_slots');
};
