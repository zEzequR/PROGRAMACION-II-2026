import { Router } from "express";
import * as pagosControlador from '../controllers/pagosController.js';


const router = Router();

router.post('/crear', pagosControlador.crearPago);
router.put('/actualizar', pagosControlador.actualizarPago);
router.post('/webhook', pagosControlador.webhookMercadoPago);
router.post('/procesar-pago', pagosControlador.procesarPagoBrick);
router.get('/tarjetas/:idCliente', pagosControlador.obtenerTarjetas);
router.post('/tarjeta-guardada', pagosControlador.procesarPagoTarjetaGuardada);
router.post('/preferencia', pagosControlador.crearPreferencia);

export default router;