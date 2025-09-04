const express = require('express');
const { body, param, query } = require('express-validator');
const facultyController = require('../controllers/facultyController');
const { authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const assignmentValidationRules = [
  body('faculty_id').isInt({ min: 1 }).withMessage('Valid faculty ID is required'),
  body('subject_id').isInt({ min: 1 }).withMessage('Valid subject ID is required')
];

const idValidation = [
  param('id').isInt({ min: 1 }).withMessage('Invalid faculty ID')
];

// GET /api/faculty - Get all faculty (with optional filters)
router.get('/', [
  query('department').optional().trim()
], facultyController.getAllFaculty);

// GET /api/faculty/stats - Get faculty statistics (admin only)
router.get('/stats', authorizeRoles('admin'), facultyController.getFacultyStats);

// GET /api/faculty/:id - Get faculty by ID
router.get('/:id', idValidation, facultyController.getFacultyById);

// GET /api/faculty/:id/subjects - Get faculty assigned subjects
router.get('/:id/subjects', idValidation, facultyController.getFacultySubjects);

// POST /api/faculty/assign - Assign faculty to subject (admin only)
router.post('/assign', [
  authorizeRoles('admin'),
  ...assignmentValidationRules
], facultyController.assignFacultyToSubject);

// DELETE /api/faculty/:faculty_id/subjects/:subject_id - Remove faculty from subject (admin only)
router.delete('/:faculty_id/subjects/:subject_id', [
  authorizeRoles('admin'),
  param('faculty_id').isInt({ min: 1 }).withMessage('Valid faculty ID is required'),
  param('subject_id').isInt({ min: 1 }).withMessage('Valid subject ID is required')
], facultyController.removeFacultyFromSubject);

module.exports = router;
