const db = require('../config/database');

class Timetable {
  static async findAll(academicYear) {
    return db('timetable_entries')
      .join('batches', 'timetable_entries.batch_id', 'batches.id')
      .join('subjects', 'timetable_entries.subject_id', 'subjects.id')
      .join('users', 'timetable_entries.faculty_id', 'users.id')
      .join('classrooms', 'timetable_entries.classroom_id', 'classrooms.id')
      .join('time_slots', 'timetable_entries.time_slot_id', 'time_slots.id')
      .where('timetable_entries.academic_year', academicYear)
      .select(
        'timetable_entries.*',
        'batches.batch_name',
        'subjects.subject_name',
        'subjects.subject_code',
        'users.first_name as faculty_first_name',
        'users.last_name as faculty_last_name',
        'classrooms.room_number',
        'classrooms.building',
        'time_slots.slot_name',
        'time_slots.start_time',
        'time_slots.end_time',
        'time_slots.day_of_week'
      );
  }

  static async findByBatch(batchId, academicYear) {
    return db('timetable_entries')
      .join('subjects', 'timetable_entries.subject_id', 'subjects.id')
      .join('users', 'timetable_entries.faculty_id', 'users.id')
      .join('classrooms', 'timetable_entries.classroom_id', 'classrooms.id')
      .join('time_slots', 'timetable_entries.time_slot_id', 'time_slots.id')
      .where({
        'timetable_entries.batch_id': batchId,
        'timetable_entries.academic_year': academicYear
      })
      .select(
        'timetable_entries.*',
        'subjects.subject_name',
        'subjects.subject_code',
        'users.first_name as faculty_first_name',
        'users.last_name as faculty_last_name',
        'classrooms.room_number',
        'time_slots.slot_name',
        'time_slots.start_time',
        'time_slots.end_time',
        'time_slots.day_of_week'
      );
  }

  static async create(entryData) {
    const [id] = await db('timetable_entries').insert(entryData);
    return db('timetable_entries').where({ id }).first();
  }

  static async update(id, entryData) {
    await db('timetable_entries').where({ id }).update(entryData);
    return db('timetable_entries').where({ id }).first();
  }

  static async delete(id) {
    return db('timetable_entries').where({ id }).del();
  }

  static async checkConflicts(batchId, facultyId, classroomId, timeSlotId, academicYear, excludeId = null) {
    let query = db('timetable_entries').where({
      academic_year: academicYear,
      time_slot_id: timeSlotId
    });

    if (excludeId) {
      query = query.whereNot('id', excludeId);
    }

    const conflicts = await query.where(function() {
      this.where('batch_id', batchId)
          .orWhere('faculty_id', facultyId)
          .orWhere('classroom_id', classroomId);
    });

    return conflicts;
  }

  static async getByStatus(status, academicYear) {
    return this.findAll(academicYear).then(entries => 
      entries.filter(entry => entry.status === status)
    );
  }
}

module.exports = Timetable;
