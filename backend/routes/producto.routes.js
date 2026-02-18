import express from 'express';
import { getProductos, getProductoBySlug, createProducto } from '../controllers/producto.controller.js';
import { verifyToken, isSeller } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { check } from 'express-validator';

const router = express.Router();

router.get('/', getProductos);
router.get('/:slug', getProductoBySlug);

router.post('/', [
    verifyToken,
    isSeller,
    check('nombre', 'Name is required').not().isEmpty(),
    check('precio', 'Price is required').isNumeric(),
    check('idCategoria', 'Category is required').isNumeric(),
    validate
], createProducto);

export default router;
