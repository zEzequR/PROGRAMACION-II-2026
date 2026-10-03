import jwt from "jsonwebtoken";
import { GClient } from '../config/google.js';
import { buscarUsuarioPorId } from '../services/usuarioService.js';
import { Usuario } from '../models/usuario.js';

export function basicAuth(req, res, next)
{
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Basic "))
    {
        res.set("WWW-Authenticate", 'Basic realm="Restricted Area"')
        return res.status(401).send("Authentication required")
    }

    const base64Credentials = authHeader.split(" ")[1]
    const credentials = Buffer.from(base64Credentials, "base64").toString("utf-8")
    const separador = credentials.indexOf(":")

    if (separador === -1)
    {
        res.set("WWW-Authenticate", 'Basic realm="Restricted Area"')
        return res.status(401).send("Authentication required")
    }

    req.credenciales = {
        email: credentials.slice(0, separador),
        psw: credentials.slice(separador + 1)
    };

    next();
}

export async function JWTVerify(req, res, next)
{
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer "))
    {
        return res.status(401).json({ error: "Token requerido" })
    }

    const token = authHeader.split(" ")[1]

    try
    {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const usuarioActual = await buscarUsuarioPorId(new Usuario({ idPersona: decoded.idPersona }))

        if (!usuarioActual || !usuarioActual.activo)
        {
            return res.status(403).json({ error: "Cuenta desactivada" })
        }

        req.user = decoded
        next()
    }
    catch(err)
    {
        return res.status(401).json({ error: "Token inválido o expirado" })
    }
}

export function intentarJWT(req, res, next)
{
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer "))
    {
        return next();
    }

    const token = authHeader.split(" ")[1];

    try
    {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
    }
    catch (err)
    {
        req.user = null;
    }

    next();
}

export function JWTVerifySinActivo(req, res, next)
{
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer "))
    {
        return res.status(401).json({ error: "Token requerido" })
    }

    const token = authHeader.split(" ")[1]

    try
    {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        next()
    }
    catch(err)
    {
        return res.status(401).json({ error: "Token inválido o expirado" })
    }
}


export function verfifyRoles(allowedRoles)
{
    return (req, res, next) =>
    {
        if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.rol))
        {
            return res.status(403).json({ 
                error: "No tenés permisos para realizar esta acción" 
            })
        }
        next();
    }
}

export async function verificarTokenGoogle(req, res, next) {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({
                estado: "ERROR",
                mensaje: "El idToken es obligatorio"
            });
        }

        const GToken = await GClient.verifyIdToken({
            idToken
        });

        const payload = GToken.getPayload();

        req.google = {
            email: payload.email,
            nombre: payload.given_name,
            apellido: payload.family_name
        };

        next();
    } catch (error) {
        return res.status(401).json({
            estado: "ERROR",
            mensaje: "Token de Google inválido o expirado",
            error: error.message
        });
    }
}