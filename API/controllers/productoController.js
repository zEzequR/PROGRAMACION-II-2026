export async function crearProd(req, res)
{
    try
    {
        const
        {
            nombreProd,
            imagenProd,
            descripProd,
            catProd,
            tipoProd,
            precio,
            stock,
            especProd,
            activo
        } = req.body;

        if (!nombreProd || !imagenProd || !catProd ||
            !tipoProd || !precio || !stock || !especProd || !activo)
            {
                res.status(400).json(
                    {
                        estado : "ERROR",
                        mensaje : "Faltan ingresar datos obligatorios"
                    });
            }
        else
            {
                res.status(200).json(
                    {
                        estado : "OK",
                        mensaje : "Se ingresó el producto correctamente",
                        nombreProd : nombreProd,
                        imagenProd : imagenProd,
                        descripProd : descripProd,
                        catProd : catProd,
                        tipoProd : tipoProd,
                        precio : precio,
                        stock : stock,
                        especProd : especProd,
                        activo : activo
                    });
            };
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

export async function modificarProd(req, res)
{
    try
    {
        const
        {
            nombreProd,
            descripProd,
            precio,
            stock,
            especProd,
            activo
        } = req.body;

        res.status(200).json(
            {
                estado : "OK",
                mensaje : "Se modificó el producto correctamente",
                nombreProd : nombreProd,
                descripProd : descripProd,
                precio : precio,
                stock : stock,
                especProd : especProd,
                activo : activo
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

export async function eliminarProd(req, res)
{
    try
    {
        const 
        {
            nombreProd
        } = req.body

        if(!nombreProd)
            {
                return res.status(400).json(
                    {
                        estado : "ERROR",
                        mensaje : "No se confirmó la eliminación"
                    });
            }
        else
            {
                return res.status(200).json(
                    {
                        estado : "OK",
                        mensaje : "Producto eliminado con éxito",
                        nombreProd : nombreProd
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

export async function obtenerProductos(req, res)
{
    try
    {
        const
        {
            nombreTienda,
            categoria
        } = req.query;

        if (!nombreTienda)
        {
            return res.status(400).json(
            {
                estado : "ERROR",
                mensaje : "Falta el nombre de la tienda"
            })
        }

        return res.status(200).json(
        {
            estado : "OK",
            mensaje : "Productos obtenidos con éxito",
            nombreTienda,
            categoria : categoria ?? null,
            productos :
            [
                {
                    nombreProducto : "Remera",
                    precio : 5000,
                    stock : 10,
                    categoria : "Ropa",
                    activo : true
                },
                {
                    nombreProducto : "Pantalón",
                    precio : 8000,
                    stock : 5,
                    categoria : "Ropa",
                    activo : true
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