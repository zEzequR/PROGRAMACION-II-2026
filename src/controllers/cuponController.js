import { cuponesDescuentos } from '../models/cuponesDescuentos.js';
import { crearCuponService, modificarCuponService, eliminarCuponService } from '../services/cuponesDescuentosService.js'

export async function crearCupon(req, res)
{
    try
    {
        const
        {
            codigo,
            tipoDescuento,
            valor,
            fechaExpiracion,
            usosMaximos,
            usosActuales,
            aplica,
            listaProd
        } = req.body

        const nuevoCupon = new cuponesDescuentos(codigo,
            tipoDescuento, valor, fechaExpiracion, usosMaximos,
            0
        )

        const dbRes = await crearCuponService(nuevoCupon, req.user.id_tienda,
            aplica, listaProd);
        if(dbRes)
        {
            return res.status(201).json(
            {
                estado: "OK",
                mensaje: "Se creó el cupón con éxito"
            });
        }
    }
    catch(err)
    {
        return res.status(500).json(
        {
            estado: "ERROR",
            mensaje: `No se pudo crear el cupón: ${err.message}`
        });
    }
}

export async function eliminarCupon(req, res)
{
    try
    {
        const
        {
            idCupon
        } = req.params;
        
        const dbRes = await eliminarCuponService(idCupon, req.user.id_tienda)
        if (dbRes)
        {
            return res.status(200).json(
            {
                estado: "EXITO",
                mensaje: "Cupón eliminado correctamente"
            });
        }

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
        const
        {
            idCupon
        } = req.params;
        const
        {
            idProd,
            codigo,
            tipoDescuento,
            valor,
            fechaExpiracion,
            usosMaximos,
            usosActuales,
            aplicaProducto,
            listaProd
        } = req.body

        const cupon = new cuponesDescuentos(codigo, tipoDescuento,
            valor, fechaExpiracion, usosMaximos, usosActuales);
        
        const dbRes = await modificarCuponService(idCupon, cupon, req.user.id_tienda,
            aplicaProducto, listaProd)
        if (dbRes)
        {
            return res.status(201).json(
            {
                estado: "EXITO",
                mensaje: "Cupón modificado correctamente"
            });
        }
    }
    catch(err)
    {
        return res.status(500).json(
        {
            estado: "ERROR",
            mensaje: "No se pudo modificar el cupón"
        });
    }
}