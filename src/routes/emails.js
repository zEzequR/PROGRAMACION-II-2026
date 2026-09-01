import { Router } from 'express';
import * as emailController from '../controllers/emailController.js';
import * as middleware from '../middlewares/auth.js';
import { ROLES } from '../config/enums.js';

const router = Router();

router.post('/promocion', middleware.JWTVerify,
    middleware.verfifyRoles(ROLES.EMPRENDEDOR),
    emailController.enviarPromocion
);
router.post('/password', emailController.solicitarCodigo);

export default router;