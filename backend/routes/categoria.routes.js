import express from 'express';
import { getCategorias, createCategoria } from '../controllers/categoria.controller.js';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getCategorias);
router.post('/', [verifyToken, isAdmin], createCategoria);

export default router;
