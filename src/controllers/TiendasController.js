import { Tiendas } from '../models/tiendas.js'
import { Emprendedor } from '../models/usuario.js'
import { crearTiendaService, modificarTiendaService, eliminarTiendaService, reactivarTiendaService } from '../services/tiendasService.js'
import { crearEmprendedorService } from '../services/emprendedorService.js'
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

        const emprendedor = new Emprendedor({
            idPersona: parseInt(req.user.id),
            email: req.user.email,
            nombre: req.user.nombre,
            apellido: req.user.apellido,
            telefono: req.user.telefono,
            cuit
        });

        let idEmprendedor = await crearEmprendedorService(emprendedor)

        console.log("ID EMPRENDEDOR: " + idEmprendedor)

        const tienda = new Tiendas({
            idEmprendedor,
            idPlantilla: parseInt(idPlantilla),
            nombreTienda,
            logoTienda,
            personalizacionTienda
        });


        let dbRes = await crearTiendaService(tienda)

        if(dbRes)
        {
            const nuevoToken = generarToken({
                id: req.user.id,
                email: req.user.email,
                nombre: req.user.nombre,
                apellido: req.user.apellido,
                telefono: req.user.telefono,
                rol: ROLES.EMPRENDEDOR,
                id_tienda: dbRes
            });
            return res.status(201).json(
                {
                    token: nuevoToken,
                    idEmprendedor: idEmprendedor
                });
        }
    }
    catch(err)
    {
        return res.status(500).json(
            {
                error: err.message
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

        const tienda = new Tiendas({
            idTienda: req.user.id_tienda,
            idEmprendedor: req.user.id,
            idPlantilla: parseInt(idPlantilla),
            nombreTienda,
            logoTienda,
            personalizacionTienda
        });


        const dbRes = await modificarTiendaService(tienda)

        if(dbRes)
            {
            return res.status(200).end();
            }
    }
    catch(err)
    {
        return res.status(500).end();
    }
}

export async function eliminarTienda(req, res)
{
    try
    {
        const tienda = new Tiendas({
            idTienda: req.user.id_tienda
        });

        const dbRes = await eliminarTiendaService(tienda);

        if(dbRes)
            {
            return res.status(200).end();
            }
    }
    catch(err)
    {
        return res.status(500).json(
            {
                error: err.message
            });
    }
}

export async function reactivarTienda(req, res)
{
    try
    {
        const tienda = new Tiendas({
            idTienda: req.user.id_tienda
        });

        const dbRes = await reactivarTiendaService(
            tienda
        );

        if(dbRes)
            {
            return res.status(200).end();
            }
    }
    catch(err)
    {
        return res.status(500).end();
    }
}