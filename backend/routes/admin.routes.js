import { Router } from 'express';
import { getDashboardStats, getUsers, updateUserStatus, getVendedores, approveVendedor, getAllOrders, updateOrderStatus } from '../controllers/admin.controller.js';
import { verifyToken, verifyAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

router.use([verifyToken, verifyAdmin]);

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus);
router.get('/vendors', getVendedores);
router.put('/vendors/:id/approve', approveVendedor);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

export default router;
