export async function crearVenta(req, res)
{
    try
    {
        const
        {
            nombreTienda,
            emailCliente,
            nombreCliente,
            apellidoCliente,
            productos,
            estadoVenta,
            ultDigitosTarjeta,
            marcaTarjeta
        } = req.body;

        if (!nombreTienda || !emailCliente || !nombreCliente ||
            !apellidoCliente || !productos || productos.length === 0 ||
            !ultDigitosTarjeta || !marcaTarjeta)
        {
            return res.status(400).json(
            {
                estado : "ERROR",
                mensaje : "Faltan campos obligatorios"
            });
        }

        const precioFinal = productos.reduce((total, p) =>
            total + (p.precioUnitario * p.cantidad), 0);

        return res.status(200).json(
        {
            estado : "OK",
            mensaje : "Venta creada con éxito",
            comprobante :
            {
                nombreTienda,
                fechaVenta : Date.now(),
                estadoVenta : "pendiente",
                precioFinal,

                cliente :
                {
                    nombre : nombreCliente,
                    apellido : apellidoCliente,
                    email : emailCliente
                },

                detalleVenta : productos.map(p => (
                {
                    nombreProducto : p.nombreProducto,
                    precioUnitario : p.precioUnitario,
                    cantidad : p.cantidad,
                    subtotal : p.precioUnitario * p.cantidad
                })),

                pago :
                {
                    ultDigitosTarjeta,
                    marcaTarjeta,
                    estado : "aprobado"
                }
            }
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

export async function obtenerVentas(req, res)
{
    try
    {
        const
        {
            fechaVenta,
            producto
        } = req.query

        return res.status(200).json(
        {
            estado : "OK",
            mensaje : "Tiendas obtenidas con éxito",
            ventas : 
            [
                {
                    fechaVenta : fechaVenta,
                    detalleVenta :
                    [
                        {
                            descripcionProducto : producto,
                            precioProducto : 2000,
                            cantidad : 2,
                            precioFinal : 4000
                        }
                    ]
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
    }
}

export async function obtenerDetalleVenta(req, res)
{
    try
    {
        const
        {
            nombreTienda,
            emailCliente,
            fechaVenta
        } = req.query;

        if (!nombreTienda || !emailCliente)
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
            mensaje : "Detalle de venta obtenido con éxito",
            detalle :
            {
                nombreTienda,
                emailCliente,
                fechaVenta : Date.now(),
                estadoVenta : "completada",

                cliente :
                {
                    nombre : "Ezequiel",
                    apellido : "Ramos",
                    email : emailCliente
                },

                detalleVenta :
                [
                    {
                        nombreProducto : "Remera",
                        precioUnitario : 5000,
                        cantidad : 2,
                        subtotal : 10000
                    },
                    {
                        nombreProducto : "Pantalón",
                        precioUnitario : 8000,
                        cantidad : 1,
                        subtotal : 8000
                    }
                ],

                pago :
                {
                    ultDigitosTarjeta : "4242",
                    marcaTarjeta : "Visa",
                    estado : "aprobado",
                    montoTotal : 18000
                }
            }
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