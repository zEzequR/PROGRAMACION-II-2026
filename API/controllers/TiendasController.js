import * as Tiendas from '../models/tiendas.js'
import { crearTiendaService, modificarTiendaService } from '../services/tiendasService.js'

export async function crearTienda(req, res)
{
    try
    {
        const
        {
            idPlantilla,
            nombreTienda,
            logoTienda,
            personalizacionTienda
        } = req.body
        let Tienda = new Tiendas(idPlantilla,
            nombreTienda,
            logoTienda,
            personalizacionTienda
        )
        let dbRes = await crearTiendaService(Tienda)
        if(dbRes)
        {
            return res.status(201).json(
            {
                estado: "OK",
                mensaje: "Tienda creada correctamente",
                tienda: dbRes
            });
        }
    }
    catch(err)
    {
        return res.status(500).json(
        {
            estado: "ERROR",
            mensaje: "No se pudo crear la tienda"
        });
    }
}

export async function modificarTienda(req, res)
{
    try
    {
        const
        {
            idTienda,
            idPlantilla,
            nombreTienda,
            logoTienda,
            personalizacionTienda
        } = req.body
        let Tienda = new Tiendas(
            nombreTienda,
            logoTienda,
            personalizacionTienda
        ) = req.body
        const dbRes = await modificarTiendaService(Tienda);
        if(dbRes)
            {
                return res.status(200).json(
                {
                    estado: "OK",
                    mensaje: "Tienda modificada correctamente",
                    tienda: dbRes
                });
            }
        else
            {
                return res.status(404).json(
                {
                    estado: "ERROR",
                    mensaje: "No se encontró la tienda"
                });
            }
    }
    catch(err)
    {
        return res.status(500).json(
        {
            estado: "ERROR",
            mensaje: "No se pudo modificar la tienda"
        });
    }
}