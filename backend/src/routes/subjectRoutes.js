const express = require('express');
const { body, param, query } = require('express-validator');
const subjectController = require('../controllers/subjectController');
const { authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const subjectValidationRules = [
  body('subject_code').trim().notEmpty().withMessage('Subject code is required'),
  body('subject_name').trim().notEmpty().withMessage('Subject name is required'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('credits').isInt({ min: 1, max: 10 }).withMessage('Credits must be between 1 and 10'),
  body('type').isIn(['theory', 'lab', 'practical']).withMessage('Type must be theory, lab, or practical'),
  body('duration_minutes').isInt({ min: 30, max: 240 }).withMessage('Duration must be between 30 and 240 minutes')
];

const updateSubjectValidationRules = [
  body('subject_code').optional().trim().notEmpty().withMessage('Subject code cannot be empty'),
  body('subject_name').optional().trim().notEmpty().withMessage('Subject name cannot be empty'),
  body('department').optional().trim().notEmpty().withMessage('Department cannot be empty'),
  body('credits').optional().isInt({ min: 1, max: 10 }).withMessage('Credits must be between 1 and 10'),
  body('type').optional().isIn(['theory', 'lab', 'practical']).withMessage('Type must be theory, lab, or practical'),
  body('duration_minutes').optional().isInt({ min: 30, max: 240 }).withMessage('Duration must be between 30 and 240 minutes')
];

const idValidation = [
  param('id').isInt({ min: 1 }).withMessage('Invalid subject ID')
];

// GET /api/subjects - Get all subjects (with optional filters)
router.get('/', [
  query('department').optional().trim(),
  query('type').optional().isIn(['theory', 'lab', 'practical'])
], subjectController.getAllSubjects);

// GET /api/subjects/search - Search subjects
router.get('/search', [
  query('q').trim().notEmpty().withMessage('Search query is required')
], subjectController.searchSubjects);

// GET /api/subjects/stats - Get subject statistics (admin only)
router.get('/stats', authorizeRoles('admin'), subjectController.getSubjectStats);

// GET /api/subjects/:id - Get subject by ID
router.get('/:id', idValidation, subjectController.getSubjectById);

// GET /api/subjects/:id/faculty - Get subject with assigned faculty
router.get('/:id/faculty', idValidation, subjectController.getSubjectWithFaculty);

// POST /api/subjects - Create new subject (admin only)
router.post('/', [
  authorizeRoles('admin'),
  ...subjectValidationRules
], subjectController.createSubject);

// PUT /api/subjects/:id - Update subject (admin only)
router.put('/:id', [
  authorizeRoles('admin'),
  ...idValidation,
  ...updateSubjectValidationRules
], subjectController.updateSubject);

// DELETE /api/subjects/:id - Delete subject (admin only)
router.delete('/:id', [
  authorizeRoles('admin'),
  ...idValidation
], subjectController.deleteSubject);

module.exports = router;
