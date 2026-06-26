import { Router } from 'express';
import * as usuarioControlador from '../controllers/usuarioController.js'
import * as middleware from '../middlewares/auth.js'

const router = Router();

router.post('/registrarse', usuarioControlador.registrarseManual);
router.post('/login', usuarioControlador.logggearseManual);
router.put('/modificar', middleware.userAuth('JWT'), usuarioControlador.modificarDatosUsuario);

export default router;