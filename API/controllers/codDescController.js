export async function crearCodDesc(req, res)
{
    try
    {
        const 
        {
            codigo,
            porcentaje,
            aplicaProducto
        } = req.body;
        if (!codigo || !porcentaje)
            {
                return res.status(400).json(
                    {
                        estado : "ERROR",
                        mensaje : "Faltan campos obligatorios"
                    });
            }
        else if (!aplicaProducto)
            {
                return res.status(200).json(
                    {
                        estado : "OK",
                        mensaje : "Código de descuento creado correcetamente, se aplicará para todos los productos",
                        codigo : codigo,
                        porcentaje : porcentaje
                    });
            }
        else
            {
                return res.status(200).json(
                    {
                        estado : "OK",
                        mensaje : "El código de descuento se creó correctamente",
                        codigo : codigo,
                        porcentaje : porcentaje,
                        aplicaProducto : aplicaProducto
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

export async function modificarCodDesc(req, res)
{
    try
    {
        const 
        {
            codigo,
            porcentaje,
            aplicaProducto
        } = req.body;

        if(!codigo || !porcentaje || !aplicaProducto)
            {
                return res.status(400).json(
                    {
                        estado : "ERROR",
                        mensaje : "No se modificó ningún campo"
                    });
            }
        else
            {
                return res.status(200).json(
                    {
                        estado : "OK",
                        mensaje : "Código modificado con éxito",
                        codigo : codigo,
                        porcentaje : porcentaje,
                        aplicaProducto : aplicaProducto
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
    }
}

export async function eliminarCodDesc(req, res)
{
    try
    {
        const 
        {
            codigo
        } = req.body;

        if(!codigo)
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
                        mensaje : "Código eliminado con éxito",
                        codigo : codigo
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
    }
}