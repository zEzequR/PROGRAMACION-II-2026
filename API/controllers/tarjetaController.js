export async function agregarTarjeta(req, res)
{
    try
    {
        const
        {
            servicio,
            ultDigitosTarjeta,
            marcaTarjeta,
            expiraMes,
            expiraAno,
            porDefecto
        } = req.body

        if (!servicio || !ultDigitosTarjeta ||
            !marcaTarjeta || !expiraMes || !expiraAno)
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
            mensaje : "Tarjeta agregada con éxito",
            tarjeta :
            {
                ultDigitosTarjeta,
                marcaTarjeta,
                expiraMes,
                expiraAno,
                porDefecto : porDefecto
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

export async function eliminarTarjeta(req, res)
{
    try
    {
        const
        {
            ultDigitosTarjeta,
            marcaTarjeta
        } = req.body;

        if (!ultDigitosTarjeta || !marcaTarjeta)
        {
            return res.status(400).json(
            {
                estado : "ERROR",
                mensaje : "Faltan campos obligatorios"
            })
        };

        return res.status(200).json(
        {
            estado : "OK",
            mensaje : `Tarjeta ${marcaTarjeta} terminada en ${ultDigitosTarjeta} eliminada con éxito`
        })
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

export async function obtenerTarjetas(req, res)
{
    try
    {
        const
        {
            emailCliente,
            nombreCliente,
            apellidoCliente,
            telefonoCliente
        } = req.query;

        if (!emailCliente || !nombreCliente || !apellidoCliente
            || !telefonoCliente)
        {
            return res.status(400).json(
            {
                estado : "ERROR",
                mensaje : "Faltan campos obligatorios"
            });
        }

        return res.status(200).json(
        {
            estado : "OK",
            mensaje : "Tarjetas obtenidas con éxito",
            nombreCliente : nombreCliente,
            apellidoCliente : apellidoCliente,
            emailCliente : emailCliente,
            telefonoCliente : telefonoCliente,
            tarjetas :
            [
                {
                    ultDigitosTarjeta : "4242",
                    marcaTarjeta : "Visa",
                    expiraMes : 12,
                    expiraAno : 2028,
                    porDefecto : true
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