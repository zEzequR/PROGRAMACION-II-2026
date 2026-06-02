export async function crearTienda(req, res)
{
    try
    {
        const
        {
            nombreTienda,
            logoTienda,
            plantilla
        } = req.body;

        if (!nombreTienda || !logoTienda || !plantilla)
            {
                res.status(400).json(
                    {
                        estado : "ERROR",
                        mensaje : "Faltan datos  obligatorios"
                    });
            }
        else
            {
                res.status(200).json(
                    {
                        estado : "OK",
                        mensaje : "Tienda creada con éxito",
                        nombreTienda : nombreTienda,
                        logoTienda : logoTienda,
                        plantilla : plantilla
                    });
            };
    }
    catch(err)
    {
        res.status(500).json(
            {
                estado: "ERROR",
                mensaje: err.message
            });
    };
}

export async function modificarTienda(req, res)
{
try
    {
        const
        {
            nombreTienda,
            logoTienda,
            plantilla
        } = req.body;

        if (!nombreTienda && !logoTienda && !plantilla)
            {
                res.status(400).json(
                    {
                        estado : "ERROR",
                        mensaje : "No se modificó nada de la tienda"
                    });
            }
        else
            {
                res.status(200).json(
                    {
                        estado : "OK",
                        mensaje : "Tienda modificada con éxito",
                        nombreTienda : nombreTienda,
                        logoTienda : logoTienda,
                        plantilla : plantilla
                    });
            };
    }
    catch(err)
    {
        res.status(500).json(
            {
                estado: "ERROR",
                mensaje: err.message
            });
    };
}

export async function eliminarTienda(req, res)
{
    const 
    {
        nombreTienda
    } = req.body

    if (!nombreTienda)
        {
            res.status(400).json(
                {
                    estado : "ERROR",
                    mensaje : "No se confirmó la eliminación de la tienda"
                });
        }
    else
        {
            res.status(200).json(
                {
                    estado : "OK",
                    mensaje : "Tienda eliminada con éxito",
                    nombreTienda : nombreTienda
                    });
        }
}
