import { Router } from "express";

import * as usuarioControlador from '../controllers/usuarioController.js';

const router = Router();

router.post('/crear', clienteControlador.crearCliente);
router.get('/obtener', clienteControlador.obtenerClientes);

export default router;