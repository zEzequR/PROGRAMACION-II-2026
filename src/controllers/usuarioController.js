import { registrarseManualService, autenticarUsuarioService,
    buscarUsuarioPorEmail, buscarUsuarioPorId,
    cambiarPswUsuario,
    cambiarActivoUsuarioService, modificarUsuarioService } from "../services/usuarioService.js";
import { buscarTiendaPorPersona } from "../services/tiendasService.js";
import { validarDireccion } from '../services/api/googleMapsService.js'
import { obtenerInteresesService } from "../services/interesesService.js";
import { generarToken } from "../utils/generarToken.js";
import { ROLES } from "../config/enums.js";
import { hashPsw } from '../utils/password.js'
import { verifyResetCode } from '../utils/generarCodigo.js'

export async function loggearseGoogle(req, res) {
    try
    {
        const [GUsuario] = req.models;

        let usuario = await buscarUsuarioPorEmail(GUsuario);

        if (!usuario)
        {
            return res.status(200).json({ necesitaRegistro: true })
        }

        if (usuario.tipoAuth !== "GOOGLE")
        {
            return res.status(409).json({
                
                mensaje: "Este email ya tiene una cuenta con contraseña. Iniciá sesión con tu contraseña en vez de Google."
            });
        }

        GUsuario.idPersona = usuario.idPersona


        const tokenPayload = {
            idPersona: usuario.idPersona,
            email: usuario.email,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            telefono: usuario.telefono,
            rol: ROLES.USUARIO,
            activo: usuario.activo
        };

        const tiendaPersona = await buscarTiendaPorPersona(GUsuario);

        if (tiendaPersona && tiendaPersona.activo)
        {
            tokenPayload.rol = ROLES.EMPRENDEDOR;
            tokenPayload.id_tienda = tiendaPersona.idTienda;
        }


        const token = generarToken(tokenPayload);

        return res.status(200).json({
            necesitaRegistro: false,
            token
        });

    }
    catch (err)
    {
        return res.status(500).json({
            
            mensaje: err.message
        });
    }
}

export async function registrarseGoogle(req, res)
{
    try
    {
        const [GUsuario, ubicacion, categorias] = req.models;

        const googleRes = await validarDireccion(ubicacion);

        if (!googleRes.esValida) {
            return res.status(400).json({
                
                mensaje: "La dirección ingresada no es válida",
                motivo: googleRes.motivo
            });
        }

        ubicacion.placeid = googleRes.datosUbicacion.placeid;
        ubicacion.codigo = googleRes.datosUbicacion.codigo;


        const nuevaPersona = await registrarseManualService(GUsuario, ubicacion, categorias);

        const token = generarToken({
            idPersona: nuevaPersona.idPersona,
            email: nuevaPersona.email,
            nombre: nuevaPersona.nombre,
            apellido: nuevaPersona.apellido,
            telefono: nuevaPersona.telefono,
            rol: ROLES.USUARIO,
            activo: nuevaPersona.activo
        });

        return res.status(201).json({
            mensaje: "Usuario registrado con éxito",
            token
        });
    }
    catch(err)
    {
        return res.status(500).json(
            {
                mensaje: err.message
            })
    }
}

export async function registrarseManual(req, res)
{
    try
    {
        const [usuario, ubicacion, categorias] = req.models;

        const googleRes = await validarDireccion(ubicacion);

        if (!googleRes.esValida) {
            return res.status(400).json({
                
                mensaje: "La dirección ingresada no es válida",
                motivo: googleRes.motivo
            });
        }

        ubicacion.placeid = googleRes.datosUbicacion.placeid;
        ubicacion.codigo = googleRes.datosUbicacion.codigo;
        usuario.psw = await hashPsw(usuario.psw);

        await registrarseManualService(usuario, ubicacion, categorias);

        return res.status(201).end();
    }
    catch(err)
    {
        if (err.message === "El email ya está registrado")
        {
            return res.status(409).json({ mensaje: err.message });
        }
        return res.status(500).json(
        {
            
            mensaje: err.message
        });
    }
}

export async function logggearseManual(req, res)
{
    try
    {
        const [usuario] = req.models;

        console.log(usuario.psw);

        const dbRes = await autenticarUsuarioService(usuario);

        usuario.idPersona = dbRes.idPersona;

        let tokenPayload = {
            idPersona: dbRes.idPersona,
            email: usuario.email,
            nombre: dbRes.nombre,
            apellido: dbRes.apellido,
            telefono: dbRes.telefono,
            rol: ROLES.USUARIO,
            activo: dbRes.activo
        };

        const tiendaPersona = await buscarTiendaPorPersona(usuario);


        if (tiendaPersona && tiendaPersona.activo)
        {
            tokenPayload.rol = ROLES.EMPRENDEDOR;
            tokenPayload.id_tienda = tiendaPersona.idTienda;
        }


        const token = generarToken(tokenPayload);

        return res.status(200).json(
        {
            token: token
        });
    }
    catch(err)
    {
        if (err.message === "Credenciales inválidas")
        {
            return res.status(401).json(
                {
                    mensaje: err.message
                });
        }

        return res.status(500).json(
            {
                mensaje: err.message
            });
    }
}

export async function modificarDatosUsuario(req, res)
{
    try
    {
        const [usuario, ubicacionRecibida, categorias] = req.models;
        let ubicacion;

        if (Object.keys(ubicacionRecibida).length > 0)
        {
            ubicacion = ubicacionRecibida;
        }

        await modificarUsuarioService(usuario, ubicacion, categorias);
        return res.status(200).end();
    }
    catch(err)
    {
        return res.status(500).end();
    }
}

export async function desactivarCuenta(req, res)
{
    try
    {
        const [usuario] = req.models;
        usuario.activo = false;

        await cambiarActivoUsuarioService(usuario);

        return res.status(200).end();
    }
    catch (err)
    {
        return res.status(500).json({ mensaje: err.message });
    }
}

export async function reactivarCuenta(req, res)
{
    try
    {
        const [usuarioReactivar] = req.models;
        usuarioReactivar.activo = true;

        const usuario = await cambiarActivoUsuarioService(usuarioReactivar);


        let tokenPayload = {
            idPersona: usuario.idPersona,
            email: usuario.email,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            telefono: usuario.telefono,
            rol: ROLES.USUARIO,
            activo: true
        };

        const tiendaPersona = await buscarTiendaPorPersona(usuarioReactivar);


        if (tiendaPersona && tiendaPersona.activo)
        {
            tokenPayload.rol = ROLES.EMPRENDEDOR;
            tokenPayload.id_tienda = tiendaPersona.idTienda;
        }


        return res.status(200).json(
            {
                token: generarToken(tokenPayload)
            });
    }
    catch (err)
    {
        return res.status(500).json({ mensaje: err.message });
    }
}

export async function codigoRecuperarPsw(req, res)
{
    try
    {
        const [usuario] = req.models;
        const codigo = req.body.codigo;

        const esValido = verifyResetCode(usuario, codigo);

        if (!esValido) {
            return res.status(400).json({
                mensaje: 'El código es incorrecto o ya expiró'
            });
        }

        const usuarioEncontrado = await buscarUsuarioPorEmail(usuario);

        if (!usuarioEncontrado)
        {
            return res.status(400).json({ mensaje: 'El código es incorrecto o ya expiró' });
        }

        usuario.idPersona = usuarioEncontrado.idPersona;
        usuario.psw = await hashPsw(usuario.psw);

        await cambiarPswUsuario(usuario);

        return res.status(200).end();
    }
    catch(err)
    {
        return res.status(500).end();
    }
}

export async function obtenerPerfil(req, res)
{
    try
    {
        const [usuario] = req.models;

        const datos = await buscarUsuarioPorId(usuario);

        if (!datos)
        {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        return res.status(200).json({ perfil: datos });

    }
    catch (err)
    {
        return res.status(500).json({ mensaje: err.message });
    }
}

export async function obtenerMisIntereses(req, res)
{
    try
    {
        const [usuario] = req.models;

        const intereses = await obtenerInteresesService(usuario);
        return res.status(200).json({ intereses });
    }
    catch (err)
    {
        return res.status(500).json({ mensaje: err.message });
    }
}
