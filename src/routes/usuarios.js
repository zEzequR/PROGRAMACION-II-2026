import { Router } from 'express';
import * as usuarioControlador from '../controllers/usuarioController.js'
import * as middleware from '../middlewares/auth.js'
import { validateSchemas } from '../middlewares/validators.js'
import { soloIdPersona, loginManual, loginGoogle, registroManual, registroGoogle,
    modificarUsuario, recuperarPsw } from '../schemas/usuarios.js'
import { Usuario } from '../models/usuario.js'
import { Ubicaciones } from '../models/ubicaciones.js'
import { Categoria } from '../models/categorias.js'
import { ROLES } from '../config/enums.js'

const router = Router();

router.post('/', validateSchemas(registroManual, [Usuario, Ubicaciones, [Categoria, 'categoriasInteres', 'idCategoria']]),
usuarioControlador.registrarseManual);
router.post('/login', middleware.basicAuth, validateSchemas(loginManual, [Usuario]),
usuarioControlador.logggearseManual);
router.post('/auth/google', middleware.verificarTokenGoogle, validateSchemas(loginGoogle, [Usuario]),
usuarioControlador.loggearseGoogle);
router.post('/auth/google/registro', middleware.verificarTokenGoogle,
validateSchemas(registroGoogle, [Usuario, Ubicaciones, [Categoria, 'categoriasInteres', 'idCategoria']]),
usuarioControlador.registrarseGoogle);
router.put('/', middleware.JWTVerify, middleware.verfifyRoles([ROLES.USUARIO, ROLES.EMPRENDEDOR]),
validateSchemas(modificarUsuario, [Usuario, Ubicaciones, [Categoria, 'categoriasInteres', 'idCategoria']]),
usuarioControlador.modificarDatosUsuario);
router.put('/password', validateSchemas(recuperarPsw, [Usuario]), usuarioControlador.codigoRecuperarPsw);
router.delete('/', middleware.JWTVerify, validateSchemas(soloIdPersona, [Usuario]), usuarioControlador.desactivarCuenta);
router.patch('/reactivar', middleware.JWTVerifySinActivo, validateSchemas(soloIdPersona, [Usuario]),
usuarioControlador.reactivarCuenta);
router.get('/', middleware.JWTVerify, validateSchemas(soloIdPersona, [Usuario]), usuarioControlador.obtenerMisIntereses);
router.get('/perfil', middleware.JWTVerify, validateSchemas(soloIdPersona, [Usuario]), usuarioControlador.obtenerPerfil);

export default router;
