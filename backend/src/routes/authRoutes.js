const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Login route
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
], authController.login);

// Register route
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('first_name').trim().notEmpty().withMessage('First name is required'),
  body('last_name').trim().notEmpty().withMessage('Last name is required'),
  body('role').optional().isIn(['admin', 'faculty', 'student']),
  body('department').optional().trim(),
  body('phone').optional().trim()
], authController.register);

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', [
  authenticateToken,
  body('first_name').optional().trim().notEmpty(),
  body('last_name').optional().trim().notEmpty(),
  body('department').optional().trim(),
  body('phone').optional().trim(),
  body('password').optional().isLength({ min: 6 })
], authController.updateProfile);

router.post('/logout', authController.logout);

module.exports = router;
