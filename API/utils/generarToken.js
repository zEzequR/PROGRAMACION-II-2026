import jwt from "jsonwebtoken";

export function generarToken(payload)
{
    return jwt.sign(payload, process.env.JWT_SECRET, 
        { 
            expiresIn: '1h'
        })
}