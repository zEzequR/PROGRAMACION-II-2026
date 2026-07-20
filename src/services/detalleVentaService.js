import pool from '../config/conexion.js'

export async function agregarDetalleVentaService(idVenta, idProducto, cantidad)
{
    const query = `CALL spu_agregar_detalle_venta($1, $2, $3)`;
    await pool.query(query, [idVenta, idProducto, cantidad]);
}

export async function eliminarDetalleVentaService(idVenta, idProducto)
{
    const query = `CALL spu_eliminar_detalle_venta($1, $2)`;
    await pool.query(query, [idVenta, idProducto]);
}