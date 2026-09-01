import { crearProductoService, modificarProductoService,
    eliminarProductoService, reactivarProductoService,
    crearEspecificacionesAtributosService,
    subirArchivoDigitalS3, editarArchivoDigitalS3, obtenerURLService, buscarProductoPorId } from '../services/productosService.js';
import { Productos, ProductosDigitales, ProductosFisicos } from '../models/productos.js'
import { categoriasProductos, atributosCategoria, especificacionesProducto } from '../models/categorias.js';
import { ArchivoDigital } from '../models/archivoDigital.js'
import { Ventas } from '../models/ventas.js';


export async function crearProducto(req, res)
{
    try
    {
        const
        {
            tipoProd,
            idCat,
            nombreProd,
            imagenProd,
            descripProd,
            precio,
            activo
        } = req.body;

        let nuevoProd;

        switch(tipoProd)
        {
            case "DIGITAL":
            {
                const { usaLicencia } = req.body;

                if (!req.file)
                {
                    return res.status(400).json({
                        estado: "ERROR",
                        mensaje: "Para productos digitales se requiere subir un archivo"
                    });
                }

                const archivo = new ArchivoDigital(
                    {
                        originalname: req.file.originalname,
                        mimetype: req.file.mimetype,
                        path: req.file.path,
                        size: req.file.size,
                        idTienda: req.user.id_tienda
                    });

                await subirArchivoDigitalS3(archivo);

                nuevoProd = new ProductosDigitales(
                {
                    idTienda: req.user.id_tienda,
                    idCat: Number(idCat),
                    tipoProd: tipoProd,
                    nombreProd: nombreProd,
                    imagenProd: imagenProd,
                    descripProd: descripProd,
                    precio: Number(precio),
                    activo: activo === 'true' || activo === true,
                    archivoProd: archivo.key,
                    usaLicencia: usaLicencia === 'true' || usaLicencia === true
                });
                break;
            }
            case "FISICO":
            {
                const
                {
                    stock 
                } = req.body;
                nuevoProd = new ProductosFisicos(
                    {
                        tipoProd: "FISICO",
                        nombreProd: nombreProd,
                        imagenProd: imagenProd,
                        descripProd: descripProd,
                        precio: precio,
                        activo: activo,
                        stock: stock,
                    }
                );
                break;
            }
            default:
                return res.status(400).end();
        }

        const dbRes = await crearProductoService(nuevoProd);

        if (dbRes)
        {
            return res.status(201).json({
                estado: "EXITO",
                mensaje: `Producto ${nuevoProd.tipoProd.toLowerCase()} creado correctamente`,
            });
        }
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
        const { idProd } = req.params
        const {
            tipoProd,
            idCat,
            nombreProd,
            imagenProd,
            descripProd,
            precio,
            activo
        } = req.body;

        const productoActual = await buscarProductoPorId(idProd);

        if (!productoActual)
        {
            return res.status(404).json({
                estado: "ERROR",
                mensaje: "Producto no encontrado"
            });
        }

        let prodMod;

        switch(productoActual.tipo_prod)
        {
            case "DIGITAL":
            {
                const { usaLicencia } = req.body; 

                if (req.file) {
                    const archivo = new ArchivoDigital({
                        key: productoActual.archivoProd,
                        path: req.file.path,
                        mimetype: req.file.mimetype,
                        key: productoActual.archivo_prod,
                        idTienda: req.user.id_tienda
                        });

                    await editarArchivoDigitalS3(archivo);
                }

                prodMod = new ProductosDigitales({
                    idProducto: Number(idProd),
                    idTienda: req.user.id_tienda,
                    idCat: Number(idCat),
                    tipoProd: tipoProd || productoActual.tipo_prod,
                    nombreProd: nombreProd,
                    imagenProd: imagenProd,
                    descripProd: descripProd,
                    precio: Number(precio),
                    activo: activo === "true" || activo === true,
                    archivoProd: productoActual.archivo_prod,
                    usaLicencia: usaLicencia === "true" || usaLicencia === true
                });

                break;
            }
            case "FISICO":
            {
                const { stock } = req.body;
                prodMod = new ProductosFisicos(
                    {
                        idProducto: idProd,
                        idTienda: req.user.id_tienda,
                        idCat: idCat,
                        tipoProd: tipoProd,
                        nombreProd: nombreProd,
                        imagenProd: imagenProd,
                        descripProd: descripProd,
                        precio: precio,
                        activo: activo,
                        stock: stock
                    }
                );
                break;
            }
            default:
                return res.status(400).json({
                    estado: "ERROR",
                    mensaje: "El tipo de producto no es válido"
                });
        }

        const dbRes = await modificarProductoService(prodMod);

        if (dbRes)
        {
            return res.status(200).json(
            {
                estado: "EXITO",
                mensaje: `Producto ${prodMod.tipoProd.toLowerCase()} modificado correctamente`
            });
        }

        return res.status(500).json({
            estado: "ERROR",
            mensaje: "No se pudo modificar el producto"
        });
    }
    catch(err)
    {
        return res.status(500).json(
        {
            estado: "ERROR",
            mensaje: `No se pudo modificar el producto: ${err.message}`
        });
    }
}

export async function eliminarProducto(req, res) {
    try {
        const { listaProductos } = req.body;

        const prodsEliminar = listaProductos.map(prod => new Productos(
            {
                idProducto: prod.idProducto,
                idTienda: req.user.id_tienda
            }
        ));

        const dbRes = await eliminarProductoService(prodsEliminar);

        return res.status(200).json({ 
            mensaje: "Productos eliminados con éxito", 
            resultado: dbRes 
        });

    }
    catch (error)
    {
        return res.status(400).json({ 
            error: "La lista de productos es inválida o faltan datos obligatorios." 
        });
    }
}

export async function reactivarProducto(req, res)
{
    try
    {
        const
        {
            listaProductos
        } = req.body

        const prodsReactivar = listaProductos.map(prod =>
            new Productos(
                {
                    idProducto: prod.idProducto,
                    idTienda: req.user.id_tienda
                })
        );

        const dbRes = await reactivarProductoService(prodsReactivar);

        if(dbRes)
        {
            return res.status(200).json(
            {
                estado: "EXITO",
                mensaje: "Producto reactivado correctamente"
            });
        }
    }
    catch(err)
    {
        return res.status(500).json(
            {
                estado: "ERROR",
                mensaje: "No se pudo reactivar el producto"
            });
    }
}

export async function crearEspecificacionesAtributos(req, res)
{
    try
    {
        const
        {
            idProd
        } = req.params
        const
        {
            idCat,
            nombreAtributo,
            valor
        } = req.body;

        const especificacionesProd = new especificacionesProducto(null,
            nombreAtributo, valor
        )

        const dbRes = await crearEspecificacionesAtributosService(especificacionesProd, idCat ,idProd);

        if (dbRes)
        {
            return res.status(201).json(
            {
                estado: "EXITO",
                mensaje: "Especificaciones del producto creado correctamente"
            });
        }
        else
            {
                return res.status(500).json(
                {
                    estado: "ERROR",
                    mensaje: "No se pudo modificar crear las especificaciones del producto"
                });
            }
        
    }
    catch (err)
    {
        return res.status(500).json(
        {
            estado: "ERROR",
            mensaje: `Error al crear las especificaciones del producto: ${err.message}`
        });
    }
}

export async function descargarProducto(req, res)
{
    try
    {
        const { idVenta, idProducto } = req.params

        const venta = new Ventas(
            {
                idVenta: Number(idVenta),
                idTienda: req.id_tienda,
                idCliente: req.user.id,
            })

        const url = await obtenerURLService(venta)

        return res.status(200).json({ estado: 'EXITO', downloadUrl: url })
    }
    catch(err)
    {
        return res.status(403).json({ estado: 'ERROR', mensaje: err.message })
    }
}