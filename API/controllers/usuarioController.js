import { registrarseManualService, autenticarUsuarioService, obtenerIdTienda } from "../services/usuarioService.js";
import { generarToken } from "../utils/generarToken.js";
import { Usuario } from "../models/usuario.js";
import { ROLES } from "../config/enums.js";
import { hashPsw } from '../utils/password.js'


export async function registrarseManual(req, res)
{
    try
    {
        const
        {
            id,
            email,
            psw,
            tipoAuth,
            nombre,
            apellido,
            telefono
        } = req.body;
        let usuario = new Usuario
        (
            null,
            email,
            await hashPsw(psw),
            tipoAuth,
            nombre,
            apellido,
            telefono,
            true
        );
        const dbRes = await registrarseManualService(usuario);

        if(dbRes)
        {
            return res.status(201).json(
            {
                estado: "OK",
                mensaje: "Usuario registrado correctamente",
                usuario: dbRes
            });
        }

        return res.status(500).json(
        {
            estado: "ERROR",
            mensaje: "No se pudo registrar al usuario"
        });
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

export async function registrarseGoogle(req, res)
{
    try
    {
        //const resGoogle = await fetch("API GOOGLE");
        
        //resGoogle.json();
    }
    catch(err)
    {
        return res.status(500).json(
            {
                estado: "ERROR",
                mensaje: err.menssage
            });
    };
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
            let usuario = new Usuario
            (
                null,
                req.email,
                req.psw,
                null,
                null,
                null,
                null,
                null
            );

            const dbRes = await autenticarUsuarioService(usuario.email, usuario.psw);
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
                estado: "OK",
                mensaje: "Loggeado en el sistema correctamente",
                token
            })
        }
    }
    catch(err)
    {
        if (err.message === "Faltan campos obligatorios")
        {
            return res.status(400).json({
                estado: "ERROR",
                mensaje: err.message
            });
        }

        if (err.message === "Credenciales inválidas")
        {
            return res.status(401).json({
                estado: "ERROR",
                mensaje: "Email o contraseña incorrectos"
            });
        }

        return res.status(500).json({
            estado: "ERROR",
            mensaje: "Hubo un error en el servidor: " + err.message
        });
    }
}

export async function loggearseGoogle(req, res)
{
    try
    {
        //const resGoogle = await fetch("API GOOGLE");
        
        //resGoogle.json();
    }
    catch(err)
    {
        return res.status(500).json(
            {
                estado: "ERROR",
                mensaje: err.menssage
            });
    };
}

export async function modificarDatosUsuario(req, res)
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

        if (!email)
        {
            return res.status(400).json(
            {
                estado : "ERROR",
                mensaje : "El email es obligatorio para identificar al usuario"
            })
        }

        if (!nombre && !apellido && !telefono && !localidad)
        {
            return res.status(400).json(
            {
                estado : "ERROR",
                mensaje : "Debe modificar al menos un campo"
            });
        }

        return res.status(200).json(
        {
            estado : "OK",
            mensaje : "Datos del usuario modificados con éxito",
            cliente :
            {
                email,
                nombre,
                apellido,
                telefono,
                localidad
            }
        });
    }
    catch(err)
    {
        return res.status(500).json(
        {
            estado : "ERROR",
            mensaje : err.message
        });
    };
}
