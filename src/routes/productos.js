import { Router } from "express";
import * as productoControlador from '../controllers/productosController.js';
import { JWTVerify, verfifyRoles } from "../middlewares/auth.js";
import { upload } from '../middlewares/uploads.js';
import { validateSchemas } from '../middlewares/validators.js';
import * as productoSchemas from '../schemas/productos.js';
import { Productos, ProductosFisicos, ProductosDigitales } from '../models/productos.js';
import { AtributoCategoria } from '../models/atributoCategoria.js';
import { EspecificacionProducto } from '../models/especificacionProducto.js';
import { DetalleVenta } from '../models/ventas.js';
import { Usuario } from '../models/usuario.js';
import { Tiendas } from '../models/tiendas.js';
import { ROLES } from '../config/enums.js';

const router = Router();

router.post('/fisicos', JWTVerify, verfifyRoles([ROLES.EMPRENDEDOR]),
upload.fields([{ name: 'imagenProd' }]),
validateSchemas(productoSchemas.crearProductoFisico, [ProductosFisicos, AtributoCategoria, EspecificacionProducto]),
productoControlador.crearProducto);
router.post('/digitales', JWTVerify, verfifyRoles([ROLES.EMPRENDEDOR]),
upload.fields([{ name: 'archivoProd' }, { name: 'imagenProd' }]),
validateSchemas(productoSchemas.crearProductoDigital, [ProductosDigitales, AtributoCategoria, EspecificacionProducto]),
productoControlador.crearProducto);
router.put('/fisicos/:idProducto', JWTVerify, verfifyRoles([ROLES.EMPRENDEDOR]), upload.none(),
validateSchemas(productoSchemas.modificarProductoFisico, [ProductosFisicos, AtributoCategoria, EspecificacionProducto]),
productoControlador.modificarProducto);
router.put('/digitales/:idProducto', JWTVerify, verfifyRoles([ROLES.EMPRENDEDOR]), upload.single('archivoProd'),
validateSchemas(productoSchemas.modificarProductoDigital, [ProductosDigitales, AtributoCategoria, EspecificacionProducto]),
productoControlador.modificarProducto);
router.delete('/', JWTVerify, verfifyRoles([ROLES.EMPRENDEDOR]),
validateSchemas(productoSchemas.eliminarProductos, [[Productos, 'listaProductos']]),
productoControlador.eliminarProducto);
router.patch('/', JWTVerify, verfifyRoles([ROLES.EMPRENDEDOR]),
validateSchemas(productoSchemas.reactivarProductos, [[Productos, 'listaProductos']]),
productoControlador.reactivarProducto);
router.get('/mios', JWTVerify, verfifyRoles([ROLES.EMPRENDEDOR]), productoControlador.obtenerMisProductos);
router.get('/tienda/:idTienda', validateSchemas(productoSchemas.obtenerProductosTienda, [Tiendas]),
productoControlador.obtenerProductosTienda);
router.get('/descargar/:idVenta/:idProducto', JWTVerify,
validateSchemas(productoSchemas.descargarProducto, [DetalleVenta, Usuario]),
productoControlador.descargarProducto);
router.get('/:idProducto', validateSchemas(productoSchemas.obtenerProducto, [Productos]),
productoControlador.obtenerProducto);


export default router;
