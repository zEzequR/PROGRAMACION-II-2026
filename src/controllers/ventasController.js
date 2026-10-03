import
{
    crearVentaService,
    obtenerVentaService,
    obtenerVentasClienteService,
    obtenerVentasPersonaService,
    verificarAccesoVentaService
} from '../services/ventasService.js'
import { verificarAccesoClienteService } from '../services/clientesService.js';
import { Tiendas } from '../models/tiendas.js';

export async function crearVenta(req, res)
{
    try
    {
        const [tienda, cliente, items, cupon] = req.models;

        const [idVenta, , precioFinal, descuento] = await crearVentaService(tienda, cliente, items, cupon);

        return res.status(201).json({ idVenta, precioFinal, descuento });
    }
    catch(err)
    {
        switch (err.message)
        {
            case "Cantidad inválida":
            case "Producto no disponible":
            case "Cupón inválido":
            case "Los productos digitales se compran de a uno":
            case "El cupón no aplica a los productos de la compra":
                return res.status(400).json({ mensaje: err.message });
            case "Tienda no encontrada":
                return res.status(404).json({ mensaje: err.message });
            case "Esta tienda no está disponible":
            case "No hay stock suficiente":
            case "El cupón está vencido":
            case "El cupón ya no tiene usos disponibles":
                return res.status(409).json({ mensaje: err.message });

            default:
                return res.status(500).json({ mensaje: `No se pudo crear la venta: ${err.message}` });
        }
    }
}

export async function obtenerVenta(req, res)
{
    try
    {
        const [venta, usuario] = req.models;

        const tienda = new Tiendas(
            {
                idTienda: req.user.id_tienda
            });

        const infoVenta = await verificarAccesoVentaService(venta, usuario, tienda);

        if (!infoVenta)
        {
            return res.status(404).json({ estado: "ERROR", mensaje: "Venta no encontrada" });
        }

        const detalle = await obtenerVentaService(venta);

        if (detalle.length === 0)
        {
            return res.status(404).json({ estado: "ERROR", mensaje: "Venta no encontrada" });
        }

        return res.status(200).json({ estado: "EXITO", venta: detalle });
    }
    catch(err)
    {
        console.error(err);
        return res.status(500).json({ estado: "ERROR", mensaje: err.message });
    }
}

export async function obtenerMisCompras(req, res)
{
    try
    {
        const [usuario] = req.models;

        const ventas = await obtenerVentasPersonaService(usuario);

        return res.status(200).json({ ventas });
    }
    catch (err)
    {
        return res.status(500).json({ mensaje: err.message });
    }
}

export async function obtenerEstadoVenta(req, res)
{
    try
    {
        const [venta, usuario] = req.models;

        const tienda = new Tiendas(
            {
                idTienda: req.user.id_tienda
            });

        const infoVenta = await verificarAccesoVentaService(venta, usuario, tienda);

        if (!infoVenta)
        {
            return res.status(404).json({ mensaje: "Venta no encontrada" });
        }

        return res.status(200).json({ estado: infoVenta.estado });
    }
    catch(err)
    {
        return res.status(500).json({ mensaje: err.message });
    }
}

export async function obtenerVentasCliente(req, res)
{
    try
    {
        const [venta, usuario] = req.models;

        const tienda = new Tiendas(
            {
                idTienda: req.user.id_tienda
            });

        const tieneAcceso = await verificarAccesoClienteService(venta, usuario, tienda);

        if (!tieneAcceso)
        {
            return res.status(404).json({ estado: "ERROR", mensaje: "Cliente no encontrado" });
        }

        const ventas = await obtenerVentasClienteService(venta);

        return res.status(200).json({ estado: "EXITO", ventas });
    }
    catch(err)
    {
        console.error(err);
        return res.status(500).json({ estado: "ERROR", mensaje: err.message });
    }
}
