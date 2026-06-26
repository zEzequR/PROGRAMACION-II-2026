import Productos from '../models/productos.js'
import Categorias from '../models/categorias.js'
import cuponesDescuentos from '../models/cuponesDescuentos.js'
import { crearProductoService } from '../services/productosService.js';

export async function crearProducto(req, res, type)
{
    switch(type)
    {
        case "FÍSICO":
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