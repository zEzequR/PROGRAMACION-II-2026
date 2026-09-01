import { Router } from "express";
import { crearProducto, eliminarProducto,
    modificarProducto, reactivarProducto, crearEspecificacionesAtributos, 
    descargarProducto} from '../controllers/productosController.js';
import multer from 'multer';
import { JWTVerify, verfifyRoles } from "../middlewares/auth.js";
import { ROLES } from '../config/enums.js';
import { upload } from '../middlewares/uploads.js';

const router = Router();

router.post('/', JWTVerify, verfifyRoles([ROLES.EMPRENDEDOR]),upload.single('archivoProd') ,crearProducto);
router.put('/:idProd', JWTVerify, verfifyRoles([ROLES.EMPRENDEDOR]), modificarProducto);
router.delete('/', JWTVerify, verfifyRoles([ROLES.EMPRENDEDOR]), eliminarProducto);
router.patch('/', JWTVerify, verfifyRoles([ROLES.EMPRENDEDOR]), reactivarProducto);
router.post('/especificaciones', JWTVerify, verfifyRoles([ROLES.EMPRENDEDOR]), crearEspecificacionesAtributos)
router.post('/prodDigitalDrive', upload.single('archivoProd'), JWTVerify, verfifyRoles([ROLES.EMPRENDEDOR]), crearProducto);

// ==== Rutas nuevas /v2 (flujo completo con AWS S3) para probar ====
router.post('/v2', JWTVerify, verfifyRoles([ROLES.EMPRENDEDOR]), upload.single('archivoProd'), crearProducto);
router.put('/v2/:idProd', JWTVerify, verfifyRoles([ROLES.EMPRENDEDOR]), upload.single('archivoProd'), modificarProducto);
router.delete('/v2', JWTVerify, verfifyRoles([ROLES.EMPRENDEDOR]), eliminarProducto);
router.patch('/v2', JWTVerify, verfifyRoles([ROLES.EMPRENDEDOR]), reactivarProducto);
router.get('/v2/descargar/:idVenta/:idProducto', JWTVerify, descargarProducto);
// ================================================================


export default router;