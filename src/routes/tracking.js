import { Router } from 'express';
import * as trackingControlador from '../controllers/trackingController.js';
import { JWTVerify } from '../middlewares/auth.js';
import { validateSchemas } from '../middlewares/validators.js';
import * as trackingSchemas from '../schemas/tracking.js';
import { InteraccionEvento } from '../models/eventos.js';

const router = Router();

router.post('/vista', JWTVerify, validateSchemas(trackingSchemas.registrarVista, [InteraccionEvento]),
trackingControlador.registrarVista);
router.post('/click', JWTVerify, validateSchemas(trackingSchemas.registrarClick, [InteraccionEvento]),
trackingControlador.registrarClick);

export default router;
