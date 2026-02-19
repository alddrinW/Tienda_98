import { Router } from 'express';
import { createVendedor, getVendedores, getVendedorById, updateVendedor, getDashboard, getMyProducts, getMyOrders, updateOrderStatus } from '../controllers/vendedor.controller.js';
import { verifyToken, verifyVendedor } from '../middlewares/auth.middleware.js'; 

const router = Router();

// Public Routes
router.get('/', getVendedores);
router.get('/:id', getVendedorById);

// Protected Routes
router.post('/', verifyToken, createVendedor); // User becoming seller
router.put('/:id', verifyToken, updateVendedor);

// Vendor Dashboard Routes (Need verifyVendedor)
router.get('/dashboard/stats', [verifyToken, verifyVendedor], getDashboard);
router.get('/dashboard/products', [verifyToken, verifyVendedor], getMyProducts);
router.get('/dashboard/orders', [verifyToken, verifyVendedor], getMyOrders);
router.put('/dashboard/orders/:id/status', [verifyToken, verifyVendedor], updateOrderStatus);

export default router;

