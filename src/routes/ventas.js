import { Router } from "express";
import * as ventasControlador from '../controllers/ventasController.js';
import * as middleware from '../middlewares/auth.js';
import { validateSchemas } from '../middlewares/validators.js';
import * as ventaSchemas from '../schemas/ventas.js';
import { Ventas, DetalleVenta } from '../models/ventas.js';
import { Cliente, Usuario } from '../models/usuario.js';
import { Tiendas } from '../models/tiendas.js';
import { cuponesDescuentos } from '../models/cuponesDescuentos.js';

const router = Router();

router.post('/crear', middleware.JWTVerify,
validateSchemas(ventaSchemas.crearVenta, [Tiendas, Cliente, [DetalleVenta, 'items'], cuponesDescuentos]),
ventasControlador.crearVenta);
router.get('/mis-compras', middleware.JWTVerify,
validateSchemas(ventaSchemas.obtenerMisCompras, [Usuario]),
ventasControlador.obtenerMisCompras);
router.get('/:idVenta', middleware.JWTVerify,
validateSchemas(ventaSchemas.obtenerVenta, [Ventas, Usuario]),
ventasControlador.obtenerVenta);
router.get('/:idVenta/estado', middleware.JWTVerify,
validateSchemas(ventaSchemas.obtenerEstadoVenta, [Ventas, Usuario]),
ventasControlador.obtenerEstadoVenta);
router.get('/cliente/:idCliente', middleware.JWTVerify,
validateSchemas(ventaSchemas.obtenerVentasCliente, [Ventas, Usuario]),
ventasControlador.obtenerVentasCliente);

export default router;
