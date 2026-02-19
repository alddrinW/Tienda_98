import { Router } from 'express';
import { getDeseos, addDeseo, removeDeseo, clearDeseos } from '../controllers/deseos.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyToken);

router.get('/', getDeseos);
router.post('/', addDeseo);
router.delete('/:idProducto', removeDeseo);
router.delete('/', clearDeseos);

export default router;
