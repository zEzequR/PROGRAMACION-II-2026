import { Router } from "express";
import * as cuponesControlador from '../controllers/cuponController.js';
import { JWTVerify, verfifyRoles } from "../middlewares/auth.js";
import { ROLES } from '../config/enums.js'

const router = Router();

router.post('/crear', JWTVerify, verfifyRoles([ROLES.EMPRENDEDOR]), cuponesControlador.crearCupon);
router.put('/modificar/:idCupon', JWTVerify, verfifyRoles([ROLES.EMPRENDEDOR]), cuponesControlador.modificarCupon);
router.delete('/eliminar/:idCupon', JWTVerify, verfifyRoles([ROLES.EMPRENDEDOR]), cuponesControlador.eliminarCupon);

export default router;