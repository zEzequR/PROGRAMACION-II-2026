import { Router } from 'express';
import * as usuarioControlador from '../controllers/usuarioController.js'
import * as middleware from '../middlewares/auth.js'
import { ROLES } from '../config/enums.js'

const router = Router();

router.post('/', usuarioControlador.registrarseManual);
router.post('/login', middleware.basicAuth,
usuarioControlador.logggearseManual);
router.put('/', middleware.JWTVerify,
middleware.verfifyRoles(ROLES.USUARIO),
usuarioControlador.modificarDatosUsuario);
router.put('/password', usuarioControlador.codigoRecuperarPsw);

export default router;