const express = require('express');
const { body, param, query } = require('express-validator');
const timetableController = require('../controllers/timetableController');
const { authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const timetableEntryValidationRules = [
  body('batch_id').isInt({ min: 1 }).withMessage('Valid batch ID is required'),
  body('subject_id').isInt({ min: 1 }).withMessage('Valid subject ID is required'),
  body('faculty_id').isInt({ min: 1 }).withMessage('Valid faculty ID is required'),
  body('classroom_id').isInt({ min: 1 }).withMessage('Valid classroom ID is required'),
  body('time_slot_id').isInt({ min: 1 }).withMessage('Valid time slot ID is required'),
  body('academic_year').trim().notEmpty().withMessage('Academic year is required'),
  body('notes').optional().trim()
];

const updateTimetableEntryValidationRules = [
  body('batch_id').optional().isInt({ min: 1 }).withMessage('Valid batch ID is required'),
  body('subject_id').optional().isInt({ min: 1 }).withMessage('Valid subject ID is required'),
  body('faculty_id').optional().isInt({ min: 1 }).withMessage('Valid faculty ID is required'),
  body('classroom_id').optional().isInt({ min: 1 }).withMessage('Valid classroom ID is required'),
  body('time_slot_id').optional().isInt({ min: 1 }).withMessage('Valid time slot ID is required'),
  body('academic_year').optional().trim().notEmpty().withMessage('Academic year cannot be empty'),
  body('notes').optional().trim()
];

const idValidation = [
  param('id').isInt({ min: 1 }).withMessage('Invalid timetable entry ID')
];

const academicYearValidation = [
  query('academic_year').trim().notEmpty().withMessage('Academic year is required')
];

// GET /api/timetable - Get timetable (with optional batch filter)
router.get('/', [
  ...academicYearValidation,
  query('batch_id').optional().isInt({ min: 1 }).withMessage('Valid batch ID required if provided')
], timetableController.getTimetable);

// GET /api/timetable/validate - Validate timetable for conflicts
router.get('/validate', academicYearValidation, timetableController.validateTimetable);

// GET /api/timetable/export/pdf - Export timetable as PDF
router.get('/export/pdf', [
  ...academicYearValidation,
  query('batch_id').optional().isInt({ min: 1 }).withMessage('Valid batch ID required if provided')
], timetableController.exportTimetablePDF);

// GET /api/timetable/export/excel - Export timetable as Excel
router.get('/export/excel', [
  ...academicYearValidation,
  query('batch_id').optional().isInt({ min: 1 }).withMessage('Valid batch ID required if provided')
], timetableController.exportTimetableExcel);

// POST /api/timetable/generate - Generate new timetable (admin only)
router.post('/generate', [
  authorizeRoles('admin'),
  body('academic_year').trim().notEmpty().withMessage('Academic year is required'),
  body('options').optional().isObject().withMessage('Options must be an object')
], timetableController.generateTimetable);

// POST /api/timetable/entry - Create manual timetable entry (admin only)
router.post('/entry', [
  authorizeRoles('admin'),
  ...timetableEntryValidationRules
], timetableController.createTimetableEntry);

// PUT /api/timetable/approve - Approve draft timetable (admin only)
router.put('/approve', [
  authorizeRoles('admin'),
  body('academic_year').trim().notEmpty().withMessage('Academic year is required')
], timetableController.approveTimetable);

// PUT /api/timetable/publish - Publish approved timetable (admin only)
router.put('/publish', [
  authorizeRoles('admin'),
  body('academic_year').trim().notEmpty().withMessage('Academic year is required')
], timetableController.publishTimetable);

// PUT /api/timetable/entry/:id - Update timetable entry (admin only)
router.put('/entry/:id', [
  authorizeRoles('admin'),
  ...idValidation,
  ...updateTimetableEntryValidationRules
], timetableController.updateTimetableEntry);

// DELETE /api/timetable/entry/:id - Delete timetable entry (admin only)
router.delete('/entry/:id', [
  authorizeRoles('admin'),
  ...idValidation
], timetableController.deleteTimetableEntry);

// Additional utility routes

// GET /api/timetable/conflicts - Get all conflicts for academic year
router.get('/conflicts', [
  authorizeRoles('admin'),
  ...academicYearValidation
], async (req, res) => {
  try {
    const { academic_year } = req.query;
    const SchedulingService = require('../services/schedulingService');
    const validation = await SchedulingService.validateTimetable(academic_year);
    res.json({ 
      conflicts: validation.conflicts,
      total_conflicts: validation.conflicts.length 
    });
  } catch (error) {
    console.error('Get conflicts error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/timetable/faculty/:facultyId - Get faculty schedule
router.get('/faculty/:facultyId', [
  param('facultyId').isInt({ min: 1 }).withMessage('Valid faculty ID is required'),
  ...academicYearValidation
], async (req, res) => {
  try {
    const { facultyId } = req.params;
    const { academic_year } = req.query;
    
    const Timetable = require('../models/Timetable');
    const schedule = await Timetable.findAll(academic_year);
    const facultySchedule = schedule.filter(entry => entry.faculty_id === parseInt(facultyId));
    
    res.json({ schedule: facultySchedule });
  } catch (error) {
    console.error('Get faculty schedule error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/timetable/classroom/:classroomId - Get classroom schedule
router.get('/classroom/:classroomId', [
  param('classroomId').isInt({ min: 1 }).withMessage('Valid classroom ID is required'),
  ...academicYearValidation
], async (req, res) => {
  try {
    const { classroomId } = req.params;
    const { academic_year } = req.query;
    
    const Timetable = require('../models/Timetable');
    const schedule = await Timetable.findAll(academic_year);
    const classroomSchedule = schedule.filter(entry => entry.classroom_id === parseInt(classroomId));
    
    res.json({ schedule: classroomSchedule });
  } catch (error) {
    console.error('Get classroom schedule error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
