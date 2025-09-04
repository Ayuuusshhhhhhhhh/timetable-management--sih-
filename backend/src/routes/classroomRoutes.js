const express = require('express');
const { body, param, query } = require('express-validator');
const classroomController = require('../controllers/classroomController');
const { authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const classroomValidationRules = [
  body('room_number').trim().notEmpty().withMessage('Room number is required'),
  body('building').trim().notEmpty().withMessage('Building is required'),
  body('capacity').isInt({ min: 1, max: 500 }).withMessage('Capacity must be between 1 and 500'),
  body('type').isIn(['lecture', 'lab', 'seminar']).withMessage('Type must be lecture, lab, or seminar'),
  body('equipment').optional().isJSON().withMessage('Equipment must be valid JSON')
];

const updateClassroomValidationRules = [
  body('room_number').optional().trim().notEmpty().withMessage('Room number cannot be empty'),
  body('building').optional().trim().notEmpty().withMessage('Building cannot be empty'),
  body('capacity').optional().isInt({ min: 1, max: 500 }).withMessage('Capacity must be between 1 and 500'),
  body('type').optional().isIn(['lecture', 'lab', 'seminar']).withMessage('Type must be lecture, lab, or seminar'),
  body('equipment').optional().isJSON().withMessage('Equipment must be valid JSON'),
  body('is_available').optional().isBoolean().withMessage('Availability must be boolean')
];

const idValidation = [
  param('id').isInt({ min: 1 }).withMessage('Invalid classroom ID')
];

// GET /api/classrooms - Get all classrooms (with optional filters)
router.get('/', [
  query('building').optional().trim(),
  query('type').optional().isIn(['lecture', 'lab', 'seminar']),
  query('min_capacity').optional().isInt({ min: 1 }).withMessage('Minimum capacity must be a positive integer')
], classroomController.getAllClassrooms);

// GET /api/classrooms/search - Search classrooms
router.get('/search', [
  query('q').trim().notEmpty().withMessage('Search query is required')
], classroomController.searchClassrooms);

// GET /api/classrooms/stats - Get classroom statistics (admin only)
router.get('/stats', authorizeRoles('admin'), classroomController.getClassroomStats);

// GET /api/classrooms/available - Get available classrooms for specific time slot
router.get('/available', [
  query('time_slot_id').isInt({ min: 1 }).withMessage('Valid time slot ID is required'),
  query('academic_year').trim().notEmpty().withMessage('Academic year is required'),
  query('type').optional().isIn(['lecture', 'lab', 'seminar'])
], classroomController.getAvailableClassrooms);

// GET /api/classrooms/:id - Get classroom by ID
router.get('/:id', idValidation, classroomController.getClassroomById);

// GET /api/classrooms/:id/schedule - Get classroom schedule
router.get('/:id/schedule', [
  ...idValidation,
  query('academic_year').trim().notEmpty().withMessage('Academic year is required')
], classroomController.getClassroomSchedule);

// POST /api/classrooms - Create new classroom (admin only)
router.post('/', [
  authorizeRoles('admin'),
  ...classroomValidationRules
], classroomController.createClassroom);

// PUT /api/classrooms/:id - Update classroom (admin only)
router.put('/:id', [
  authorizeRoles('admin'),
  ...idValidation,
  ...updateClassroomValidationRules
], classroomController.updateClassroom);

// DELETE /api/classrooms/:id - Delete classroom (admin only)
router.delete('/:id', [
  authorizeRoles('admin'),
  ...idValidation
], classroomController.deleteClassroom);

module.exports = router;
