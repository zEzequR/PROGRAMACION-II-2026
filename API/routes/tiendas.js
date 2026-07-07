import { Router } from 'express';
import * as tiendaControlador from '../controllers/TiendasController.js'
import { JWTVerify, verfifyRoles } from '../middlewares/auth.js'
import { ROLES } from '../config/enums.js'

const router = Router();

router.post('/crear', JWTVerify, verfifyRoles([ROLES.USUARIO]) ,tiendaControlador.crearTienda);
router.put('/modificar', JWTVerify, verfifyRoles([ROLES.EMPRENDEDOR]), tiendaControlador.modificarTienda);
router.delete('/eliminar', JWTVerify, verfifyRoles([ROLES.EMPRENDEDOR]), tiendaControlador.eliminarTienda);
router.put('/reactivar', JWTVerify, verfifyRoles([ROLES.EMPRENDEDOR]), tiendaControlador.reactivarTienda);

export default router;