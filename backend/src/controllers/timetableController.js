const Timetable = require('../models/Timetable');
const SchedulingService = require('../services/schedulingService');
const ExportService = require('../services/exportService');
const { validationResult } = require('express-validator');
const db = require('../config/database');

const getTimetable = async (req, res) => {
  try {
    const { academic_year, batch_id } = req.query;
    
    if (!academic_year) {
      return res.status(400).json({ message: 'Academic year is required' });
    }

    let timetable;
    if (batch_id) {
      timetable = await Timetable.findByBatch(batch_id, academic_year);
    } else {
      timetable = await Timetable.findAll(academic_year);
    }

    res.json({ timetable });
  } catch (error) {
    console.error('Get timetable error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const generateTimetable = async (req, res) => {
  try {
    const { academic_year } = req.body;
    
    if (!academic_year) {
      return res.status(400).json({ message: 'Academic year is required' });
    }

    const result = await SchedulingService.generateTimetable(academic_year, req.body.options);
    res.json(result);
  } catch (error) {
    console.error('Generate timetable error:', error);
    res.status(500).json({ message: 'Failed to generate timetable', error: error.message });
  }
};

const approveTimetable = async (req, res) => {
  try {
    const { academic_year } = req.body;
    
    if (!academic_year) {
      return res.status(400).json({ message: 'Academic year is required' });
    }

    // Update all draft entries to approved status
    await db('timetable_entries')
      .where({ academic_year: academic_year, status: 'draft' })
      .update({ status: 'approved' });

    res.json({ message: 'Timetable approved successfully' });
  } catch (error) {
    console.error('Approve timetable error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const publishTimetable = async (req, res) => {
  try {
    const { academic_year } = req.body;
    
    if (!academic_year) {
      return res.status(400).json({ message: 'Academic year is required' });
    }

    // Update all approved entries to published status
    await db('timetable_entries')
      .where({ academic_year: academic_year, status: 'approved' })
      .update({ status: 'published' });

    res.json({ message: 'Timetable published successfully' });
  } catch (error) {
    console.error('Publish timetable error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateTimetableEntry = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    
    // Check for conflicts before updating
    const { batch_id, faculty_id, classroom_id, time_slot_id, academic_year } = req.body;
    const conflicts = await Timetable.checkConflicts(
      batch_id, 
      faculty_id, 
      classroom_id, 
      time_slot_id, 
      academic_year, 
      parseInt(id)
    );

    if (conflicts.length > 0) {
      return res.status(400).json({ 
        message: 'Schedule conflict detected', 
        conflicts 
      });
    }

    const entry = await Timetable.update(id, req.body);
    res.json({
      message: 'Timetable entry updated successfully',
      entry
    });
  } catch (error) {
    console.error('Update timetable entry error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteTimetableEntry = async (req, res) => {
  try {
    const { id } = req.params;
    await Timetable.delete(id);
    res.json({ message: 'Timetable entry deleted successfully' });
  } catch (error) {
    console.error('Delete timetable entry error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const exportTimetablePDF = async (req, res) => {
  try {
    const { academic_year, batch_id } = req.query;
    
    if (!academic_year) {
      return res.status(400).json({ message: 'Academic year is required' });
    }

    await ExportService.exportTimetableToPDF(academic_year, batch_id, res);
  } catch (error) {
    console.error('PDF export error:', error);
    res.status(500).json({ message: 'Failed to export PDF' });
  }
};

const exportTimetableExcel = async (req, res) => {
  try {
    const { academic_year, batch_id } = req.query;
    
    if (!academic_year) {
      return res.status(400).json({ message: 'Academic year is required' });
    }

    await ExportService.exportTimetableToExcel(academic_year, batch_id, res);
  } catch (error) {
    console.error('Excel export error:', error);
    res.status(500).json({ message: 'Failed to export Excel' });
  }
};

const validateTimetable = async (req, res) => {
  try {
    const { academic_year } = req.query;
    
    if (!academic_year) {
      return res.status(400).json({ message: 'Academic year is required' });
    }

    const validation = await SchedulingService.validateTimetable(academic_year);
    res.json(validation);
  } catch (error) {
    console.error('Validate timetable error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createTimetableEntry = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { batch_id, faculty_id, classroom_id, time_slot_id, academic_year } = req.body;
    
    // Check for conflicts before creating
    const conflicts = await Timetable.checkConflicts(
      batch_id, 
      faculty_id, 
      classroom_id, 
      time_slot_id, 
      academic_year
    );

    if (conflicts.length > 0) {
      return res.status(400).json({ 
        message: 'Schedule conflict detected', 
        conflicts 
      });
    }

    const entry = await Timetable.create(req.body);
    res.status(201).json({
      message: 'Timetable entry created successfully',
      entry
    });
  } catch (error) {
    console.error('Create timetable entry error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getTimetable,
  generateTimetable,
  approveTimetable,
  publishTimetable,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
  exportTimetablePDF,
  exportTimetableExcel,
  validateTimetable
};
