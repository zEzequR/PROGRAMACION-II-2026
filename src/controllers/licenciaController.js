import { validarLicenciaService } from '../services/licenciaVentaService.js';


export async function validarLicencia(req, res)
{
    try
    {
        const [licencia, usuario] = req.models;

        const resultado = await validarLicenciaService(licencia, usuario);

        if (!resultado)
        {
            return res.status(404).json({ mensaje: "Licencia no válida" });
        }

        return res.status(200).json({ idProducto: resultado.id_producto });
    }
    catch (err)
    {
        if (err.message === "La compra de esta licencia todavía no está pagada")
        {
            return res.status(409).json({ mensaje: err.message });
        }
        if (err.message === "Esta licencia ya fue utilizada")
        {
            return res.status(409).json({ mensaje: err.message });
        }
        return res.status(500).json({ mensaje: err.message });
    }
}
