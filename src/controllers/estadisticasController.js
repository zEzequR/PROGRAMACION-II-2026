import { obtenerEstadisticasService, generarCsvEstadisticasService } from '../services/estadisticasService.js'

export async function obtenerEstadisticas(req, res)
{
    try
    {
        const [tienda, filtros] = req.models;

        if (tienda.idTienda !== req.user.id_tienda)
        {
            return res.status(403).json({ mensaje: "No tenés acceso a las estadísticas de esta tienda" });
        }
        const estadisticas = await obtenerEstadisticasService(tienda, filtros);

        return res.status(200).json(estadisticas);
    }
    catch(err)
    {
        return res.status(500).json({ mensaje: `No se pudieron obtener las estadísticas: ${err.message}` });
    }
}

export async function descargarEstadisticasCsv(req, res)
{
    try
    {
        const [tienda, filtros] = req.models;

        if (tienda.idTienda !== req.user.id_tienda)
        {
            return res.status(403).json({ mensaje: "No tenés acceso a las estadísticas de esta tienda" });
        }

        const csv = await generarCsvEstadisticasService(tienda, filtros);

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="estadisticas.csv"');
        return res.status(200).send(csv);
    }
    catch(err)
    {
        return res.status(500).json({ mensaje: `No se pudo generar el CSV: ${err.message}` });
    }
}
