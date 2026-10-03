import { Router } from 'express';
import * as categoriasControlador from '../controllers/categoriasController.js';

const router = Router();

router.get('/', categoriasControlador.obtenerCategorias);

export default router;