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

        if (usuario.tipo_auth !== "GOOGLE")
        {
            return res.status(409).json({
                estado: "ERROR",
                mensaje: "Este email ya tiene una cuenta con contraseña. Iniciá sesión con tu contraseña en vez de Google."
            });
        }

        GUsuario.idPersona = usuario.id_persona


        const tokenPayload = {
            idPersona: usuario.id_persona,
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
            tokenPayload.id_tienda = tiendaPersona.id_tienda;
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
            estado: "ERROR",
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
                estado: "ERROR",
                mensaje: "La dirección ingresada no es válida",
                motivo: googleRes.motivo
            });
        }

        ubicacion.placeid = googleRes.datosUbicacion.placeid;
        ubicacion.codigo = googleRes.datosUbicacion.codigo;


        const nuevaPersona = await registrarseManualService(GUsuario, ubicacion, categorias);

        const token = generarToken({
            idPersona: nuevaPersona.id_persona,
            email: nuevaPersona.email,
            nombre: nuevaPersona.nombre,
            apellido: nuevaPersona.apellido,
            telefono: nuevaPersona.telefono,
            rol: ROLES.USUARIO,
            activo: nuevaPersona.activo
        });

        return res.status(201).json({
            estado: "OK",
            mensaje: "Usuario registrado con éxito",
            token
        });
    }
    catch(err)
    {
        return res.status(500).json(
            {
                message: err.message
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
                estado: "ERROR",
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
            estado: "ERROR",
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

        usuario.idPersona = dbRes.id_persona;

        let tokenPayload = {
            idPersona: dbRes.id_persona,
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
            tokenPayload.id_tienda = tiendaPersona.id_tienda;
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
                    Mensaje: err.message
                });
        }

        return res.status(500).json(
            {
                Mensaje: err.message
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
            idPersona: usuario.id_persona,
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
            tokenPayload.id_tienda = tiendaPersona.id_tienda;
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
                ok: false,
                message: 'El código es incorrecto o ya expiró'
            });
        }

        const usuarioEncontrado = await buscarUsuarioPorEmail(usuario);

        if (!usuarioEncontrado)
        {
            return res.status(400).json({ mensaje: 'El código es incorrecto o ya expiró' });
        }

        usuario.idPersona = usuarioEncontrado.id_persona;
        usuario.psw = await hashPsw(usuario.psw);

        await cambiarPswUsuario(usuario);

        return res.status(200).json({
            message: "Funcionó paaa"
        })
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

        return res.status(200).json({
            perfil: {
                idPersona: datos.id_persona,
                email: datos.email,
                nombre: datos.nombre,
                apellido: datos.apellido,
                telefono: datos.telefono,
                direccion: datos.direccion,
                piso: datos.piso,
                depto: datos.depto,
                pais: datos.pais,
                provincia: datos.provincia,
                ciudad: datos.ciudad,
                codigo: datos.codigo
            }
        });
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
