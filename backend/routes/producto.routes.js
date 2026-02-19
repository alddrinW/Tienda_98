import express from 'express';
import { getProductos, getProductoBySlug, createProducto, searchProductos, getProductoById } from '../controllers/producto.controller.js';
import { verifyToken, isSeller } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { check } from 'express-validator';

const router = express.Router();

// Public
router.get('/', getProductos);
router.get('/search', searchProductos); // /api/products/search?query=...
router.get('/:slug', getProductoBySlug);
router.get('/id/:id', getProductoById);

// Protected (Seller)
router.post('/', [
    verifyToken,
    isSeller,
    check('nombre', 'Name is required').not().isEmpty(),
    check('precio', 'Price is required').isNumeric(),
    check('idCategoria', 'Category is required').isNumeric(),
    validate
], createProducto);

export default router;
