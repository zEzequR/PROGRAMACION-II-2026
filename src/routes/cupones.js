import { Router } from "express";
import * as cuponesControlador from '../controllers/cuponController.js';
import { JWTVerify, verfifyRoles } from "../middlewares/auth.js";
import { validateSchemas } from '../middlewares/validators.js';
import * as cuponSchemas from '../schemas/cupones.js';
import { cuponesDescuentos, cuponesDescuentosProductos } from '../models/cuponesDescuentos.js';
import { ROLES } from '../config/enums.js'

const router = Router();

router.post('/', JWTVerify, verfifyRoles([ROLES.EMPRENDEDOR]),
validateSchemas(cuponSchemas.crearCupon, [cuponesDescuentos, cuponesDescuentosProductos]),
cuponesControlador.crearCupon);
router.put('/:idCuponDesc', JWTVerify, verfifyRoles([ROLES.EMPRENDEDOR]),
validateSchemas(cuponSchemas.modificarCupon, [cuponesDescuentos, cuponesDescuentosProductos]),
cuponesControlador.modificarCupon);
router.delete('/:idCuponDesc', JWTVerify, verfifyRoles([ROLES.EMPRENDEDOR]),
validateSchemas(cuponSchemas.eliminarCupon, [cuponesDescuentos]),
cuponesControlador.eliminarCupon);

router.get('/', JWTVerify, verfifyRoles([ROLES.EMPRENDEDOR]), cuponesControlador.obtenerCuponesTienda);


export default router;
