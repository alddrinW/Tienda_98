import { Router } from 'express';
import { getCarrito, addItem, removeItem, clearCarrito } from '../controllers/carrito.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyToken); // All routes require auth

router.get('/', getCarrito);
router.post('/items', addItem);
router.delete('/items/:id', removeItem);
router.delete('/', clearCarrito);

export default router;
