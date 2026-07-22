import Ventas from '../models/ventas.js'
import
{
    crearVentaService,
    obtenerVentaService,
    obtenerVentasClienteService
} from '../services/ventasService.js'

export async function crearVenta(req, res)
{
    try
    {
        console.log("BODY RECIBIDO:", req.body);
        
        const { idTienda, idCliente } = req.body;
        const venta = new Ventas(idTienda, idCliente);

        const idVenta = await crearVentaService(venta);

        return res.status(201).json({ estado: "EXITO", idVenta });
    }
    catch(err)
    {
        console.error(err);
        return res.status(500).json({ estado: "ERROR", mensaje: err.message });
    }
}

export async function obtenerVenta(req, res)
{
    try
    {
        const { idVenta } = req.params;
        const venta = await obtenerVentaService(idVenta);

        if (venta.length === 0)
        {
            return res.status(404).json({ estado: "ERROR", mensaje: "Venta no encontrada" });
        }

        return res.status(200).json({ estado: "EXITO", venta });
    }
    catch(err)
    {
        console.error(err);
        return res.status(500).json({ estado: "ERROR", mensaje: err.message });
    }
}

export async function obtenerVentasCliente(req, res)
{
    try
    {
        const { idCliente } = req.params;
        const ventas = await obtenerVentasClienteService(idCliente);

        return res.status(200).json({ estado: "EXITO", ventas });
    }
    catch(err)
    {
        console.error(err);
        return res.status(500).json({ estado: "ERROR", mensaje: err.message });
    }
}