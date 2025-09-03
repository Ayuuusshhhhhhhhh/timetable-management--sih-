exports.up = function(knex) {
  return knex.schema.createTable('classrooms', function(table) {
    table.increments('id').primary();
    table.string('room_number').notNullable().unique();
    table.string('building').notNullable();
    table.integer('capacity').notNullable();
    table.string('type').notNullable(); // 'lecture', 'lab', 'seminar'
    table.text('equipment').nullable(); // JSON string of available equipment
    table.boolean('is_available').defaultTo(true);
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('classrooms');
};
