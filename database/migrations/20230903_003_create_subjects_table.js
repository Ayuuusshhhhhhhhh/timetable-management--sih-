exports.up = function(knex) {
  return knex.schema.createTable('subjects', function(table) {
    table.increments('id').primary();
    table.string('subject_code').notNullable().unique();
    table.string('subject_name').notNullable();
    table.string('department').notNullable();
    table.integer('credits').notNullable();
    table.string('type').notNullable(); // 'theory', 'lab', 'practical'
    table.integer('duration_minutes').notNullable(); // class duration
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('subjects');
};
