const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async findAll() {
    return db('users').select('id', 'email', 'first_name', 'last_name', 'role', 'department', 'is_active');
  }

  static async findById(id) {
    const user = await db('users').where({ id }).first();
    if (user) {
      delete user.password;
    }
    return user;
  }

  static async findByEmail(email) {
    return db('users').where({ email }).first();
  }

  static async create(userData) {
    const { password, ...otherData } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [id] = await db('users').insert({
      ...otherData,
      password: hashedPassword
    });
    
    return this.findById(id);
  }

  static async update(id, userData) {
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    
    await db('users').where({ id }).update(userData);
    return this.findById(id);
  }

  static async delete(id) {
    return db('users').where({ id }).update({ is_active: false });
  }

  static async validatePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }

  static async findFaculty() {
    return db('users')
      .where({ role: 'faculty', is_active: true })
      .select('id', 'first_name', 'last_name', 'email', 'department');
  }
}

module.exports = User;
