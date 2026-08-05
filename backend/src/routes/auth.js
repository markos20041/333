const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const validationMiddleware = require('../middleware/validation');

// Validation rules
const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('اسم المستخدم يجب أن يكون بين 3 و 50 حرفاً'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('البريد الإلكتروني غير صحيح'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  body('phone')
    .optional()
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('رقم الهاتف غير صحيح'),
  validationMiddleware,
];

const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('البريد الإلكتروني غير صحيح'),
  body('password')
    .notEmpty()
    .withMessage('كلمة المرور مطلوبة'),
  validationMiddleware,
];

const profileValidation = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 }),
  body('phone')
    .optional()
    .matches(/^[0-9+\-\s()]+$/),
  validationMiddleware,
];

const passwordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('كلمة المرور الحالية مطلوبة'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل'),
  validationMiddleware,
];

// Routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, profileValidation, authController.updateProfile);
router.put('/change-password', authMiddleware, passwordValidation, authController.changePassword);

module.exports = router;
