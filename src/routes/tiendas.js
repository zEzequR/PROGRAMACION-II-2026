import { Router } from 'express';
import * as tiendaControlador from '../controllers/TiendasController.js'
import * as estadisticasControlador from '../controllers/estadisticasController.js'
import { JWTVerify, verfifyRoles } from '../middlewares/auth.js'
import { upload } from '../middlewares/uploads.js'
import { validateSchemas } from '../middlewares/validators.js'
import * as tiendasSchemas from '../schemas/tiendas.js'
import { Tiendas } from '../models/tiendas.js'
import { Emprendedor, Usuario } from '../models/usuario.js'
import { ROLES } from '../config/enums.js'
import { Filtros } from '../models/filtros.js'

const router = Router();

router.post('/', JWTVerify, verfifyRoles([ROLES.USUARIO]), upload.single('logoTienda'),
validateSchemas(tiendasSchemas.crearTienda, [Emprendedor, Tiendas]), tiendaControlador.crearTienda);
router.put('/', JWTVerify, verfifyRoles([ROLES.EMPRENDEDOR]), upload.single('logoTienda'),
validateSchemas(tiendasSchemas.modificarTienda, [Tiendas]), tiendaControlador.modificarTienda);
router.delete('/', JWTVerify, verfifyRoles([ROLES.EMPRENDEDOR]), tiendaControlador.eliminarTienda);
router.patch('/', JWTVerify, verfifyRoles([ROLES.USUARIO, ROLES.EMPRENDEDOR]),
validateSchemas(tiendasSchemas.reactivarTienda, [Usuario]), tiendaControlador.reactivarTienda);
router.get('/:idTienda/estadisticas', JWTVerify, verfifyRoles([ROLES.EMPRENDEDOR]),
validateSchemas(tiendasSchemas.obtenerEstadisticas, [Tiendas, Filtros]), estadisticasControlador.obtenerEstadisticas);
router.get('/:idTienda/estadisticas/csv', JWTVerify, verfifyRoles([ROLES.EMPRENDEDOR]),
validateSchemas(tiendasSchemas.obtenerEstadisticas, [Tiendas, Filtros]), estadisticasControlador.descargarEstadisticasCsv);
router.get('/:idTienda/mp-public-key', validateSchemas(tiendasSchemas.obtenerPublicKey, [Tiendas]),
tiendaControlador.obtenerPublicKey);
router.get('/', JWTVerify, verfifyRoles([ROLES.EMPRENDEDOR]), tiendaControlador.obtenerMiTienda);
router.get('/seguidas', JWTVerify, verfifyRoles([ROLES.USUARIO, ROLES.EMPRENDEDOR]), tiendaControlador.obtenerTiendasSeguidas);
router.post('/seguir/:idTienda', JWTVerify, verfifyRoles([ROLES.USUARIO, ROLES.EMPRENDEDOR]),
validateSchemas(tiendasSchemas.seguirTienda, [Tiendas, Usuario]), tiendaControlador.seguirTienda);
router.delete('/seguir/:idTienda', JWTVerify, verfifyRoles([ROLES.USUARIO, ROLES.EMPRENDEDOR]),
validateSchemas(tiendasSchemas.seguirTienda, [Tiendas, Usuario]), tiendaControlador.dejarDeSeguirTienda);
router.get('/:idTienda', validateSchemas(tiendasSchemas.obtenerTienda, [Tiendas]),
tiendaControlador.obtenerTiendaPublica);

export default router;