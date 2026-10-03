import { crearCuponService, modificarCuponService, eliminarCuponService,
    obtenerCuponesTiendaService } from '../services/cuponesDescuentosService.js'
import { cuponesDescuentos } from '../models/cuponesDescuentos.js'

export async function crearCupon(req, res)
{
    try
    {
        const [cuponTienda, cuponProductos] = req.models;

        let nuevoCupon = cuponTienda;
        if (cuponTienda.aplicaTienda === false)
        {
            nuevoCupon = cuponProductos;
        }

        nuevoCupon.idTienda = req.user.id_tienda;

        const idCuponDesc = await crearCuponService(nuevoCupon);

        return res.status(201).json({ idCuponDesc });

    }
    catch(err)
    {
        switch (err.message)
        {
            case "Ya tenés un cupón con ese código":
                return res.status(409).json({ mensaje: err.message });

            case "Hay productos que no existen o no son de tu tienda":
                return res.status(400).json({ mensaje: err.message });

            default:
                return res.status(500).json({ mensaje: `No se pudo crear el cupón: ${err.message}` });
        }
    }
}

export async function obtenerCuponesTienda(req, res)
{
    try
    {
        const cupon = new cuponesDescuentos({ idTienda: req.user.id_tienda });

        const cupones = await obtenerCuponesTiendaService(cupon);

        return res.status(200).json({ cupones });
    }
    catch (err)
    {
        return res.status(500).json({ mensaje: `No se pudieron obtener los cupones: ${err.message}` });
    }
}

export async function eliminarCupon(req, res)
{
    try
    {
        const [cupon] = req.models;
        cupon.idTienda = req.user.id_tienda;

        const dbRes = await eliminarCuponService(cupon);
        if (dbRes)
        {
            return res.status(200).json(
            {
                estado: "EXITO",
                mensaje: "Cupón eliminado correctamente"
            });
        }

        return res.status(404).json(
        {
            estado: "ERROR",
            mensaje: "Cupón no encontrado"
        });
    }
    catch(err)
    {
        return res.status(500).json(
        {
            estado: "ERROR",
            mensaje: "No se pudo eliminar el cupón"
        });
    }
}

export async function modificarCupon(req, res)
{
    try
    {
        const [cuponTienda, cuponProductos] = req.models;

        let cupon = cuponTienda;
        if (cuponTienda.aplicaTienda === false)
        {
            cupon = cuponProductos;
        }

        cupon.idTienda = req.user.id_tienda;

        const dbRes = await modificarCuponService(cupon)
        if (dbRes)
        {
            return res.status(200).json(
            {
                estado: "EXITO",
                mensaje: "Cupón modificado correctamente"
            });
        }

        return res.status(404).json(
        {
            estado: "ERROR",
            mensaje: "Cupón no encontrado"
        });
    }
    catch(err)
    {
        switch (err.message)
        {
            case "Ya tenés un cupón con ese código":
                return res.status(409).json({ mensaje: err.message });

            case "Hay productos que no existen o no son de tu tienda":
                return res.status(400).json({ mensaje: err.message });

            default:
                return res.status(500).json({ mensaje: "No se pudo modificar el cupón" });
        }
    }
}