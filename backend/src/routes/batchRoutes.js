const express = require('express');
const { body, param, query } = require('express-validator');
const batchController = require('../controllers/batchController');
const { authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const batchValidationRules = [
  body('batch_name').trim().notEmpty().withMessage('Batch name is required'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('year').isInt({ min: 1, max: 4 }).withMessage('Year must be between 1 and 4'),
  body('semester').isInt({ min: 1, max: 8 }).withMessage('Semester must be between 1 and 8'),
  body('academic_year').trim().notEmpty().withMessage('Academic year is required'),
  body('student_count').isInt({ min: 1, max: 200 }).withMessage('Student count must be between 1 and 200')
];

const updateBatchValidationRules = [
  body('batch_name').optional().trim().notEmpty().withMessage('Batch name cannot be empty'),
  body('department').optional().trim().notEmpty().withMessage('Department cannot be empty'),
  body('year').optional().isInt({ min: 1, max: 4 }).withMessage('Year must be between 1 and 4'),
  body('semester').optional().isInt({ min: 1, max: 8 }).withMessage('Semester must be between 1 and 8'),
  body('academic_year').optional().trim().notEmpty().withMessage('Academic year cannot be empty'),
  body('student_count').optional().isInt({ min: 1, max: 200 }).withMessage('Student count must be between 1 and 200')
];

const idValidation = [
  param('id').isInt({ min: 1 }).withMessage('Invalid batch ID')
];

// GET /api/batches - Get all batches (with optional filters)
router.get('/', [
  query('department').optional().trim(),
  query('academic_year').optional().trim()
], batchController.getAllBatches);

// GET /api/batches/search - Search batches
router.get('/search', [
  query('q').trim().notEmpty().withMessage('Search query is required')
], batchController.searchBatches);

// GET /api/batches/stats - Get batch statistics (admin only)
router.get('/stats', authorizeRoles('admin'), batchController.getBatchStats);

// GET /api/batches/:id - Get batch by ID
router.get('/:id', idValidation, batchController.getBatchById);

// GET /api/batches/:id/subjects - Get batch with assigned subjects
router.get('/:id/subjects', idValidation, batchController.getBatchWithSubjects);

// GET /api/batches/:id/timetable - Get batch timetable
router.get('/:id/timetable', [
  ...idValidation,
  query('academic_year').trim().notEmpty().withMessage('Academic year is required')
], batchController.getBatchTimetable);

// POST /api/batches - Create new batch (admin only)
router.post('/', [
  authorizeRoles('admin'),
  ...batchValidationRules
], batchController.createBatch);

// PUT /api/batches/:id - Update batch (admin only)
router.put('/:id', [
  authorizeRoles('admin'),
  ...idValidation,
  ...updateBatchValidationRules
], batchController.updateBatch);

// DELETE /api/batches/:id - Delete batch (admin only)
router.delete('/:id', [
  authorizeRoles('admin'),
  ...idValidation
], batchController.deleteBatch);

module.exports = router;
