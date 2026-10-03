import { Tiendas } from '../models/tiendas.js'
import { ArchivoDigital } from '../models/archivoDigital.js'
import { crearTiendaService, modificarTiendaService, cambiarActivoTiendaService, buscarTiendaPorId, buscarTiendaPorPersona } from '../services/tiendasService.js'
import { obtenerEmprendedorPorTienda } from '../services/emprendedorService.js'
import { ROLES } from '../config/enums.js'
import { generarToken } from '../utils/generarToken.js'
import { subirArchivoDigitalS3, obtenerProductosTiendaService } from '../services/productosService.js'
import { generarURLPublica } from '../services/api/awsS3Service.js'
import { seguirTiendaService, dejarDeSeguirTiendaService, obtenerTiendasSeguidasService } from '../services/clientesService.js'
import { Usuario } from '../models/usuario.js'

export async function crearTienda(req, res)
{
    try
    {
        const [emprendedor, tienda] = req.models;

        if (req.file && !req.file.mimetype.startsWith('image/'))
        {
            return res.status(400).json({ mensaje: "El logo tiene que ser una imagen" });
        }

        let dbRes = await crearTiendaService(emprendedor, tienda)

        if (req.file)
        {
            const logo = new ArchivoDigital({
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                path: req.file.path,
                size: req.file.size,
                type: 'IMAGEN PRODUCTO',
                idTienda: dbRes
            });
            await subirArchivoDigitalS3(logo);
            tienda.idTienda = dbRes;
            tienda.logoTienda = generarURLPublica(logo);

            await modificarTiendaService(tienda);
        }


        if(dbRes)
        {
            const nuevoToken = generarToken({
                idPersona: req.user.idPersona,
                email: req.user.email,
                nombre: req.user.nombre,
                apellido: req.user.apellido,
                telefono: req.user.telefono,
                rol: ROLES.EMPRENDEDOR,
                id_tienda: dbRes
            });
            return res.status(201).json(
                {
                    token: nuevoToken
                });
        }
    }
    catch(err)
    {
        if (err.message === "Ya tenés una tienda")
        {
            return res.status(409).json({ mensaje: err.message });
        }
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
        const [tienda] = req.models;
        tienda.idTienda = req.user.id_tienda;

        if (req.file)
        {
            if (!req.file.mimetype.startsWith('image/'))
            {
                return res.status(400).json({ mensaje: "El logo tiene que ser una imagen" });
            }

            const logo = new ArchivoDigital({
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                path: req.file.path,
                size: req.file.size,
                type: 'IMAGEN PRODUCTO',
                idTienda: tienda.idTienda
            });
            await subirArchivoDigitalS3(logo);
            tienda.logoTienda = generarURLPublica(logo);
        }

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
            idTienda: req.user.id_tienda,
            activo: false
        });


        await cambiarActivoTiendaService(tienda);

        const nuevoToken = generarToken({
            idPersona: req.user.idPersona,
            email: req.user.email,
            nombre: req.user.nombre,
            apellido: req.user.apellido,
            telefono: req.user.telefono,
            rol: ROLES.USUARIO,
            activo: true
        });

        return res.status(200).json({ token: nuevoToken });
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
        const [usuario] = req.models;

        const tiendaPersona = await buscarTiendaPorPersona(usuario);

        if (!tiendaPersona || !tiendaPersona.id_tienda)
        {
            return res.status(404).json({ mensaje: "No tenés ninguna tienda" });
        }


        const tienda = new Tiendas({
            idTienda: tiendaPersona.id_tienda,
            activo: true
        });

        await cambiarActivoTiendaService(tienda);


        const nuevoToken = generarToken({
            idPersona: req.user.idPersona,
            email: req.user.email,
            nombre: req.user.nombre,
            apellido: req.user.apellido,
            telefono: req.user.telefono,
            rol: ROLES.EMPRENDEDOR,
            id_tienda: tiendaPersona.id_tienda,
            activo: true
        });

        return res.status(200).json({ token: nuevoToken });
    }
    catch(err)
    {
        return res.status(500).end();
    }
}

export async function obtenerPublicKey(req, res)
{
    try
    {
        const [tienda] = req.models;

        const emprendedorRow = await obtenerEmprendedorPorTienda(tienda);

        if (!emprendedorRow || !emprendedorRow.mp_public_key)
        {
            return res.status(404).json({ mensaje: "Esta tienda no tiene Mercado Pago conectado" });
        }

        return res.status(200).json({ publicKey: emprendedorRow.mp_public_key });
    }
    catch(err)
    {
        return res.status(500).json({ mensaje: `No se pudo obtener la public key: ${err.message}` });
    }
}

export async function obtenerTiendaPublica(req, res)
{
    try
    {
        const [tienda] = req.models;

        const tiendaEncontrada = await buscarTiendaPorId(tienda);

        if (!tiendaEncontrada || !tiendaEncontrada.activo)
        {
            return res.status(404).json({ mensaje: "Tienda no encontrada" });
        }

        const productos = await obtenerProductosTiendaService(tienda, true);

        return res.status(200).json({ tienda: tiendaEncontrada, productos });
    }
    catch (err)
    {
        return res.status(500).json({ mensaje: `No se pudo obtener la tienda: ${err.message}` });
    }
}

export async function obtenerMiTienda(req, res)
{
    try
    {
        const tienda = new Tiendas({ idTienda: req.user.id_tienda });

        const tiendaEncontrada = await buscarTiendaPorId(tienda);

        if (!tiendaEncontrada)
        {
            return res.status(404).json({ mensaje: "No tenés ninguna tienda" });
        }

        const emprendedorRow = await obtenerEmprendedorPorTienda(tienda);
        const mpConectado = !!(emprendedorRow && emprendedorRow.mp_access_token);

        return res.status(200).json({ tienda: tiendaEncontrada, mpConectado });
    }
    catch (err)
    {
        return res.status(500).json({ mensaje: `No se pudo obtener tu tienda: ${err.message}` });
    }
}

export async function seguirTienda(req, res)
{
    try
    {
        const [tienda, usuario] = req.models;

        const tiendaEncontrada = await buscarTiendaPorId(tienda);

        if (!tiendaEncontrada || !tiendaEncontrada.activo)
        {
            return res.status(404).json({ mensaje: "Tienda no encontrada" });
        }

        await seguirTiendaService(usuario, tienda);

        return res.status(200).end();
    }
    catch (err)
    {
        return res.status(500).json({ mensaje: `No se pudo seguir la tienda: ${err.message}` });
    }
}

export async function dejarDeSeguirTienda(req, res)
{
    try
    {
        const [tienda, usuario] = req.models;

        await dejarDeSeguirTiendaService(usuario, tienda);

        return res.status(200).end();
    }
    catch (err)
    {
        return res.status(500).json({ mensaje: `No se pudo dejar de seguir la tienda: ${err.message}` });
    }
}

export async function obtenerTiendasSeguidas(req, res)
{
    try
    {
        const usuario = new Usuario({ idPersona: req.user.idPersona });

        const tiendas = await obtenerTiendasSeguidasService(usuario);

        return res.status(200).json({ tiendas });
    }
    catch (err)
    {
        return res.status(500).json({ mensaje: `No se pudieron obtener las tiendas seguidas: ${err.message}` });
    }
}