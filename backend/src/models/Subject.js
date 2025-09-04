const db = require('../config/database');

class Subject {
  static async findAll() {
    return db('subjects').where({ is_active: true });
  }

  static async findById(id) {
    return db('subjects').where({ id }).first();
  }

  static async create(subjectData) {
    const [id] = await db('subjects').insert(subjectData);
    return this.findById(id);
  }

  static async update(id, subjectData) {
    await db('subjects').where({ id }).update(subjectData);
    return this.findById(id);
  }

  static async delete(id) {
    return db('subjects').where({ id }).update({ is_active: false });
  }

  static async findByDepartment(department) {
    return db('subjects').where({ department, is_active: true });
  }

  static async findByType(type) {
    return db('subjects').where({ type, is_active: true });
  }

  static async findByCode(subjectCode) {
    return db('subjects').where({ subject_code: subjectCode }).first();
  }

  static async getWithFaculty(subjectId) {
    return db('subjects')
      .join('faculty_subjects', 'subjects.id', 'faculty_subjects.subject_id')
      .join('users', 'faculty_subjects.faculty_id', 'users.id')
      .where('subjects.id', subjectId)
      .select(
        'subjects.*',
        'users.id as faculty_id',
        'users.first_name as faculty_first_name',
        'users.last_name as faculty_last_name',
        'users.department as faculty_department'
      );
  }

  static async getStats() {
    const totalSubjects = await db('subjects').where({ is_active: true }).count('id as count').first();
    const departmentStats = await db('subjects')
      .where({ is_active: true })
      .groupBy('department')
      .select('department')
      .count('id as subject_count')
      .avg('credits as avg_credits');

    const typeStats = await db('subjects')
      .where({ is_active: true })
      .groupBy('type')
      .select('type')
      .count('id as subject_count')
      .avg('credits as avg_credits');

    return {
      total_subjects: totalSubjects.count,
      by_department: departmentStats,
      by_type: typeStats
    };
  }

  static async hardDelete(id) {
    return db('subjects').where({ id }).del();
  }
}

module.exports = Subject;
