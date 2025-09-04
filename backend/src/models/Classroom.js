const db = require('../config/database');

class Classroom {
  static async findAll() {
    return db('classrooms').where({ is_available: true });
  }

  static async findById(id) {
    return db('classrooms').where({ id }).first();
  }

  static async create(classroomData) {
    const [id] = await db('classrooms').insert(classroomData);
    return this.findById(id);
  }

  static async update(id, classroomData) {
    await db('classrooms').where({ id }).update(classroomData);
    return this.findById(id);
  }

  static async delete(id) {
    return db('classrooms').where({ id }).update({ is_available: false });
  }

  static async findByType(type) {
    return db('classrooms').where({ type, is_available: true });
  }

  static async findByBuilding(building) {
    return db('classrooms').where({ building, is_available: true });
  }

  static async checkAvailability(classroomId, timeSlotId, academicYear) {
    const conflict = await db('timetable_entries')
      .where({
        classroom_id: classroomId,
        time_slot_id: timeSlotId,
        academic_year: academicYear
      })
      .first();
    
    return !conflict;
  }

  static async getStats() {
    const totalClassrooms = await db('classrooms').where({ is_available: true }).count('id as count').first();
    const typeStats = await db('classrooms')
      .where({ is_available: true })
      .groupBy('type')
      .select('type')
      .count('id as count');
    
    const buildingStats = await db('classrooms')
      .where({ is_available: true })
      .groupBy('building')
      .select('building')
      .count('id as count');

    return {
      total_classrooms: totalClassrooms.count,
      available_rooms: totalClassrooms.count,
      by_type: typeStats,
      by_building: buildingStats
    };
  }

  static async getAvailableClassrooms(timeSlotId, academicYear, type = null) {
    let query = db('classrooms')
      .where({ is_available: true })
      .whereNotExists(function() {
        this.select('*')
          .from('timetable_entries')
          .whereRaw('timetable_entries.classroom_id = classrooms.id')
          .where({
            time_slot_id: timeSlotId,
            academic_year: academicYear
          });
      });

    if (type) {
      query = query.where({ type });
    }

    return query;
  }

  static async getSchedule(classroomId, academicYear) {
    return db('timetable_entries')
      .join('subjects', 'timetable_entries.subject_id', 'subjects.id')
      .join('users', 'timetable_entries.faculty_id', 'users.id')
      .join('batches', 'timetable_entries.batch_id', 'batches.id')
      .join('time_slots', 'timetable_entries.time_slot_id', 'time_slots.id')
      .where({
        'timetable_entries.classroom_id': classroomId,
        'timetable_entries.academic_year': academicYear
      })
      .select(
        'subjects.subject_name',
        'subjects.subject_code',
        'users.first_name as faculty_first_name',
        'users.last_name as faculty_last_name',
        'batches.batch_name',
        'time_slots.slot_name',
        'time_slots.start_time',
        'time_slots.end_time',
        'time_slots.day_of_week',
        'timetable_entries.status'
      );
  }

  static async findByRoomNumber(roomNumber, building) {
    return db('classrooms').where({ room_number: roomNumber, building }).first();
  }
}

module.exports = Classroom;
