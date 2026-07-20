import { Router } from "express";
import * as detalleVentaControlador from '../controllers/detalleVentaController.js';

const router = Router();

router.post('/agregar', detalleVentaControlador.agregarDetalleVenta);
router.delete('/eliminar', detalleVentaControlador.eliminarDetalleVenta);

export default router;