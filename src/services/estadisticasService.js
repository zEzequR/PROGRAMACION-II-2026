import pool from '../config/conexion.js'
import { stringify } from 'csv-stringify/sync'

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export async function obtenerEstadisticasService(tienda, desde, hasta)
{
    const [resumen, ingresosPorDia, ventasPorDia, ventasPorCategoria, productosMasVendidos, ordenesRecientes] = await Promise.all([
        obtenerResumen(tienda, desde, hasta),
        obtenerIngresosPorDia(tienda, desde, hasta),
        obtenerVentasPorDia(tienda, desde, hasta),
        obtenerVentasPorCategoria(tienda, desde, hasta),
        obtenerProductosMasVendidos(tienda, desde, hasta),
        obtenerOrdenesRecientes(tienda)
    ]);

    return { resumen, ingresosPorDia, ventasPorDia, ventasPorCategoria, productosMasVendidos, ordenesRecientes };
}

async function obtenerResumen(tienda, desde, hasta)
{
    const queryVentas = `
        SELECT COALESCE(SUM(precio_final), 0) AS ingresos, COUNT(*) AS ordenes
        FROM Ventas
        WHERE id_tienda = $1 AND estado = 'CERRADA' AND fecha_venta BETWEEN $2 AND $3
    `;

    const queryClientes = `
        SELECT COUNT(*) AS clientes
        FROM Clientes
        WHERE id_tienda = $1 AND fecha_alta BETWEEN $2 AND $3
    `;

    try
    {
        const resVentas = await pool.query(queryVentas, [tienda.idTienda, desde, hasta]);
        const resClientes = await pool.query(queryClientes, [tienda.idTienda, desde, hasta]);

        return {
            ingresosTotales: Number(resVentas.rows[0].ingresos),
            cantidadOrdenes: Number(resVentas.rows[0].ordenes),
            clientesNuevos: Number(resClientes.rows[0].clientes),
            tasaConversion: null
        };
    }
    catch(err)
    {
        throw new Error(err.message);
    }
}

async function obtenerIngresosPorDia(tienda, desde, hasta)
{
    const query = `
        SELECT TO_CHAR(fecha_venta, 'DD/MM') AS fecha, SUM(precio_final) AS monto
        FROM Ventas
        WHERE id_tienda = $1 AND estado = 'CERRADA' AND fecha_venta BETWEEN $2 AND $3
        GROUP BY fecha_venta
        ORDER BY fecha_venta
    `;

    try
    {
        const resultado = await pool.query(query, [tienda.idTienda, desde, hasta]);
        return resultado.rows.map(function (fila) {
            return { fecha: fila.fecha, monto: Number(fila.monto) };
        });
    }
    catch(err)
    {
        throw new Error(err.message);
    }
}

async function obtenerVentasPorDia(tienda, desde, hasta)
{
    const query = `
        SELECT EXTRACT(DOW FROM fecha_venta) AS dia, COUNT(*) AS ventas
        FROM Ventas
        WHERE id_tienda = $1 AND estado = 'CERRADA' AND fecha_venta BETWEEN $2 AND $3
        GROUP BY dia
        ORDER BY dia
    `;

    try
    {
        const resultado = await pool.query(query, [tienda.idTienda, desde, hasta]);
        return resultado.rows.map(function (fila) {
            return { dia: DIAS_SEMANA[fila.dia], ventas: Number(fila.ventas) };
        });
    }
    catch(err)
    {
        throw new Error(err.message);
    }
}

async function obtenerVentasPorCategoria(tienda, desde, hasta)
{
    const query = `
        SELECT Categorias_Productos.categoria, SUM(Detalle_Venta.cantidad) AS cantidad
        FROM Detalle_Venta
        INNER JOIN Ventas ON Ventas.id_venta = Detalle_Venta.id_venta
        INNER JOIN Productos ON Productos.id_producto = Detalle_Venta.id_producto
        INNER JOIN Categorias_Productos ON Categorias_Productos.id_cat = Productos.id_cat
        WHERE Ventas.id_tienda = $1 AND Ventas.estado = 'CERRADA' AND Ventas.fecha_venta BETWEEN $2 AND $3
        GROUP BY Categorias_Productos.categoria
        ORDER BY cantidad DESC
    `;

    try
    {
        const resultado = await pool.query(query, [tienda.idTienda, desde, hasta]);
        return resultado.rows.map(function (fila) {
            return { categoria: fila.categoria, cantidad: Number(fila.cantidad) };
        });
    }
    catch(err)
    {
        throw new Error(err.message);
    }
}

async function obtenerProductosMasVendidos(tienda, desde, hasta)
{
    const query = `
        SELECT Productos.id_producto, Productos.nombre_prod,
            SUM(Detalle_Venta.cantidad) AS unidades,
            SUM(Detalle_Venta.subtotal) AS ingresos
        FROM Detalle_Venta
        JOIN Ventas ON Ventas.id_venta = Detalle_Venta.id_venta
        JOIN Productos ON Productos.id_producto = Detalle_Venta.id_producto
        WHERE Ventas.id_tienda = $1 AND Ventas.estado = 'CERRADA' AND Ventas.fecha_venta BETWEEN $2 AND $3
        GROUP BY Productos.id_producto, Productos.nombre_prod
        ORDER BY unidades DESC
        LIMIT 4
    `;

    try
    {
        const resultado = await pool.query(query, [tienda.idTienda, desde, hasta]);
        return resultado.rows.map(function (fila) {
            return {
                idProducto: fila.id_producto,
                nombre: fila.nombre_prod,
                unidadesVendidas: Number(fila.unidades),
                ingresos: Number(fila.ingresos)
            };
        });
    }
    catch(err)
    {
        throw new Error(err.message);
    }
}

export async function generarCsvEstadisticasService(tienda, desde, hasta)
{
    const estadisticas = await obtenerEstadisticasService(tienda, desde, hasta);
    return construirCsv(estadisticas);
}

function construirCsv(estadisticas)
{
    const secciones = [];

    secciones.push(armarSeccionCsv('Resumen', [estadisticas.resumen], [
        { key: 'ingresosTotales', header: 'Ingresos totales' },
        { key: 'cantidadOrdenes', header: 'Cantidad de ordenes' },
        { key: 'clientesNuevos', header: 'Clientes nuevos' }
    ]));

    secciones.push(armarSeccionCsv('Ingresos por dia', estadisticas.ingresosPorDia, [
        { key: 'fecha', header: 'Fecha' },
        { key: 'monto', header: 'Monto' }
    ]));

    secciones.push(armarSeccionCsv('Ventas por dia', estadisticas.ventasPorDia, [
        { key: 'dia', header: 'Dia' },
        { key: 'ventas', header: 'Ventas' }
    ]));

    secciones.push(armarSeccionCsv('Ventas por categoria', estadisticas.ventasPorCategoria, [
        { key: 'categoria', header: 'Categoria' },
        { key: 'cantidad', header: 'Cantidad' }
    ]));

    secciones.push(armarSeccionCsv('Productos mas vendidos', estadisticas.productosMasVendidos, [
        { key: 'nombre', header: 'Producto' },
        { key: 'unidadesVendidas', header: 'Unidades vendidas' },
        { key: 'ingresos', header: 'Ingresos' }
    ]));

    secciones.push(armarSeccionCsv('Ordenes recientes', estadisticas.ordenesRecientes, [
        { key: 'idVenta', header: 'ID venta' },
        { key: 'cliente', header: 'Cliente' },
        { key: 'producto', header: 'Producto' },
        { key: 'monto', header: 'Monto' },
        { key: 'estado', header: 'Estado' }
    ]));

    return secciones.join('\n\n');
}

function armarSeccionCsv(titulo, filas, columnas)
{
    const csv = stringify(filas, { header: true, columns: columnas });
    return titulo + '\n' + csv.trim();
}

async function obtenerOrdenesRecientes(tienda)
{
    const query = `
        SELECT Ventas.id_venta,
            Personas.nombre || ' ' || Personas.apellido AS cliente,
            STRING_AGG(Productos.nombre_prod, ', ') AS producto,
            Ventas.precio_final,
            Ventas.estado
        FROM Ventas
        JOIN Clientes ON Clientes.id_cliente = Ventas.id_cliente
        JOIN Personas ON Personas.id_persona = Clientes.id_persona
        JOIN Detalle_Venta ON Detalle_Venta.id_venta = Ventas.id_venta
        JOIN Productos ON Productos.id_producto = Detalle_Venta.id_producto
        WHERE Ventas.id_tienda = $1
        GROUP BY Ventas.id_venta, Personas.nombre, Personas.apellido, Ventas.precio_final, Ventas.estado
        ORDER BY Ventas.id_venta DESC
        LIMIT 5
    `;

    try
    {
        const resultado = await pool.query(query, [tienda.idTienda]);
        return resultado.rows.map(function (fila) {
            return {
                idVenta: fila.id_venta,
                cliente: fila.cliente,
                producto: fila.producto,
                monto: Number(fila.precio_final),
                estado: fila.estado
            };
        });
    }
    catch(err)
    {
        throw new Error(err.message);
    }
}