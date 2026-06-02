// clienteController.js

export async function crearCliente(req, res)
{
    try
    {
        const
        {
            nombreTienda,
            email,
            nombre,
            apellido,
            telefono,
            marketing
        } = req.body

        if (!nombreTienda || !email || !nombre || !apellido)
        {
            return res.status(400).json(
            {
                estado : "ERROR",
                mensaje : "Faltan campos obligatorios"
            })
        }

        return res.status(200).json(
        {
            estado : "OK",
            mensaje : "Cliente creado con éxito",
            cliente :
            {
                nombreTienda,
                email,
                nombre,
                apellido,
                telefono : telefono,
                marketing : marketing ?? false,
                fechaCreacion : Date.now()
            }
        })
    }
    catch(err)
    {
        return res.status(500).json(
        {
            estado : "ERROR",
            mensaje : err.message
        })
    }
}

export async function obtenerClientes(req, res)
{
    try
    {
        const 
        {
            email,
            nombre,
            apellido,
            telefono,
        } = req.query

        return res.status(200).json(
            {
                estado : "OK",
                mensaje : "Se encontraron clientes",
                clientes : [
                    {
                        emailCliente : email,
                        nombreCliente : nombre,
                        apellidoCliente : apellido,
                        telefonoCliente : telefono,
                    }
                ]
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