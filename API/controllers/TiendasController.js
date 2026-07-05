import { Tiendas } from '../models/tiendas.js'
import { Emprendedor } from '../models/usuario.js'
import { crearTiendaService, modificarTiendaService, eliminarTiendaService, reactivarTiendaService } from '../services/tiendasService.js'
import { ROLES } from '../config/enums.js'
import { generarToken } from '../utils/generarToken.js'

export async function crearTienda(req, res)
{
    try
    {
        const { 
            idPlantilla, 
            nombreTienda, 
            logoTienda, 
            personalizacionTienda,
            cuit 
        } = req.body;

        const tienda = new Tiendas(
            parseInt(idPlantilla),
            nombreTienda,
            logoTienda,
            personalizacionTienda,
        )
        
        const emprendedor = new Emprendedor(
            parseInt(req.user.id),    
            null,
            null,       
            null,     
            null,           
            null,        
            null,          
            null,          
            cuit,          
            null            
        );

        let dbRes = await crearTiendaService(tienda, emprendedor)
        if(dbRes)
        {
            const nuevoToken = generarToken(
                {
                    id: req.id_persona,
                    email: req.email,
                    nombre: req.nombre,
                    apellido: req.apellido,
                    telefono: req.telefono,
                    rol: ROLES.EMPRENDEDOR,
                    id_tienda: dbRes
                });
            return res.status(201).json(
            {
                estado: "OK",
                mensaje: "Tienda creada correctamente",
                token: nuevoToken
            });
        }
    }
    catch(err)
    {
        return res.status(500).json(
        {
            estado: "ERROR",
            mensaje: `No se pudo crear la tienda: ${err.message}`
        });
    }
}

export async function modificarTienda(req, res)
{
    try
    {
        const { 
            idPlantilla, 
            nombreTienda, 
            logoTienda, 
            personalizacionTienda,
        } = req.body;

        const nuevaTienda = new Tiendas(
            idPlantilla,
            nombreTienda,
            logoTienda,
            personalizacionTienda
        );

        const dbRes = await modificarTiendaService(nuevaTienda,
            req.user.id_tienda
        )

        if(dbRes)
            {
            return res.status(200).json({
                estado: "OK",
                mensaje: "Tienda modificada correctamente",
            });
            }
        

    }
    catch(err)
    {
        return res.status(500).json({
            estado: "ERROR",
            mensaje: `No se pudo modificar la tienda: ${err.message}`
        });
    }
}

export async function eliminarTienda(req, res)
{
    try
    {
        const dbRes = await eliminarTiendaService(
        req.user.id_tienda
        );

        if(dbRes)
            {
            return res.status(200).json({
                estado: "OK",
                mensaje: "Tienda eliminada correctamente",
            });
            }
    }
    catch(err)
    {
        return res.status(500).json({
            estado: "ERROR",
            mensaje: `No se pudo eliminar la tienda: ${err.message}`
        });
    }
}

export async function reactivarTienda(req, res)
{
    try
    {
        const dbRes = await reactivarTiendaService(
        req.user.id_tienda
        );

        if(dbRes)
            {
            return res.status(200).json({
                estado: "OK",
                mensaje: "Tienda activada correctamente",
            });
            }
    }
    catch(err)
    {
        return res.status(500).json({
            estado: "ERROR",
            mensaje: `No se pudo activar la tienda: ${err.message}`
        });
    }
}