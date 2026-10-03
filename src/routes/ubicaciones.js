import { Router } from 'express';
import * as ubicacionesControlador from '../controllers/ubicacionesController.js'
import { validateSchemas } from '../middlewares/validators.js'
import * as ubicacionSchemas from '../schemas/ubicaciones.js'
import { Ubicaciones } from '../models/ubicaciones.js'

const router = Router();

router.get('/paises', ubicacionesControlador.obtenerTodosPaises)
router.post('/maps', validateSchemas(ubicacionSchemas.validarDireccion, [Ubicaciones]),
ubicacionesControlador.validarDireccionController)

export default router;
