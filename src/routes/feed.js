import { Router } from 'express';
import * as feedControlador from '../controllers/feedController.js'
import { intentarJWT } from '../middlewares/auth.js';
import { validateSchemas } from '../middlewares/validators.js';
import * as feedSchemas from '../schemas/feed.js';
import { Usuario } from '../models/usuario.js';
import { Filtros } from '../models/filtros.js';

const router = Router();

router.get('/', intentarJWT, validateSchemas(feedSchemas.obtenerFeed, [Usuario, Filtros]), feedControlador.obtenerFeed);

export default router;
