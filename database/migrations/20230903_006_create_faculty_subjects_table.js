exports.up = function(knex) {
  return knex.schema.createTable('faculty_subjects', function(table) {
    table.increments('id').primary();
    table.integer('faculty_id').unsigned().notNullable();
    table.integer('subject_id').unsigned().notNullable();
    table.integer('batch_id').unsigned().notNullable();
    table.string('academic_year').notNullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    
    table.foreign('faculty_id').references('users.id').onDelete('CASCADE');
    table.foreign('subject_id').references('subjects.id').onDelete('CASCADE');
    table.foreign('batch_id').references('batches.id').onDelete('CASCADE');
    table.unique(['faculty_id', 'subject_id', 'batch_id', 'academic_year']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('faculty_subjects');
};
