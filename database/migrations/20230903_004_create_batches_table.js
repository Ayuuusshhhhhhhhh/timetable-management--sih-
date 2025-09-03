exports.up = function(knex) {
  return knex.schema.createTable('batches', function(table) {
    table.increments('id').primary();
    table.string('batch_name').notNullable();
    table.string('department').notNullable();
    table.integer('semester').notNullable();
    table.integer('year').notNullable();
    table.integer('student_count').notNullable();
    table.string('academic_year').notNullable(); // e.g., "2023-24"
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    
    table.unique(['batch_name', 'department', 'academic_year']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('batches');
};
