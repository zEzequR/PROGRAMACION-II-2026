import { Router } from "express";
import * as mercadoPagoControlador from '../controllers/mercadoPagoController.js';
import * as middleware from '../middlewares/auth.js';
import { ROLES } from '../config/enums.js';
import { validateSchemas } from '../middlewares/validators.js';
import * as pagoSchemas from '../schemas/pagos.js';
import { Ubicaciones } from '../models/ubicaciones.js';

const router = Router();

router.get('/conectar', middleware.JWTVerify, middleware.verfifyRoles([ROLES.EMPRENDEDOR]), mercadoPagoControlador.conectarMercadoPago);
router.get('/callback', mercadoPagoControlador.callbackMercadoPago);
router.get('/conectar-qr', middleware.JWTVerify, middleware.verfifyRoles([ROLES.EMPRENDEDOR]),
validateSchemas(pagoSchemas.conectarMercadoPagoQr, [Ubicaciones]), mercadoPagoControlador.conectarMercadoPagoQr);
router.get('/callback-qr', mercadoPagoControlador.callbackMercadoPagoQr);

export default router;
