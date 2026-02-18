import express from 'express';
import { register, login, getMe } from '../controllers/auth.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { check } from 'express-validator';
import { validate } from '../middlewares/validate.middleware.js';
import { authLimiter } from '../middlewares/security.middleware.js';

const router = express.Router();

router.post('/register', [
    check('nombre', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
    validate
], register);

router.post('/login', [
    authLimiter, // Generates 429 if too many requests
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
    validate
], login);

router.get('/me', verifyToken, getMe);

export default router;
