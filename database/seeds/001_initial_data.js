const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  // Clear existing entries
  await knex('timetable_entries').del();
  await knex('faculty_subjects').del();
  await knex('time_slots').del();
  await knex('batches').del();
  await knex('subjects').del();
  await knex('classrooms').del();
  await knex('users').del();

  // Insert admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  await knex('users').insert([
    {
      id: 1,
      email: 'admin@example.com',
      password: adminPassword,
      first_name: 'System',
      last_name: 'Administrator',
      role: 'admin',
      department: 'Administration',
      is_active: true
    }
  ]);

  // Insert sample faculty
  const facultyPassword = await bcrypt.hash('faculty123', 10);
  await knex('users').insert([
    {
      id: 2,
      email: 'john.doe@example.com',
      password: facultyPassword,
      first_name: 'John',
      last_name: 'Doe',
      role: 'faculty',
      department: 'Computer Science',
      is_active: true
    },
    {
      id: 3,
      email: 'jane.smith@example.com',
      password: facultyPassword,
      first_name: 'Jane',
      last_name: 'Smith',
      role: 'faculty',
      department: 'Mathematics',
      is_active: true
    }
  ]);

  // Insert sample classrooms
  await knex('classrooms').insert([
    {
      id: 1,
      room_number: 'CS-101',
      building: 'Computer Science Block',
      capacity: 60,
      type: 'lecture',
      equipment: JSON.stringify(['projector', 'whiteboard', 'ac']),
      is_available: true
    },
    {
      id: 2,
      room_number: 'CS-LAB1',
      building: 'Computer Science Block',
      capacity: 30,
      type: 'lab',
      equipment: JSON.stringify(['computers', 'projector', 'ac']),
      is_available: true
    },
    {
      id: 3,
      room_number: 'MATH-201',
      building: 'Mathematics Block',
      capacity: 50,
      type: 'lecture',
      equipment: JSON.stringify(['projector', 'whiteboard']),
      is_available: true
    }
  ]);

  // Insert sample subjects
  await knex('subjects').insert([
    {
      id: 1,
      subject_code: 'CS101',
      subject_name: 'Introduction to Programming',
      department: 'Computer Science',
      credits: 3,
      type: 'theory',
      duration_minutes: 60,
      is_active: true
    },
    {
      id: 2,
      subject_code: 'CS102',
      subject_name: 'Programming Lab',
      department: 'Computer Science',
      credits: 2,
      type: 'lab',
      duration_minutes: 120,
      is_active: true
    },
    {
      id: 3,
      subject_code: 'MATH101',
      subject_name: 'Calculus I',
      department: 'Mathematics',
      credits: 4,
      type: 'theory',
      duration_minutes: 60,
      is_active: true
    }
  ]);

  // Insert sample batches
  await knex('batches').insert([
    {
      id: 1,
      batch_name: 'CS-2023-A',
      department: 'Computer Science',
      semester: 1,
      year: 1,
      student_count: 45,
      academic_year: '2023-24',
      is_active: true
    },
    {
      id: 2,
      batch_name: 'CS-2023-B',
      department: 'Computer Science',
      semester: 1,
      year: 1,
      student_count: 42,
      academic_year: '2023-24',
      is_active: true
    }
  ]);

  // Insert time slots
  await knex('time_slots').insert([
    {
      id: 1,
      slot_name: 'Period 1',
      start_time: '09:00',
      end_time: '10:00',
      day_of_week: 'Monday',
      is_break: false,
      duration_minutes: 60,
      is_active: true
    },
    {
      id: 2,
      slot_name: 'Period 2',
      start_time: '10:00',
      end_time: '11:00',
      day_of_week: 'Monday',
      is_break: false,
      duration_minutes: 60,
      is_active: true
    },
    {
      id: 3,
      slot_name: 'Break',
      start_time: '11:00',
      end_time: '11:15',
      day_of_week: 'Monday',
      is_break: true,
      duration_minutes: 15,
      is_active: true
    },
    {
      id: 4,
      slot_name: 'Period 3',
      start_time: '11:15',
      end_time: '12:15',
      day_of_week: 'Monday',
      is_break: false,
      duration_minutes: 60,
      is_active: true
    }
  ]);

  // Insert faculty-subject assignments
  await knex('faculty_subjects').insert([
    {
      id: 1,
      faculty_id: 2, // John Doe
      subject_id: 1, // CS101
      batch_id: 1,   // CS-2023-A
      academic_year: '2023-24',
      is_active: true
    },
    {
      id: 2,
      faculty_id: 2, // John Doe
      subject_id: 2, // CS102 Lab
      batch_id: 1,   // CS-2023-A
      academic_year: '2023-24',
      is_active: true
    },
    {
      id: 3,
      faculty_id: 3, // Jane Smith
      subject_id: 3, // MATH101
      batch_id: 1,   // CS-2023-A
      academic_year: '2023-24',
      is_active: true
    }
  ]);
};
