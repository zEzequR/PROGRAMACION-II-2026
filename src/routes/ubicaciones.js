import { Router } from 'express';
import * as ubicacionesControlador from '../controllers/ubicacionesController.js'

const router = Router();

router.get('/paises', ubicacionesControlador.obtenerTodosPaises)
router.post('/maps', ubicacionesControlador.validarDireccionController)

export default router;