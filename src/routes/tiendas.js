import { Router } from 'express';
import * as tiendaControlador from '../controllers/TiendasController.js'
import { JWTVerify, verfifyRoles } from '../middlewares/auth.js'
import { ROLES } from '../config/enums.js'

const router = Router();

router.post('/', JWTVerify, verfifyRoles([ROLES.USUARIO]) ,tiendaControlador.crearTienda);
router.put('/', JWTVerify, verfifyRoles([ROLES.EMPRENDEDOR]), tiendaControlador.modificarTienda);
router.delete('/', JWTVerify, verfifyRoles([ROLES.EMPRENDEDOR]), tiendaControlador.eliminarTienda);
router.patch('/', JWTVerify, verfifyRoles([ROLES.EMPRENDEDOR]), tiendaControlador.reactivarTienda);

export default router;