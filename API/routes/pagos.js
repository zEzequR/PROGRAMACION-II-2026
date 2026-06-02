import { Router } from "express";

import * as pagoControlador from '../controllers/pagoController.js';

const router = Router();

router.post('/pagar', pagoControlador.realizarPago);
router.get('/detallespago', pagoControlador.obtenerDetallesPago);

export default router;