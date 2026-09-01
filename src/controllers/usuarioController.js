import { registrarseManualService, autenticarUsuarioService, obtenerIdTienda, cambiarPswUsuario } from "../services/usuarioService.js";
import { validarDireccion, obtenerPaisesDisponibles } from '../services/api/googleMapsService.js'
import { guardarUbicacionService, actualizarUbicacionService } from '../services/ubicacionesService.js'
import { generarToken } from "../utils/generarToken.js";
import { Usuario } from "../models/usuario.js";
import  { Ubicaciones } from '../models/ubicaciones.js';
import { ROLES } from "../config/enums.js";
import { hashPsw } from '../utils/password.js'
import { verifyResetCode } from '../utils/generarCodigo.js'


export async function registrarseManual(req, res)
{
    try
    {
        const
        {
            email,
            psw,
            tipoAuth,
            nombre,
            apellido,
            telefono,
            direccion,
            piso,
            depto,
            pais,
            provincia,
            ciudad,
            codigo
        } = req.body;

        const ubicacion = new Ubicaciones({
            direccion,
            piso,
            depto,
            pais,
            provincia,
            ciudad,
            codigo
        });

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

        const dbResUbicaciones = await guardarUbicacionService(ubicacion);

        let usuario = new Usuario(
            {
                email,
                psw: await hashPsw(psw),
                tipoAuth,
                nombre,
                apellido,
                telefono,
                idUbicacion: dbResUbicaciones
            }
        );

        await registrarseManualService(usuario);

        return res.status(201).end();

    }
    catch(err)
    {
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
        if (!req.email || !req.psw)
        {
            throw new Error("Faltan campos obligatorios");
        }
        else
        {
            let usuario = new Usuario(
                {
                    email: req.email,
                    psw: req.psw,
                    tipoAuth: "MANUAL"
                }
                );
            const dbRes = await autenticarUsuarioService(usuario);
            const idTienda = await obtenerIdTienda(dbRes.id_persona);
            
            let tokenPayload = {
                id: dbRes.id_persona,
                email: req.email,
                nombre: dbRes.nombre,
                apellido: dbRes.apellido,
                telefono: dbRes.telefono,
                rol: ROLES.USUARIO
            };

            if (idTienda)
            {
                tokenPayload.rol = ROLES.EMPRENDEDOR;
                tokenPayload.id_tienda = idTienda;
            }

            const token = generarToken(tokenPayload);

            return res.status(200).json(
            {
                token: token
            });
        }
    }
    catch(err)
    {
        if (err.message === "Faltan campos obligatorios")
        {
            return res.status(400).end();
        }

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
//VER ESTO
{
    try
    {
        const
        {
            email,
            nombre,
            apellido,
            telefono,
            localidad
        } = req.body

        const dbRes = actualizarUbicacionService(ubicacion);

        return res.status(200).end();
    }
    catch(err)
    {
        return res.status(500).end();
    };
}

export async function codigoRecuperarPsw(req, res)
{
    const 
    {
        email,
        codigo,
        psw
    } = req.body;

    try
    {
        let usuario = new Usuario(
        {
            email: email,
        }
        );

        const esValido = verifyResetCode(usuario, codigo);

        if (!esValido) {
            return res.status(400).json({
                ok: false,
                message: 'El código es incorrecto o ya expiró'
            });
        }

        usuario.id_persona = await obtenerIDUsuario(usuario.email);
        usuario.psw = await hashPsw(psw);
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