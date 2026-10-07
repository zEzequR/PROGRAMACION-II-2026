import { crearProductoService, modificarProductoService,
    cambiarActivoProductosService,
    subirArchivoDigitalS3, obtenerURLService, buscarProductoPorId,
    obtenerProductosTiendaService, obtenerArchivoProductoService } from '../services/productosService.js';
import { ArchivoDigital } from '../models/archivoDigital.js'
import { generarURLPublica } from '../services/api/awsS3Service.js';
import { Tiendas } from '../models/tiendas.js';
import { buscarTiendaPorId } from '../services/tiendasService.js';


export async function crearProducto(req, res)
{
    try
    {
        const [producto, atributo, especificacion] = req.models;

        if (!req.files || !req.files['imagenProd'])
        {
            return res.status(400).json({ mensaje: "Se requiere subir una imagen del producto" });
        }

        if (!req.files['imagenProd'][0].mimetype.startsWith('image/'))
        {
            return res.status(400).json({ mensaje: "La imagen del producto tiene que ser PNG, JPG o WEBP" });
        }

        if (producto.tipoProd === 'DIGITAL' && !req.files['archivoProd'])
        {
            return res.status(400).json({ mensaje: "Para productos digitales se requiere subir un archivo digital" });
        }

        const fotoProducto = new ArchivoDigital(
        {
            originalname: req.files['imagenProd'][0].originalname,
            mimetype: req.files['imagenProd'][0].mimetype,
            path: req.files['imagenProd'][0].path,
            size: req.files['imagenProd'][0].size,
            type: 'IMAGEN PRODUCTO',
            idTienda: req.user.id_tienda
        });
        await subirArchivoDigitalS3(fotoProducto);

        producto.imagenProd = generarURLPublica(fotoProducto);
        producto.idTienda = req.user.id_tienda;


        if (producto.tipoProd === 'DIGITAL')
        {
            const archivo = new ArchivoDigital(
                {
                    originalname: req.files['archivoProd'][0].originalname,
                    mimetype: req.files['archivoProd'][0].mimetype,
                    path: req.files['archivoProd'][0].path,
                    size: req.files['archivoProd'][0].size,
                    type: 'ARCHIVO',
                    idTienda: req.user.id_tienda
                });
            await subirArchivoDigitalS3(archivo);

            producto.archivoProd = archivo.key;
        }

        const idProducto = await crearProductoService(producto, atributo, especificacion);

        return res.status(201).json({
            idProducto: idProducto,
            imagenProd: producto.imagenProd
        });
    }
    catch(err)
    {
        console.error(err);
        return res.status(500).json({
            mensaje: `No se pudo crear el producto: ${err.message}`
        });
    }
}

export async function modificarProducto(req, res)
{
    try
    {
        const [producto, atributo, especificacion] = req.models;

        const productoActual = await buscarProductoPorId(producto);

        if (!productoActual || productoActual.idTienda !== req.user.id_tienda
            || productoActual.tipoProd !== producto.tipoProd)
        {
            return res.status(404).json({ mensaje: "Producto no encontrado" });
        }

        producto.idTienda = req.user.id_tienda;

        if (atributo.idCat === undefined)
        {
            atributo.idCat = productoActual.idCat;
        }

        if (producto.tipoProd === 'DIGITAL' && req.file)
        {
            const archivoActual = await obtenerArchivoProductoService(producto);

            const archivo = new ArchivoDigital(
                {
                    key: archivoActual.key,
                    path: req.file.path,
                    mimetype: req.file.mimetype,
                    type: 'ARCHIVO',
                    idTienda: req.user.id_tienda
                });

            await subirArchivoDigitalS3(archivo);

        }

        await modificarProductoService(producto, atributo, especificacion);

        return res.status(200).json({
            mensaje: `Producto ${producto.tipoProd.toLowerCase()} modificado correctamente`,
        });

    }
    catch(err)
    {
        console.error(err);
        return res.status(500).json({
            mensaje: `No se pudo modificar el producto: ${err.message}`
        });
    }
}

export async function eliminarProducto(req, res)
{
    try
    {
        const [productos] = req.models;

        for (let i = 0; i < productos.length; i++)
        {
            productos[i].idTienda = req.user.id_tienda;
            productos[i].activo = false;
        }

        await cambiarActivoProductosService(productos);


        return res.status(200).end();
    }
    catch (err)
    {
        switch (err.message)
        {
            case "Hay productos que no existen o no son de tu tienda":
                return res.status(404).json({ mensaje: err.message });

            default:
                console.error(err);
                return res.status(500).json({ mensaje: "No se pudieron dar de baja los productos" });
        }
    }
}


export async function reactivarProducto(req, res)
{
    try
    {
        const [productos] = req.models;

        for (let i = 0; i < productos.length; i++)
        {
            productos[i].idTienda = req.user.id_tienda;
            productos[i].activo = true;
        }

        await cambiarActivoProductosService(productos);

        return res.status(200).end();
    }
    catch (err)
    {
        switch (err.message)
        {
            case "Hay productos que no existen o no son de tu tienda":
                return res.status(404).json({ mensaje: err.message });

            default:
                console.error(err);
                return res.status(500).json({ mensaje: "No se pudieron reactivar los productos" });
        }
    }
}


export async function obtenerProducto(req, res)
{
    try
    {
        const [productoBuscado] = req.models;

        const producto = await buscarProductoPorId(productoBuscado);

        if (!producto || !producto.activo || !producto.tienda.activo)
        {
            return res.status(404).json({ mensaje: "Producto no encontrado" });
        }

        let categoria = null;
        if (producto.categoria)
        {
            categoria = producto.categoria.categoria;
        }
        let stock = null;
        if (producto.tipoProd === 'FISICO')
        {
            stock = producto.stock;
        }
        let usaLicencia = false;
        if (producto.tipoProd === 'DIGITAL')
        {
            usaLicencia = producto.usaLicencia === true;
        }

        return res.status(200).json({
            producto: {
                idProducto: producto.idProducto,
                idTienda: producto.idTienda,
                nombreTienda: producto.tienda.nombreTienda,
                logoTienda: producto.tienda.logoTienda,
                idCat: producto.idCat,
                categoria: categoria,
                tipoProd: producto.tipoProd,
                nombreProd: producto.nombreProd,
                imagenProd: producto.imagenProd,
                descripProd: producto.descripProd,
                precio: producto.precio,
                stock: stock,
                usaLicencia: usaLicencia
            }
        });
    }
    catch (err)
    {
        return res.status(500).json({
            mensaje: `No se pudo obtener el producto: ${err.message}`
        });
    }
}

export async function obtenerProductosTienda(req, res)
{
    try
    {
        const [tienda] = req.models;

        const tiendaEncontrada = await buscarTiendaPorId(tienda);

        if (!tiendaEncontrada || !tiendaEncontrada.activo)
        {
            return res.status(404).json({ mensaje: "Tienda no encontrada" });
        }

        const productos = await obtenerProductosTiendaService(tienda);

        return res.status(200).json({ productos });
    }
    catch (err)
    {
        return res.status(500).json({ mensaje: `No se pudieron obtener los productos: ${err.message}` });
    }
}

export async function obtenerMisProductos(req, res)
{
    try
    {
        const tienda = new Tiendas(
            {
                idTienda: req.user.id_tienda,
                activo: false
            });

        const productos = await obtenerProductosTiendaService(tienda);

        return res.status(200).json({ productos });
    }
    catch (err)
    {
        return res.status(500).json({ mensaje: `No se pudieron obtener tus productos: ${err.message}` });
    }
}

export async function descargarProducto(req, res)
{
    try
    {
        const [detalle, usuario] = req.models;

        const url = await obtenerURLService(detalle, usuario)

        if (!url)
        {
            return res.status(403).json({ mensaje: "No tenés acceso a este archivo o la compra todavía no está pagada" });
        }

        return res.status(200).json({ downloadUrl: url })
    }
    catch(err)
    {
        return res.status(403).json({ mensaje: err.message })
    }
}
