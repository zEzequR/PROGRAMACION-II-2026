import jwt from "jsonwebtoken";

export function basicAuth(req, res, next)
{
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Basic"))
    {
        res.set("WWW-Authenticate", 'Basic realm="Restricted Area"')
        return res.status(401).send("Authentication required")
    }

    const base64Credentials = authHeader.split(" ")[1]
    const credentials = Buffer.from(base64Credentials, "base64").toString("utf-8")
    const [email, password] = credentials.split(":")

    req.email = email;
    req.psw = password;

    next();

}

export function JWTVerify(req, res, next)
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