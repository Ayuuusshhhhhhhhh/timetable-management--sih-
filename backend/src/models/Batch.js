const db = require('../config/database');

class Batch {
  static async findAll() {
    return db('batches')
      .select('id', 'batch_name', 'department', 'year', 'semester', 'academic_year', 'student_count', 'is_active')
      .where({ is_active: true });
  }

  static async findById(id) {
    return db('batches').where({ id }).first();
  }

  static async findByDepartment(department) {
    return db('batches')
      .where({ department, is_active: true })
      .select('id', 'batch_name', 'year', 'semester', 'academic_year', 'student_count');
  }

  static async findByAcademicYear(academicYear) {
    return db('batches')
      .where({ academic_year: academicYear, is_active: true })
      .select('id', 'batch_name', 'department', 'year', 'semester', 'student_count');
  }

  static async create(batchData) {
    const [id] = await db('batches').insert(batchData);
    return this.findById(id);
  }

  static async update(id, batchData) {
    await db('batches').where({ id }).update(batchData);
    return this.findById(id);
  }

  static async delete(id) {
    return db('batches').where({ id }).update({ is_active: false });
  }

  static async hardDelete(id) {
    return db('batches').where({ id }).del();
  }

  static async getWithSubjects(batchId) {
    return db('batches')
      .join('faculty_subjects', 'batches.id', 'faculty_subjects.batch_id')
      .join('subjects', 'faculty_subjects.subject_id', 'subjects.id')
      .join('users', 'faculty_subjects.faculty_id', 'users.id')
      .where('batches.id', batchId)
      .select(
        'batches.*',
        'subjects.subject_name',
        'subjects.subject_code',
        'subjects.credits',
        'subjects.type as subject_type',
        'users.first_name as faculty_first_name',
        'users.last_name as faculty_last_name'
      );
  }

  static async getTimetable(batchId, academicYear) {
    return db('batches')
      .join('timetable_entries', 'batches.id', 'timetable_entries.batch_id')
      .join('subjects', 'timetable_entries.subject_id', 'subjects.id')
      .join('users', 'timetable_entries.faculty_id', 'users.id')
      .join('classrooms', 'timetable_entries.classroom_id', 'classrooms.id')
      .join('time_slots', 'timetable_entries.time_slot_id', 'time_slots.id')
      .where({
        'batches.id': batchId,
        'timetable_entries.academic_year': academicYear
      })
      .select(
        'batches.batch_name',
        'subjects.subject_name',
        'subjects.subject_code',
        'users.first_name as faculty_first_name',
        'users.last_name as faculty_last_name',
        'classrooms.room_number',
        'time_slots.slot_name',
        'time_slots.start_time',
        'time_slots.end_time',
        'time_slots.day_of_week',
        'timetable_entries.status'
      );
  }

  static async getStats() {
    const totalBatches = await db('batches').where({ is_active: true }).count('id as count').first();
    const departmentStats = await db('batches')
      .where({ is_active: true })
      .groupBy('department')
      .select('department')
      .count('id as batch_count')
      .sum('student_count as total_students');

    const yearStats = await db('batches')
      .where({ is_active: true })
      .groupBy('year')
      .select('year')
      .count('id as batch_count')
      .sum('student_count as total_students');

    return {
      total_batches: totalBatches.count,
      by_department: departmentStats,
      by_year: yearStats
    };
  }
}

module.exports = Batch;
