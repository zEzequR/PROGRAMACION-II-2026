import { Router } from 'express';
import * as usuarioControlador from '../controllers/usuarioController.js'
import * as middleware from '../middlewares/auth.js'
import { ROLES } from '../config/enums.js'

const router = Router();

router.post('/registrarse', usuarioControlador.registrarseManual);
router.post('/login', middleware.basicAuth,
usuarioControlador.logggearseManual);
router.put('/modificar', middleware.JWTVerify,
middleware.verfifyRoles(ROLES.USUARIO),
usuarioControlador.modificarDatosUsuario);

export default router;