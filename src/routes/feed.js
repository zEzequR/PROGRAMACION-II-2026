import { Router } from 'express';
import * as feedControlador from '../controllers/feedController.js'
import { intentarJWT } from '../middlewares/auth.js';
import { validateSchemas } from '../middlewares/validators.js';
import * as feedSchemas from '../schemas/feed.js';

const router = Router();

router.get('/', intentarJWT, validateSchemas(feedSchemas.obtenerFeed), feedControlador.obtenerFeed);

export default router;
