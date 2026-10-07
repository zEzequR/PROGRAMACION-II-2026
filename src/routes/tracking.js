import { Router } from 'express';
import * as trackingControlador from '../controllers/trackingController.js';
import { JWTVerify } from '../middlewares/auth.js';
import { validateSchemas } from '../middlewares/validators.js';
import * as trackingSchemas from '../schemas/tracking.js';
import { InteraccionEvento } from '../models/eventos.js';

const router = Router();

router.post('/detalle', JWTVerify, validateSchemas(trackingSchemas.registrarDetalle, [InteraccionEvento]),
trackingControlador.registrarDetalle);
router.post('/visita-tienda', JWTVerify, validateSchemas(trackingSchemas.registrarVisitaTienda, [InteraccionEvento]),
trackingControlador.registrarVisitaTienda);
router.post('/carrito', JWTVerify, validateSchemas(trackingSchemas.registrarCarrito, [InteraccionEvento]),
trackingControlador.registrarCarrito);

export default router;
