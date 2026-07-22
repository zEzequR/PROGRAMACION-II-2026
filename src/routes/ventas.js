import { Router } from "express";
import * as ventasControlador from '../controllers/ventasController.js';

const router = Router();

router.post('/crear', ventasControlador.crearVenta);
router.get('/:idVenta', ventasControlador.obtenerVenta);
router.get('/cliente/:idCliente', ventasControlador.obtenerVentasCliente);

export default router;