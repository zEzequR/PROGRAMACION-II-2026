import pool from '../config/conexion.js'

export async function crearVentaService(venta)
{
    const query = `SELECT fn_crear_venta($1, $2) AS id_venta`;
    const resultado = await pool.query(query, [venta.idTienda, venta.idCliente]);
    return resultado.rows[0].id_venta;
}

export async function obtenerVentaService(idVenta)
{
    const query = `SELECT * FROM fn_obtener_venta($1)`;
    const resultado = await pool.query(query, [idVenta]);
    return resultado.rows;
}

export async function obtenerVentasClienteService(idCliente)
{
    const query = `SELECT * FROM fn_obtener_ventas_cliente($1)`;
    const resultado = await pool.query(query, [idCliente]);
    return resultado.rows;
}

export async function cerrarVentaService(idVenta, idPago)
{
    const query = `CALL spu_cerrar_venta($1, $2)`;
    await pool.query(query, [idVenta, idPago]);
}

export async function cancelarVentaService(idVenta)
{
    const query = `CALL spu_cancelar_venta($1)`;
    await pool.query(query, [idVenta]);
}