export async function crearCategoria(req, res)
{
    try
    {
        const
        {
            categoria
        } = req.body;

        if(!categoria)
            {
                return res.status(400).json(
                    {
                        estado : "ERROR",
                        mensaje : "No se ingresó ningún dato"
                    });
            }
        else
            {
                return res.status(200).json(
                    {
                        estado : "OK",
                        mensaje : "Categoría creada con éxito"
                    });
            }
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

export async function obtenerCategorias(req, res)
{
    try
    {
        // Traería las categorías de la DB
        return res.status(200).json(
        {
            estado : "OK",
            mensaje : "Categorías obtenidas con éxito",
            categorias :
            [
                {
                    categoria : "Ropa"
                },
                {
                    categoria : "Tecnología"
                },
                {
                    categoria : "Alimentos"
                },
                {
                    categoria : "Hogar"
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