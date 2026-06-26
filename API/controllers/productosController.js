import Productos from '../models/productos.js'
import Categorias from '../models/categorias.js'
import cuponesDescuentos from '../models/cuponesDescuentos.js'
import { crearProductoService, modificarProductoService,
    eliminarProductoService, reactivarProductoService, verProductosService,
    crearCuponService, eliminarCuponService, modificarCuponService,
    crearEspecificacionesAtributosService } from '../services/productosService.js';

export async function crearProducto(req, res, type)
{
    switch(type)
    {
        case "DIGITAL":
        {
            try
            {
                const
                {
                    tipoProd,
                    nombreProd,
                    imagenProd,
                    descripProd,
                    precio,
                    activo,
                    archivoProd
                } = req.body
                const producto = new Productos(tipoProd, nombreProd,
                    imagenProd, descripProd,
                    precio, activo, archivoProd);
                
                const dbRes = await crearProductoService(producto);
                if (dbRes)
                {
                    return res.status(201).json(
                    {
                        estado: "EXITO",
                        mensaje: "Producto físico creado correctamente"
                    });
                }
                else
                    {
                        return res.status(500).json(
                        {
                            estado: "ERROR",
                            mensaje: "No se pudo crear el producto"
                        });
                    }
            }
            catch(err)
            {
                return res.status(500).json(
                {
                    estado: "ERROR",
                    mensaje: "No se pudo crear el producto por un error desconocido"
                });
            }
        }
        case "FISICO":
        {
            try
                {
                    const
                    {
                        tipoProd,
                        nombreProd,
                        imagenProd,
                        descripProd,
                        precio,
                        activo,
                        stock
                    } = req.body
                    const producto = new Productos(tipoProd, nombreProd,
                        imagenProd, descripProd,
                        precio, activo, stock);
                    
                    const dbRes = await crearProductoService(producto);
                    if (dbRes)
                    {
                        return res.status(201).json(
                        {
                            estado: "EXITO",
                            mensaje: "Producto digital creado correctamente"
                        });
                    }
                    else
                        {
                            return res.status(500).json(
                            {
                                estado: "ERROR",
                                mensaje: "No se pudo crear el producto"
                            });
                        }
                }
            catch(err)
                {
                    return res.status(500).json(
                    {
                        estado: "ERROR",
                        mensaje: "No se pudo crear el producto por un error desconocido"
                    });
                }
        }
    }
}

export async function modificarProducto(req, res)
{
    switch(type)
    {
        case "DIGITAL":
        {
            try
            {
                const
                {
                    tipoProd,
                    nombreProd,
                    imagenProd,
                    descripProd,
                    precio,
                    activo,
                    archivoProd
                } = req.body
                const producto = new Productos(tipoProd, nombreProd,
                    imagenProd, descripProd,
                    precio, activo, archivoProd);
                
                const dbRes = await modificarProductoService(producto);
                if (dbRes)
                {
                    return res.status(201).json(
                    {
                        estado: "EXITO",
                        mensaje: "Producto físico modificado correctamente"
                    });
                }
                else
                    {
                        return res.status(500).json(
                        {
                            estado: "ERROR",
                            mensaje: "No se pudo modificar el producto"
                        });
                    }
            }
            catch(err)
            {
                return res.status(500).json(
                {
                    estado: "ERROR",
                    mensaje: "No se pudo modificado el producto por un error desconocido"
                });
            }
        }
        case "FISICO":
        {
            try
                {
                    const
                    {
                        tipoProd,
                        nombreProd,
                        imagenProd,
                        descripProd,
                        precio,
                        activo,
                        stock
                    } = req.body
                    const producto = new Productos(tipoProd, nombreProd,
                        imagenProd, descripProd,
                        precio, activo, stock);
                    
                    const dbRes = await modificarProductoService(producto);
                    if (dbRes)
                    {
                        return res.status(201).json(
                        {
                            estado: "EXITO",
                            mensaje: "Producto digital modificado correctamente"
                        });
                    }
                    else
                        {
                            return res.status(500).json(
                            {
                                estado: "ERROR",
                                mensaje: "No se pudo modificar el producto"
                            });
                        }
                }
            catch(err)
                {
                    return res.status(500).json(
                    {
                        estado: "ERROR",
                        mensaje: "No se pudo modificar el producto por un error desconocido"
                    });
                }
        }
    }
}

export async function eliminarProducto(req, res)
{
    try
    {
        const
        {
            idProd,
            idTienda
        } = req.body

        const dbRes = await eliminarProductoService(idProd, idTienda)

        if (dbRes)
        {
            return res.status(201).json(
            {
                estado: "EXITO",
                mensaje: "Producto eliminado correctamente"
            });
        }
        else
            {
                return res.status(500).json(
                {
                    estado: "ERROR",
                    mensaje: "No se pudo eliminar el producto"
                });
            }
    }
    catch(err)
    {
        return res.status(500).json(
            {
                estado: "ERROR",
                mensaje: "No se pudo eliminar el producto"
            });
    }
}

export async function reactivarProducto(req, res)
{
    try
    {
        const
        {
            idProd,
            idTienda
        } = req.body

        const dbRes = await reactivarProductoService(idProd, idTienda);
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

export async function crearCupon(req, res, apliesTo)
{
    switch(apliesTo)
    {
        case "TIENDA":
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
                        usosActuales
                    } = req.body
                    
                    const cupon = new cuponesDescuentos(codigo, tipoDescuento,
                        valor, fechaExpiracion, usosMaximos, usosActuales
                    )

                    const dbRes = await crearCuponService(cupon);

                    if (dbRes)
                    {
                        return res.status(201).json(
                        {
                            estado: "EXITO",
                            mensaje: "Cupón creado correctamente"
                        });
                    }
                    else
                        {
                            return res.status(500).json(
                            {
                                estado: "ERROR",
                                mensaje: "No se pudo crear el cupón"
                            });
                        }

                }
                catch(err)
                {
                    return res.status(500).json(
                    {
                        estado: "ERROR",
                        mensaje: "No se pudo crear el cupón"
                    });
                }
            }
        case "PRODUCTO":
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
                        usosActuales
                    } = req.body
                    
                    const cupon = new cuponesDescuentos(codigo, tipoDescuento,
                        valor, fechaExpiracion, usosMaximos, usosActuales
                    )

                    const dbRes = await crearCuponService(cupon);

                    if (dbRes)
                    {
                        return res.status(201).json(
                        {
                            estado: "EXITO",
                            mensaje: "Cupón creado correctamente"
                        });
                    }
                    else
                        {
                            return res.status(500).json(
                            {
                                estado: "ERROR",
                                mensaje: "No se pudo crear el cupón"
                            });
                        }
                }
                catch(err)
                {
                    return res.status(500).json(
                    {
                        estado: "ERROR",
                        mensaje: "No se pudo crear el cupón"
                    });
                }
            }
    }
}

export async function eliminarCupon(req, res)
{
    try
    {
        //preguntar
    }
    catch(err)
    {
        return res.status(500).json(
        {
            estado: "ERROR",
            mensaje: "No se pudo crear el cupón"
        });
    }
}

export async function modificarCupon(req, res, appliesTo)
{
    if(appliesTo)
        {
            const
            {
                codigo,
                tipoDescuento,
                valor,
                fechaExpiracion,
                usosMaximos,
                usosActuales
            } = req.body
            
            const cupon = new cuponesDescuentos(codigo, tipoDescuento,
                valor, fechaExpiracion, usosMaximos, usosActuales);
            
            const dbRes = await modificarCuponService(cupon)
            if (dbRes)
            {
                return res.status(201).json(
                {
                    estado: "EXITO",
                    mensaje: "Cupón modificado correctamente"
                });
            }
            else
                {
                    return res.status(500).json(
                    {
                        estado: "ERROR",
                        mensaje: "No se pudo modificar el cupón"
                    });
                }
        }
    else
        {
            return res.status(500).json(
            {
                estado: "ERROR",
                mensaje: "No se pudo modificar el cupón"
            });
        }
}

export async function crearEspecificacionesAtributos(req, res)
{
    try
    {
        const
        {
            categoria,
            nombreAtributo,
            valor
        } = req.body;

        const especificacionesProducto = new categoria(categoria,
            nombreAtributo, valor
        )

        const dbRes = await crearEspecificacionesAtributosService(especificacionesProducto);

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
    catch
    {
        return res.status(500).json(
        {
            estado: "ERROR",
            mensaje: "No se pudo modificar el cupón"
        });
    }
}