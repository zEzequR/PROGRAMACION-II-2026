import { Router } from 'express';
import * as emailController from '../controllers/emailController.js';
import * as middleware from '../middlewares/auth.js';
import { validateSchemas } from '../middlewares/validators.js';
import * as emailSchemas from '../schemas/emails.js';
import { Correo } from '../models/correo.js';
import { Usuario } from '../models/usuario.js';
import { ROLES } from '../config/enums.js';

const router = Router();

router.post('/promocion', middleware.JWTVerify,
    middleware.verfifyRoles([ROLES.EMPRENDEDOR]),
    validateSchemas(emailSchemas.enviarPromocion, [Correo]),
    emailController.enviarPromocion
);
router.post('/password', validateSchemas(emailSchemas.solicitarCodigo, [Usuario]), emailController.solicitarCodigo);

export default router;
