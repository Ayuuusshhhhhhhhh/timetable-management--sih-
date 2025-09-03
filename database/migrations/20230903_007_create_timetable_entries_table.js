exports.up = function(knex) {
  return knex.schema.createTable('timetable_entries', function(table) {
    table.increments('id').primary();
    table.integer('batch_id').unsigned().notNullable();
    table.integer('subject_id').unsigned().notNullable();
    table.integer('faculty_id').unsigned().notNullable();
    table.integer('classroom_id').unsigned().notNullable();
    table.integer('time_slot_id').unsigned().notNullable();
    table.string('academic_year').notNullable();
    table.enum('status', ['draft', 'approved', 'published']).defaultTo('draft');
    table.text('notes').nullable();
    table.timestamps(true, true);
    
    table.foreign('batch_id').references('batches.id').onDelete('CASCADE');
    table.foreign('subject_id').references('subjects.id').onDelete('CASCADE');
    table.foreign('faculty_id').references('users.id').onDelete('CASCADE');
    table.foreign('classroom_id').references('classrooms.id').onDelete('CASCADE');
    table.foreign('time_slot_id').references('time_slots.id').onDelete('CASCADE');
    
    // Prevent double booking of classroom and faculty
    table.unique(['classroom_id', 'time_slot_id', 'academic_year']);
    table.unique(['faculty_id', 'time_slot_id', 'academic_year']);
    table.unique(['batch_id', 'time_slot_id', 'academic_year']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('timetable_entries');
};
