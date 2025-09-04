const express = require('express');
const { body, param, query } = require('express-validator');
const timeSlotController = require('../controllers/timeSlotController');
const { authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const timeSlotValidationRules = [
  body('day_of_week').isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
    .withMessage('Day of week must be a valid weekday'),
  body('start_time').matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Start time must be in HH:MM format (24-hour)'),
  body('end_time').matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('End time must be in HH:MM format (24-hour)'),
  body('description').optional().trim()
];

const updateTimeSlotValidationRules = [
  body('day_of_week').optional().isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
    .withMessage('Day of week must be a valid weekday'),
  body('start_time').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Start time must be in HH:MM format (24-hour)'),
  body('end_time').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('End time must be in HH:MM format (24-hour)'),
  body('description').optional().trim()
];

const idValidation = [
  param('id').isInt({ min: 1 }).withMessage('Invalid time slot ID')
];

// GET /api/time-slots - Get all time slots (with optional day filter)
router.get('/', [
  query('day_of_week').optional().isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
    .withMessage('Day of week must be a valid weekday')
], timeSlotController.getAllTimeSlots);

// GET /api/time-slots/available - Get available time slots for specific day
router.get('/available', [
  query('day_of_week').notEmpty().isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
    .withMessage('Valid day of week is required')
], timeSlotController.getAvailableTimeSlots);

// GET /api/time-slots/stats - Get time slot statistics (admin only)
router.get('/stats', authorizeRoles('admin'), timeSlotController.getTimeSlotStats);

// GET /api/time-slots/:id - Get time slot by ID
router.get('/:id', idValidation, timeSlotController.getTimeSlotById);

// POST /api/time-slots - Create new time slot (admin only)
router.post('/', [
  authorizeRoles('admin'),
  ...timeSlotValidationRules
], timeSlotController.createTimeSlot);

// PUT /api/time-slots/:id - Update time slot (admin only)
router.put('/:id', [
  authorizeRoles('admin'),
  ...idValidation,
  ...updateTimeSlotValidationRules
], timeSlotController.updateTimeSlot);

// DELETE /api/time-slots/:id - Delete time slot (admin only)
router.delete('/:id', [
  authorizeRoles('admin'),
  ...idValidation
], timeSlotController.deleteTimeSlot);

module.exports = router;
