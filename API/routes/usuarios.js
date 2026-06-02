import { Router } from 'express';
import * as usuarioControlador from '../controllers/usuarioController.js'

const router = Router();

router.post('/registrarse', usuarioControlador.registrarseManual);
router.post('/login', usuarioControlador.logggearseManual);
router.put('/modificar', usuarioControlador.modificarDatosUsuario);

export default router;