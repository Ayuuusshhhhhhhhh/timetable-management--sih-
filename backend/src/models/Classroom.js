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
}

module.exports = Classroom;
