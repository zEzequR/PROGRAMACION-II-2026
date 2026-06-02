export async function agregarFuenteIngreso(req, res)
{
    try
    {
        const
        {
            nombreTienda,
            servicio
        } = req.body

        if (!nombreTienda || !servicio)
        {
            return res.status(400).json(
            {
                estado : "ERROR",
                mensaje : "Faltan campos obligatorios"
            })
        }

        // await fetch a Mercado Pago o Stripe para obtener token

        return res.status(200).json(
        {
            estado : "OK",
            mensaje : `Fuente de ingreso de ${servicio} agregada con éxito a ${nombreTienda}`,
            nombreTienda,
            servicio
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