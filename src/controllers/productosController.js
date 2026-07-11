import { Productos, ProductosDigitales, ProductosFisicos } from '../models/productos.js'
import { crearProductoService, modificarProductoService,
    eliminarProductoService, reactivarProductoService,
    crearEspecificacionesAtributosService } from '../services/productosService.js';
import { categoriasProductos, atributosCategoria, especificacionesProducto } from '../models/categorias.js';

export async function crearProducto(req, res)
{
    try
    {
        const { 
            tipoProd, 
            idCat, 
            nombreProd, 
            imagenProd, 
            descripProd, 
            precio, 
            activo, 
            archivoProd, 
            stock       
        } = req.body;

        let nuevoProd;

        switch(tipoProd)
        {
            case "DIGITAL":
            {
                //cuando se conecten los servicios de google,
                //await a que el archivo se suba a drive y se
                //tenga el link al archivo
                nuevoProd = new ProductosDigitales(
                    "DIGITAL", nombreProd, imagenProd, descripProd,
                    precio, activo, archivoProd
                );
                break;
            }
            case "FISICO":
            {
                nuevoProd = new ProductosFisicos(
                    "FISICO", nombreProd, imagenProd, descripProd,
                    precio, activo, stock
                );
                break;
            }
            default:
                return res.status(400).json({
                    estado: "ERROR",
                    mensaje: "El tipo de producto no es válido"
                });
        }

        const dbRes = await crearProductoService(nuevoProd, idCat, req.user.id_tienda);

        if (dbRes)
        {
            return res.status(201).json(
            {
                estado: "EXITO",
                mensaje: `Producto ${nuevoProd.tipoProd.toLowerCase()} creado correctamente`
            });
        }
    }
    catch(err)
    {
        return res.status(500).json(
        {
            estado: "ERROR",
            mensaje: `No se pudo crear el producto: ${err.message}`
        });
    }
}

export async function modificarProducto(req, res)
{
    try
    {
        const
        {
            idProd
        } = req.params
        const {
            tipoProd, 
            idCat, 
            nombreProd, 
            imagenProd, 
            descripProd, 
            precio, 
            activo, 
            archivoProd, 
            stock       
        } = req.body;

        let prodMod;

        switch(tipoProd)
        {
            case "DIGITAL":
            {
                prodMod = new ProductosDigitales(
                    "DIGITAL", nombreProd, imagenProd, descripProd,
                    precio, activo, archivoProd
                );
                break;
            }
            case "FISICO":
            {
                prodMod = new ProductosFisicos(
                    "FISICO", nombreProd, imagenProd, descripProd,
                    precio, activo, stock
                );
                break;
            }
            default:
                return res.status(400).json({
                    estado: "ERROR",
                    mensaje: "El tipo de producto no es válido"
                });
        }

        const dbRes = await modificarProductoService(prodMod, idCat, idProd, req.user.id_tienda);

        if (dbRes)
        {
            return res.status(200).json(
            {
                estado: "EXITO",
                mensaje: `Producto ${prodMod.tipoProd.toLowerCase()} modificado correctamente`
            });
        }
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

export async function eliminarProducto(req, res)
{
    try
    {
        const
        {
            idProd
        } = req.params

        const dbRes = await eliminarProductoService(idProd, req.user.id_tienda)

        if (dbRes)
        {
            return res.status(200).json(
            {
                estado: "EXITO",
                mensaje: "Producto eliminado correctamente"
            });
        }
    }
    catch(err)
    {
        return res.status(500).json(
            {
                estado: "ERROR",
                mensaje: `No se pudo eliminar el producto ${err.message}`
            });
    }
}

export async function reactivarProducto(req, res)
{
    try
    {
        const
        {
            idProd
        } = req.params

        const dbRes = await reactivarProductoService(idProd, req.user.id_tienda);

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

export async function obtenerProductos(req, res)
{
    try
    {
        //verlo
    }
    catch(err)
    {
        return res.status(500).json(
            {
                estado: "ERROR",
                mensaje: "No se pudo obtener el/los productos"
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