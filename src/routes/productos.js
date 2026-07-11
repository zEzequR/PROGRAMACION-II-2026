import { Router } from "express";

import { crearProducto, eliminarProducto,
    modificarProducto, reactivarProducto, crearEspecificacionesAtributos } from '../controllers/productosController.js'
import { JWTVerify, verfifyRoles } from "../middlewares/auth.js";
import { ROLES } from '../config/enums.js'

const router = Router();

router.post('/crear', JWTVerify, verfifyRoles([ROLES.EMPRENDEDOR]) ,crearProducto);
router.put('/modificar/:idProd', JWTVerify, verfifyRoles([ROLES.EMPRENDEDOR]), modificarProducto);
router.delete('/eliminar/:idProd', JWTVerify, verfifyRoles([ROLES.EMPRENDEDOR]), eliminarProducto);
router.put('/reactivar/:idProd', JWTVerify, verfifyRoles([ROLES.EMPRENDEDOR]), reactivarProducto);
router.post('/especificaciones/crear/:idProd', JWTVerify, verfifyRoles([ROLES.EMPRENDEDOR]), crearEspecificacionesAtributos)

export default router;