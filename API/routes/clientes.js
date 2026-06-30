import { Router } from "express";

import * as clienteControlador from '../controllers/clienteController.js';

const router = Router();

router.post('/crear', clienteControlador.crearCliente);
router.get('/obtener', clienteControlador.obtenerClientes);

export default router;