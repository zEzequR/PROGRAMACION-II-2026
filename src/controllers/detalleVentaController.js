import { agregarDetalleVentaService, eliminarDetalleVentaService } from '../services/detalleVentaService.js'

export async function agregarDetalleVenta(req, res)
{
    try
    {
        const { idVenta, idProducto, cantidad } = req.body;

        await agregarDetalleVentaService(idVenta, idProducto, cantidad);

        return res.status(201).json({ estado: "EXITO", mensaje: "Producto agregado a la venta" });
    }
    catch(err)
    {
        console.error(err);
        return res.status(500).json({ estado: "ERROR", mensaje: err.message });
    }
}

export async function eliminarDetalleVenta(req, res)
{
    try
    {
        const { idVenta, idProducto } = req.body;

        await eliminarDetalleVentaService(idVenta, idProducto);

        return res.status(200).json({ estado: "EXITO", mensaje: "Producto quitado de la venta" });
    }
    catch(err)
    {
        console.error(err);
        return res.status(500).json({ estado: "ERROR", mensaje: err.message });
    }
}