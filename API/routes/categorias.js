import { Router } from "express";

import * as categoriasControlador from '../controllers/categoriaProdController.js';

const router = Router();

router.post('/crear', categoriasControlador.crearCategoria);
router.get('/obtener', categoriasControlador.obtenerCategorias);

export default router;