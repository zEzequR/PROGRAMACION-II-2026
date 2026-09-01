import { cuponesDescuentos, cuponesDescuentosProductos } from '../models/cuponesDescuentos.js';
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
            aplica,
            listaProd
        } = req.body

        let nuevoCupon;
        switch(aplica)
        {
            case "TIENDA":
                {
                    nuevoCupon = new cuponesDescuentos({
                        idTienda: req.user.id_tienda,
                        codigo: codigo,
                        tipoDescuento: tipoDescuento,
                        valor: parseFloat(valor),
                        fechaExpiracion: fechaExpiracion,
                        usosMaximos: parseInt(usosMaximos),
                        aplicaTienda: true
                    });
                    break; 
                }
            case "PRODUCTO":
                {
                    listaProd = Array.isArray(listaProd)
                    ? listaProd.map(id => parseInt(id)) : [];

                        nuevoCupon = new cuponesDescuentosProductos({
                            idTienda: req.user.id_tienda,
                            codigo: codigo,
                            tipoDescuento: tipoDescuento,
                            valor: parseFloat(valor),
                            fechaExpiracion: fechaExpiracion,
                            usosMaximos: parseInt(usosMaximos),
                            usosActuales: 0,
                            aplicaTienda: false,
                            idProductos: listaProd
                        });
                        break
                }
        }

        const dbRes = await crearCuponService(nuevoCupon);
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
        
        const cupon = new cuponesDescuentos({
            idCuponDesc: parseInt(idCupon),
            idTienda: req.user.id_tienda
        });


        const dbRes = await eliminarCuponService(cupon);
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
            codigo,
            tipoDescuento,
            valor,
            fechaExpiracion,
            usosMaximos,
            aplicaTienda,
            listaProd
        } = req.body

        let cupon;

        switch(aplicaTienda)
        {
            case true:
                {
                    cupon = new cuponesDescuentos({
                        idCuponDesc: parseInt(idCupon),
                        idTienda: req.user.id_tienda,
                        codigo: codigo,
                        tipoDescuento: tipoDescuento,
                        valor: parseFloat(valor),
                        fechaExpiracion: fechaExpiracion,
                        usosMaximos: parseInt(usosMaximos),
                        aplicaTienda: aplicaTienda,
                    });
                    break;
                }
            case false:
                {
                    listaProd = Array.isArray(listaProd)
                    ? listaProd.map(id => parseInt(id)) : [];

                    cupon = new cuponesDescuentosProductos({
                        idCuponDesc: parseInt(idCupon),
                        idTienda: req.user.id_tienda,
                        codigo: codigo,
                        tipoDescuento: tipoDescuento,
                        valor: parseFloat(valor),
                        fechaExpiracion: fechaExpiracion,
                        usosMaximos: parseInt(usosMaximos),
                        aplicaTienda: aplicaTienda,
                        idProductos: listaProd
                    });
                    break;
                }
        }

        const dbRes = await modificarCuponService(cupon)
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