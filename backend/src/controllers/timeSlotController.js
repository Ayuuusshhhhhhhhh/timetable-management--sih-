const TimeSlot = require('../models/TimeSlot');
const { validationResult } = require('express-validator');

const getAllTimeSlots = async (req, res) => {
  try {
    const { day_of_week } = req.query;
    
    let timeSlots;
    if (day_of_week) {
      timeSlots = await TimeSlot.findByDay(day_of_week);
    } else {
      timeSlots = await TimeSlot.findAll();
    }

    res.json({ timeSlots });
  } catch (error) {
    console.error('Get time slots error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getTimeSlotById = async (req, res) => {
  try {
    const { id } = req.params;
    const timeSlot = await TimeSlot.findById(id);

    if (!timeSlot) {
      return res.status(404).json({ message: 'Time slot not found' });
    }

    res.json({ timeSlot });
  } catch (error) {
    console.error('Get time slot by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createTimeSlot = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { day_of_week, start_time, end_time } = req.body;

    // Check for time conflicts
    const conflicts = await TimeSlot.checkConflicts(day_of_week, start_time, end_time);
    if (conflicts.length > 0) {
      return res.status(400).json({ 
        message: 'Time slot conflicts with existing slot',
        conflicts
      });
    }

    const newTimeSlot = await TimeSlot.create(req.body);
    res.status(201).json({
      message: 'Time slot created successfully',
      timeSlot: newTimeSlot
    });
  } catch (error) {
    console.error('Create time slot error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateTimeSlot = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { day_of_week, start_time, end_time } = req.body;

    // Check if time slot exists
    const existingTimeSlot = await TimeSlot.findById(id);
    if (!existingTimeSlot) {
      return res.status(404).json({ message: 'Time slot not found' });
    }

    // Check for time conflicts (excluding current slot)
    if (day_of_week && start_time && end_time) {
      const conflicts = await TimeSlot.checkConflicts(
        day_of_week, 
        start_time, 
        end_time, 
        parseInt(id)
      );
      if (conflicts.length > 0) {
        return res.status(400).json({ 
          message: 'Time slot conflicts with existing slot',
          conflicts
        });
      }
    }

    const updatedTimeSlot = await TimeSlot.update(id, req.body);
    res.json({
      message: 'Time slot updated successfully',
      timeSlot: updatedTimeSlot
    });
  } catch (error) {
    console.error('Update time slot error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteTimeSlot = async (req, res) => {
  try {
    const { id } = req.params;

    const existingTimeSlot = await TimeSlot.findById(id);
    if (!existingTimeSlot) {
      return res.status(404).json({ message: 'Time slot not found' });
    }

    await TimeSlot.delete(id);
    res.json({ message: 'Time slot deleted successfully' });
  } catch (error) {
    console.error('Delete time slot error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getAvailableTimeSlots = async (req, res) => {
  try {
    const { day_of_week } = req.query;
    
    if (!day_of_week) {
      return res.status(400).json({ message: 'Day of week is required' });
    }

    const availableSlots = await TimeSlot.getAvailableSlots(day_of_week);
    res.json({ timeSlots: availableSlots });
  } catch (error) {
    console.error('Get available time slots error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getTimeSlotStats = async (req, res) => {
  try {
    const stats = await TimeSlot.getStats();
    res.json({ stats });
  } catch (error) {
    console.error('Get time slot stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllTimeSlots,
  getTimeSlotById,
  createTimeSlot,
  updateTimeSlot,
  deleteTimeSlot,
  getAvailableTimeSlots,
  getTimeSlotStats
};
