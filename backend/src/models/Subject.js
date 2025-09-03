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
}

module.exports = Subject;
