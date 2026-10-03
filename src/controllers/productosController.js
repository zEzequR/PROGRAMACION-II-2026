import { crearProductoService, modificarProductoService,
    cambiarActivoProductosService,
    subirArchivoDigitalS3, obtenerURLService, buscarProductoPorId,
    obtenerProductosTiendaService } from '../services/productosService.js';
import { ArchivoDigital } from '../models/archivoDigital.js'
import { generarURLPublica } from '../services/api/awsS3Service.js';
import { Tiendas } from '../models/tiendas.js';
import { Productos } from '../models/productos.js';


export async function crearProducto(req, res)
{
    try
    {
        const [producto, atributo, especificacion] = req.models;

        if (!req.files || !req.files['imagenProd'])
        {
            return res.status(400).json({
                estado: "ERROR",
                mensaje: "Se requiere subir una imagen del producto"
            });
        }

        if (producto.tipoProd === 'DIGITAL' && !req.files['archivoProd'])
        {
            return res.status(400).json({
                estado: "ERROR",
                mensaje: "Para productos digitales se requiere subir un archivo digital"
            });
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

        const resultado = await crearProductoService(producto, atributo, especificacion);

        return res.status(201).json({
            idProducto: resultado.id_producto,
            imagenProd: producto.imagenProd
        });
    }
    catch(err)
    {
        console.error(err);
        return res.status(500).json({
            estado: "ERROR",
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

        if (!productoActual || productoActual.id_tienda !== req.user.id_tienda
            || productoActual.tipo_prod !== producto.tipoProd)
        {
            return res.status(404).json({
                estado: "ERROR",
                mensaje: "Producto no encontrado"
            });
        }

        producto.idTienda = req.user.id_tienda;

        if (atributo.idCat === undefined)
        {
            atributo.idCat = productoActual.id_cat;
        }

        if (producto.tipoProd === 'DIGITAL' && req.file)
        {
            const archivo = new ArchivoDigital(
                {
                    key: productoActual.archivo_prod,
                    path: req.file.path,
                    mimetype: req.file.mimetype,
                    type: 'ARCHIVO',
                    idTienda: req.user.id_tienda
                });

            await subirArchivoDigitalS3(archivo);

        }

        await modificarProductoService(producto, atributo, especificacion);

        return res.status(200).json({
            estado: "EXITO",
            mensaje: `Producto ${producto.tipoProd.toLowerCase()} modificado correctamente`,
        });

    }
    catch(err)
    {
        console.error(err);
        return res.status(500).json({
            estado: "ERROR",
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

        if (!producto || !producto.activo || !producto.tienda_activa)
        {
            return res.status(404).json({ mensaje: "Producto no encontrado" });
        }

        return res.status(200).json({
            producto: {
                idProducto: producto.id_producto,
                idTienda: producto.id_tienda,
                nombreTienda: producto.nombre_tienda,
                logoTienda: producto.logo_tienda,
                idCat: producto.id_cat,
                categoria: producto.categoria,
                tipoProd: producto.tipo_prod,
                nombreProd: producto.nombre_prod,
                imagenProd: producto.imagen_prod,
                descripProd: producto.descrip_prod,
                precio: Number(producto.precio),
                stock: producto.stock,
                usaLicencia: producto.usa_licencia
            }
        });

    }
    catch (err)
    {
        return res.status(500).json({
            estado: "ERROR",
            mensaje: `No se pudo obtener el producto: ${err.message}`
        });
    }
}

export async function obtenerProductosTienda(req, res)
{
    try
    {
        const [tienda] = req.models;

        const productos = await obtenerProductosTiendaService(tienda, true);

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
        const tienda = new Tiendas({ idTienda: req.user.id_tienda });

        const productos = await obtenerProductosTiendaService(tienda, false);

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

        return res.status(200).json({ estado: 'EXITO', downloadUrl: url })
    }
    catch(err)
    {
        return res.status(403).json({ estado: 'ERROR', mensaje: err.message })
    }
}
