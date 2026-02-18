import express from 'express';
import { getProvincias, getCiudadesByProvincia } from '../controllers/ubicacion.controller.js';

const router = express.Router();

router.get('/provinces', getProvincias);
router.get('/cities/:idProvincia', getCiudadesByProvincia);

export default router;
