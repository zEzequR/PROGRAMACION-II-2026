import { Router } from 'express';
import * as tiendaControlador from '../controllers/tiendaController.js'

const router = Router();

router.post('/crear', tiendaControlador.crearTienda);
router.put('/modificar', tiendaControlador.modificarTienda)
router.delete('/eliminar', tiendaControlador.eliminarTienda);

export default router;