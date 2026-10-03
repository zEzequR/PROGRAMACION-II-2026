import pool from '../config/conexion.js'
import { enviarCorreoIndividual } from './api/resendService.js';
import { generarPlantillaVenta } from '../scripts/emailTemplate.js';
import { crearKeyHash } from '../utils/generarKeyDigital.js';
import { licenciaVenta } from '../models/licenciaVenta.js';
import { buscarTiendaPorId } from './tiendasService.js';
import { crearClienteService } from './clientesService.js';
import { buscarProductoPorId } from './productosService.js';
import { crearLicenciaVentaService } from './licenciaVentaService.js';
import { InteraccionEvento } from '../models/eventos.js';
import { publicarEvento } from './api/kafkaService.js';
import { obtenerEmprendedorPorTienda } from './emprendedorService.js';
import { Tiendas } from '../models/tiendas.js';
import { buscarCuponPorCodigo } from './cuponesDescuentosService.js';


export async function crearVentaService(tienda, usuario, listaProductos, cupon)
{
    let listaProdCompleta = [];
    let precioFinal = 0;
    let descuento = 0;
    let idCuponDesc = null;


    const queryVerificarProductosCupon = `
        SELECT id_producto FROM cupones_descuentos_productos WHERE id_cupon_desc = $1
    `;

    const queryVenta = `
        INSERT INTO Ventas (id_tienda, id_cliente, precio_final, estado, fecha_venta, id_cupon_desc)
        VALUES ($1, $2, 0, 'ABIERTA', NOW(), $3)
        RETURNING id_venta
    `;

    const queryItem = `INSERT INTO Detalle_Venta
        (id_venta, id_producto, precio_unitario, cantidad, subtotal, id_lic_vta)
        VALUES ($1, $2, $3, $4, $5, $6)`;

    const queryActualizarPrecio = `UPDATE Ventas SET precio_final = $1 WHERE id_venta = $2`;

    try
    {
        const datosTienda = await buscarTiendaPorId(tienda);

        if (!datosTienda)
        {
            throw new Error("Tienda no encontrada");
        }
        if (!datosTienda.activo)
        {
            throw new Error("Esta tienda no está disponible");
        }


        for (const producto of listaProductos)
        {
            if (!Number.isInteger(producto.cantidad) || producto.cantidad <= 0)
            {
                throw new Error("Cantidad inválida");
            }

            const infoProducto = await buscarProductoPorId(producto);

            if (!infoProducto || !infoProducto.activo || infoProducto.id_tienda !== tienda.idTienda)
            {
                throw new Error("Producto no disponible");
            }
            if (infoProducto.tipo_prod === 'DIGITAL' && producto.cantidad !== 1)
            {
                throw new Error("Los productos digitales se compran de a uno");
            }
            if (infoProducto.tipo_prod === 'FISICO' && producto.cantidad > infoProducto.stock)
            {
                throw new Error("No hay stock suficiente");
            }

            listaProdCompleta.push(infoProducto);
        }


        if (cupon.codigo !== undefined)
        {
            const datosCupon = await buscarCuponPorCodigo(cupon);

            if (!datosCupon)
            {
                throw new Error("Cupón inválido");
            }


            if (datosCupon.vencido)
            {
                throw new Error("El cupón está vencido");
            }

            if (datosCupon.usos_maximos !== null && Number(datosCupon.usos_actuales) >= datosCupon.usos_maximos)
            {
                throw new Error("El cupón ya no tiene usos disponibles");
            }

            const resProductosCupon = await pool.query(queryVerificarProductosCupon, [datosCupon.id_cupon_desc]);
            const productosCupon = resProductosCupon.rows.map(function (fila)
            {
                return fila.id_producto;
            });

            let totalAplicable = 0;
            let aplicaAlguno = false;

            for (let i = 0; i < listaProductos.length; i++)
            {
                const producto = listaProductos[i];
                const infoProducto = listaProdCompleta[i];

                if (productosCupon.length === 0 || productosCupon.includes(producto.idProducto))
                {
                    totalAplicable = totalAplicable + Number(infoProducto.precio) * producto.cantidad;
                    aplicaAlguno = true;
                }
            }

            if (!aplicaAlguno)
            {
                throw new Error("El cupón no aplica a los productos de la compra");
            }

            const valorCupon = Number(datosCupon.valor);

            if (datosCupon.tipo === 'PORCENTAJE')
            {
                descuento = totalAplicable * valorCupon / 100;
            }
            else
            {
                descuento = valorCupon;
                if (descuento > totalAplicable)
                {
                    descuento = totalAplicable;
                }
            }

            descuento = Math.round(descuento * 100) / 100;
            idCuponDesc = datosCupon.id_cupon_desc;
        }


        usuario.idCliente = await crearClienteService(usuario, tienda);

        const resultadoVenta = await pool.query(queryVenta, [tienda.idTienda, usuario.idCliente, idCuponDesc]);
        const idVenta = resultadoVenta.rows[0].id_venta;

        for (let i = 0; i < listaProductos.length; i++)
        {
            const producto = listaProductos[i];
            const infoProducto = listaProdCompleta[i];
            const subtotal = Number(infoProducto.precio) * producto.cantidad;

            let idLicVta = null;
            if (infoProducto.usa_licencia)
            {
                const keyHash = await crearKeyHash(usuario);
                const licencia = new licenciaVenta({
                    idProducto: producto.idProducto,
                    claveDigital: keyHash[0]
                });

                idLicVta = await crearLicenciaVentaService(licencia);
            }

            await pool.query(queryItem, [idVenta, producto.idProducto, infoProducto.precio,
                producto.cantidad, subtotal, idLicVta]);

            precioFinal = precioFinal + subtotal;
        }

        precioFinal = Math.round((precioFinal - descuento) * 100) / 100;

        await pool.query(queryActualizarPrecio, [precioFinal, idVenta]);

        if (precioFinal === 0)
        {
            await finalizarVentaService({ idVenta: idVenta });
        }

        return [idVenta, listaProdCompleta, precioFinal, descuento];
    }
    catch (err)
    {
        throw new Error(err.message);
    }
}

export async function obtenerVentaService(venta)
{
    const query = `
        SELECT
            Personas.id_persona,
            Personas.email,
            Personas.nombre,
            Personas.apellido,
            Detalle_Venta.id_producto,
            Detalle_Venta.precio_unitario,
            Productos.nombre_prod,
            Productos.precio,
            Productos.imagen_prod,
            Detalle_Venta.cantidad,
            Productos_Digitales.archivo_prod,
            Licencia_Venta.clave_digital
        FROM Ventas
        JOIN Clientes
            ON Ventas.id_cliente = Clientes.id_cliente
        JOIN Personas
            ON Clientes.id_persona = Personas.id_persona
        JOIN Detalle_Venta
            ON Ventas.id_venta = Detalle_Venta.id_venta
        JOIN Productos
            ON Detalle_Venta.id_producto = Productos.id_producto
        LEFT JOIN Productos_Digitales
            ON Productos.id_producto = Productos_Digitales.id_producto
        LEFT JOIN Licencia_Venta
            ON Licencia_Venta.id_lic_vta = Detalle_Venta.id_lic_vta
        WHERE Ventas.id_venta = $1;
    `;

    try
    {
        const resultado = await pool.query(query, [venta.idVenta]);
        return resultado.rows;
    }
    catch(err)
    {
        throw new Error(err.message);
    }
}

export async function finalizarVentaService(venta)
{
    const queryUsoCupon = `
        UPDATE cupones_descuento
        SET usos_actuales = COALESCE(usos_actuales, 0) + 1
        WHERE id_cupon_desc = (SELECT id_cupon_desc FROM Ventas WHERE id_venta = $1)
    `;

    const queryVenta = `
        UPDATE Ventas
        SET estado = 'CERRADA', id_pago = COALESCE($2, id_pago)
        WHERE id_venta = $1 AND estado = 'ABIERTA'
    `;
    const queryStock = `
        UPDATE Productos_Fisicos
        SET stock = stock - (
            SELECT SUM(Detalle_Venta.cantidad)
            FROM Detalle_Venta
            WHERE Detalle_Venta.id_venta = $1
            AND Detalle_Venta.id_producto = Productos_Fisicos.id_producto
        )
        WHERE id_producto IN (SELECT id_producto FROM Detalle_Venta WHERE id_venta = $1)
    `;

    try
    {
        const resultado = await pool.query(queryVenta, [venta.idVenta, venta.idPago || null]);
        if (resultado.rowCount === 0)
            {
                return false;
            }
        
        await pool.query(queryStock, [venta.idVenta]);
        await pool.query(queryUsoCupon, [venta.idVenta]);

        const items = await obtenerVentaService(venta);
        try
        {
            const htmlEmail = await generarPlantillaVenta(venta, items);
            await enviarCorreoIndividual({
                to: items[0].email,
                subject: 'Confirmación de compra',
                html: htmlEmail
            });
        }
        catch(err)
        {
            console.error(`No se pudo enviar el mail de la venta ${venta.idVenta}: ${err.message}`);
        }
        for (const item of items)
        {
            try
            {
                const evento = new InteraccionEvento({
                    idPersona: item.id_persona,
                    idProducto: item.id_producto,
                    tipoEvento: 'Compra'
                });
                await publicarEvento('interacciones_feed', {
                    id_persona: evento.idPersona,
                    id_producto: evento.idProducto,
                    tipo_evento: evento.tipoEvento
                });
            }
            catch (errEvento)
            {
                console.error(`No se pudo publicar el evento de compra del producto ${item.id_producto}: ${errEvento.message}`);
            }
        }
        return venta.idVenta;
    }
    catch(err)
    {
        throw new Error(err.message);
    }
}

export async function buscarVentaPorId(venta)
{
    const query = `
        SELECT Ventas.id_venta, Ventas.id_tienda, Ventas.id_cliente, Clientes.id_persona,
            Ventas.estado, Ventas.precio_final, Ventas.fecha_venta, Ventas.id_cupon_desc, Ventas.id_pago
        FROM Ventas
        JOIN Clientes ON Clientes.id_cliente = Ventas.id_cliente
        WHERE Ventas.id_venta = $1
    `;

    try
    {
        const resultado = await pool.query(query, [venta.idVenta]);

        if (resultado.rows.length === 0)
        {
            return null;
        }

        return resultado.rows[0];
    }
    catch (err)
    {
        throw new Error(err.message);
    }
}

export async function obtenerVentaParaPagarService(venta, usuario, metodo)
{
    const infoVenta = await buscarVentaPorId(venta);

    if (!infoVenta || infoVenta.id_persona !== usuario.idPersona)
    {
        throw new Error("Venta no encontrada");
    }

    if (infoVenta.estado !== 'ABIERTA')
    {
        throw new Error("Esta venta ya no se puede pagar");
    }

    const emprendedor = await obtenerEmprendedorPorTienda(new Tiendas({ idTienda: infoVenta.id_tienda }));

    if (metodo === 'QR')
    {
        if (!emprendedor || !emprendedor.mp_qr_access_token || !emprendedor.mp_qr_pos_id)
        {
            throw new Error("Esta tienda todavía no conectó el cobro por QR");
        }
    }
    else
    {
        if (!emprendedor || !emprendedor.mp_access_token)
        {
            throw new Error("Esta tienda todavía no conectó su cuenta de Mercado Pago");
        }
    }

    return [infoVenta, emprendedor];
}



export async function obtenerVentasClienteService(venta)
{
    const query = `
        SELECT id_venta, fecha_venta, id_tienda, precio_final, estado
        FROM Ventas
        WHERE id_cliente = $1
        ORDER BY fecha_venta DESC
    `;

    try
    {
        const resultado = await pool.query(query, [venta.idCliente]);
        return resultado.rows;
    }
    catch(err)
    {
        throw new Error(err.message);
    }
}


export async function verificarAccesoVentaService(venta, usuario, tienda)
{
    const infoVenta = await buscarVentaPorId(venta);

    if (!infoVenta)
    {
        return null;
    }

    if (infoVenta.id_persona === usuario.idPersona || infoVenta.id_tienda === tienda.idTienda)
    {
        return infoVenta;
    }

    return null;
}

export async function obtenerVentasPersonaService(cliente)
{
    const query = `
        SELECT Ventas.id_venta, Ventas.fecha_venta, Ventas.id_tienda, Ventas.precio_final, Ventas.estado
        FROM Ventas
        JOIN Clientes ON Clientes.id_cliente = Ventas.id_cliente
        WHERE Clientes.id_persona = $1
        ORDER BY Ventas.fecha_venta DESC
    `;

    try
    {
        const resultado = await pool.query(query, [cliente.idPersona]);
        return resultado.rows;
    }
    catch (err)
    {
        throw new Error(err.message);
    }
}