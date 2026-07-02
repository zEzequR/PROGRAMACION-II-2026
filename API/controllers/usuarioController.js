import { registrarseManualService, buscarUsuarioPorEmailService } from "../services/usuarioService.js";
import { generarToken } from "../utils/generarToken.js";
import Usuario from "../models/usuario.js";
import { ROLES } from "../config/enums.js";
import { hashPsw, comparePsw } from '../utils/password.js'


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
            return res.status(400).json(
                {
                    estado : "ERROR",
                    mensaje: "Faltan campos obligatorios"
                });
        }
        else
        {
            const usuario = await buscarUsuarioPorEmailService(req.email);
            if (!usuario)
            {
                return res.status(401).json(
                {
                    estado: "ERROR",
                    mensaje: "Email o contraseña incorrectos"
                })
            }
            if (await comparePsw(req.psw, usuario.psw))
            {
                const token = generarToken(
                    {
                        id: usuario.id_persona,
                        email: req.email,
                        nombre: usuario.nombre,
                        apellido: usuario.apellido,
                        telefono: usuario.telefono,
                        rol: ROLES.USUARIO
                    }
                );
                return res.status(200).json(
                {
                    estado: "OK",
                    mensaje: "Loggeado en el sistema correctamente",
                    token
                })
            }
            else
            {
                return res.status(401).json(
                {
                    estado: "ERROR",
                    mensaje: "Contraseña incorrecta"
                })
            }
        }
    }
    catch(err)
    {
        return res.status(500).json(
            {
                estado : "ERROR",
                mensaje: err.message
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
