import { Router } from 'express';
import { createTienda, getTiendas, getTiendaById, updateTienda, deleteTienda, updateTiendaStatus } from '../controllers/tienda.controller.js';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// Public Routes
router.get('/', getTiendas);
router.get('/:id', getTiendaById);

// Protected Routes (User must be logged in)
router.post('/', verifyToken, createTienda);
router.put('/:id', verifyToken, updateTienda);
router.delete('/:id', verifyToken, deleteTienda);

// Admin Routes
router.put('/:id/status', [verifyToken, isAdmin], updateTiendaStatus);

export default router;
