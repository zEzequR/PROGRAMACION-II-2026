import { Router } from "express";

import { crearCupon, crearProducto, eliminarProducto,
    modificarProducto, reactivarProducto, crearEspecificacionesAtributos } from '../controllers/productosController.js'
import { JWTVerify, verfifyRoles } from "../middlewares/auth.js";
import { ROLES } from '../config/enums.js'

const router = Router();

router.post('/crear', JWTVerify, verfifyRoles([ROLES.EMPRENDEDOR]) ,crearProducto);
router.put('/modificar', JWTVerify, verfifyRoles([ROLES.EMPRENDEDOR]), modificarProducto);
router.delete('/eliminar', JWTVerify, verfifyRoles([ROLES.EMPRENDEDOR]), eliminarProducto);
router.put('/reactivar', JWTVerify, verfifyRoles([ROLES.EMPRENDEDOR]), reactivarProducto);
router.post('/crear/cupon', JWTVerify, verfifyRoles([ROLES.EMPRENDEDOR]), crearCupon);
router.post('/especificaciones/crear', JWTVerify, verfifyRoles([ROLES.EMPRENDEDOR]), crearEspecificacionesAtributos)

export default router;