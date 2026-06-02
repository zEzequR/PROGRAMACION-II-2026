import { Router } from "express";

import * as ventasControlador from '../controllers/ventaController.js';

const router = Router();

router.post('/crear', ventasControlador.crearVenta);
router.get('/obtener', ventasControlador.obtenerVentas);
router.get('/detalleventa', ventasControlador.obtenerDetalleVenta);

export default router;