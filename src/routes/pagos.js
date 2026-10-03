import { Router } from "express";
import * as mercadoPagoControlador from '../controllers/mercadoPagoController.js';
import { JWTVerify } from '../middlewares/auth.js';
import { validateSchemas } from '../middlewares/validators.js';
import * as pagoSchemas from '../schemas/pagos.js';
import { Ventas } from '../models/ventas.js';
import { Usuario } from '../models/usuario.js';

const router = Router();

router.post('/webhook', mercadoPagoControlador.webhookMercadoPago);
router.post('/procesar-pago', JWTVerify, validateSchemas(pagoSchemas.procesarPago, [Ventas, Usuario]),
mercadoPagoControlador.crearOrden);

export default router;