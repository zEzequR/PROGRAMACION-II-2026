import { Ventas } from '../models/ventas.js'
import
{
    crearVentaService,
    finalizarVentaService,
    obtenerVentaService,
    obtenerVentasClienteService,
    cerrarVentaService,
    cancelarVentaService
} from '../services/ventasService.js'


export async function crearVenta(req, res)
{
    try
    {
        const { idTienda, idCliente } = req.body;

        const venta = new Ventas(idTienda, idCliente);

        const idVenta = await crearVentaService(venta);

        return res.status(201).json({idVenta});
    }

    catch(err)
    {
        return res.status(500).json({mensaje: `No se pudo crear la venta: ${err.message}`});
    }
}


export async function finalizarVenta(req, res)
{
    try
    {
        const { idTienda, idCliente, items } = req.body;

        if (!items || items.length === 0)
        {
            return res.status(400).json({ mensaje: "El carrito está vacío" });
        }

        const idVenta = await finalizarVentaService(idTienda, idCliente, items);

        return res.status(201).json({ idVenta });
    }
    catch(err)
    {
        return res.status(500).json({ mensaje: `No se pudo finalizar la venta: ${err.message}` });
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
            return res.status(404).json({ mensaje: "Venta no encontrada" });
        }

        return res.status(200).json(venta);
    }
    catch(err)
    {
        return res.status(500).json({mensaje: `No se pudo obtener la venta: ${err.message}`});
    }
}


export async function obtenerVentasCliente(req, res)
{
    try
    {
        const { idCliente } = req.params;

        const ventas = await obtenerVentasClienteService(idCliente);

        return res.status(200).json(ventas);
    }
    catch(err)
    {
        return res.status(500).json({mensaje: `No se pudieron obtener las ventas ${err.message}`});
    }
}

