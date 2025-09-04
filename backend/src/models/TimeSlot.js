const db = require('../config/database');

class TimeSlot {
  static async findAll() {
    return db('time_slots')
      .select('*')
      .orderBy('day_of_week')
      .orderBy('start_time');
  }

  static async findById(id) {
    return db('time_slots').where({ id }).first();
  }

  static async findByDay(dayOfWeek) {
    return db('time_slots')
      .where({ day_of_week: dayOfWeek })
      .orderBy('start_time');
  }

  static async create(timeSlotData) {
    const [id] = await db('time_slots').insert(timeSlotData);
    return this.findById(id);
  }

  static async update(id, timeSlotData) {
    await db('time_slots').where({ id }).update(timeSlotData);
    return this.findById(id);
  }

  static async delete(id) {
    return db('time_slots').where({ id }).del();
  }

  static async checkConflicts(dayOfWeek, startTime, endTime, excludeId = null) {
    let query = db('time_slots')
      .where({ day_of_week: dayOfWeek })
      .andWhere(function() {
        this.whereBetween('start_time', [startTime, endTime])
          .orWhereBetween('end_time', [startTime, endTime])
          .orWhere(function() {
            this.where('start_time', '<=', startTime)
              .andWhere('end_time', '>=', endTime);
          });
      });

    if (excludeId) {
      query = query.andWhere('id', '!=', excludeId);
    }

    return query;
  }

  static async getAvailableSlots(dayOfWeek) {
    return db('time_slots')
      .leftJoin('timetable_entries', 'time_slots.id', 'timetable_entries.time_slot_id')
      .where('time_slots.day_of_week', dayOfWeek)
      .whereNull('timetable_entries.id')
      .select('time_slots.*')
      .orderBy('start_time');
  }

  static async getStats() {
    const totalSlots = await db('time_slots').count('id as count').first();
    
    const slotsPerDay = await db('time_slots')
      .select('day_of_week')
      .count('id as count')
      .groupBy('day_of_week')
      .orderBy('day_of_week');

    const utilizationStats = await db('time_slots')
      .leftJoin('timetable_entries', 'time_slots.id', 'timetable_entries.time_slot_id')
      .select('time_slots.day_of_week')
      .count('time_slots.id as total_slots')
      .countDistinct('timetable_entries.id as used_slots')
      .groupBy('time_slots.day_of_week')
      .orderBy('time_slots.day_of_week');

    return {
      total_slots: totalSlots.count,
      slots_per_day: slotsPerDay,
      utilization: utilizationStats
    };
  }
}

module.exports = TimeSlot;
