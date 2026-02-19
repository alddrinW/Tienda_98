import express from 'express';
import { createOrden, getOrderById, trackOrder } from '../controllers/orden.controller.js';
import { verifyTokenOptional, verifyToken } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { check } from 'express-validator';

const router = express.Router();

router.post('/', [
    verifyTokenOptional, // Allows guests
    check('userInfo', 'User info is required').isObject(),
    check('cartItems', 'Cart items are required').isArray({ min: 1 }),
    check('total', 'Total is required').isNumeric(),
    validate
], createOrden);

router.get('/:id', verifyToken, getOrderById);
router.get('/track/:codigo', trackOrder); // Public route for tracking

export default router;
