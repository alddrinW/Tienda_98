import { Router } from 'express';
import { getProfile, updateProfile, changePassword, getMyOrders, upgradeToSeller } from '../controllers/usuario.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyToken);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/password', changePassword);
router.get('/orders', getMyOrders);
router.post('/upgrade-to-seller', upgradeToSeller);

// Direcciones Routes (Commented out until Model is updated with idUsuario)
// router.get('/addresses', getDirecciones);
// router.post('/addresses', addDireccion);
// router.put('/addresses/:id', updateDireccion);
// router.delete('/addresses/:id', deleteDireccion);

export default router;
