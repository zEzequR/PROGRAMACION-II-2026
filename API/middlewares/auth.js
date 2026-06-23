import jwt from "jsonwebtoken";

export function userAuth(mode)
{
    return (req, res, next) =>
        {
            const authHeader = req.headers.authorization;
            if (!authHeader)
                {
                    return res.status(401).json({ error: "Token requerido" });
                }
            switch(mode)
                {
                    case 'BASIC':
                    {
                        const base64Credentials = authHeader.split(' ')[1]
                        const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8')
                        const [email, password] = credentials.split(':')
                        if (!authHeader || !authHeader.startsWith('Basic '))
                            {
                                res.set('WWW-Authenticate', 'Basic realm="Restricted Area"');
                                return res.status(401).send('Authentication required');
                            }

                        if (email === 'ezequiel2013ramos6@gmail.com' && password === 'ezeLeila')
                            {
                                return next();
                            }

                        return res.status(401).send('Invalid credentials');

                    }
                        case 'JWT':
                        {
                            const token = authHeader.split(" ")[1];
                            try
                            {
                                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                                req.user = decoded;
                                next();
                            }
                            catch(err)
                            {
                                return res.status(401).json(
                                    {
                                        error: "Token inválido o expirado"
                                    }
                                );
                            }
                        }
                }
        }
}
