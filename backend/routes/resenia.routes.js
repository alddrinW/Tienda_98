import { Router } from 'express';
import { getReseniasByProducto, createResenia, getReseniasByVendedor, createReseniaVendedor } from '../controllers/resenia.controller.js';
import { verifyToken, verifyTokenOptional } from '../middlewares/auth.middleware.js';

const router = Router();

// Public (GET)
router.get('/producto/:id', getReseniasByProducto);
router.get('/vendedor/:id', getReseniasByVendedor);

// Protected (POST) - Now Optional for Guests
router.post('/', verifyTokenOptional, createResenia);
router.post('/vendor/:id', verifyToken, createReseniaVendedor);

export default router;
