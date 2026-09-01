import pool from '../config/conexion.js'

export async function crearVentaService(venta)
{
    const query = `
        INSERT INTO Ventas (fecha_venta, id_tienda, id_cliente, precio_final, estado)
        VALUES (CURRENT_DATE, $1, $2, 0, 'ABIERTA')
        RETURNING id_venta
    `;

    try
    {
        const resultado = await pool.query(query, [venta.idTienda, venta.idCliente]);
        return resultado.rows[0].id_venta;
    }
    catch(err)
    {
        throw new Error(err.message);
    }
}

async function agregarItem(client, idVenta, idProducto, cantidad)
{
    const infoRes = await client.query(
        `SELECT p.precio, p.tipo_prod, p.activo, pf.stock
         FROM Productos p
         LEFT JOIN Productos_Fisicos pf ON pf.id_producto = p.id_producto
         WHERE p.id_producto = $1`,
        [idProducto]
    );
    const info = infoRes.rows[0];

    if (!info || !info.activo)
    {
        throw new Error(`Producto ${idProducto} no existe o no está activo`);
    }

    if (info.tipo_prod === 'FISICO' && info.stock < cantidad)
    {
        throw new Error(`Stock insuficiente para el producto ${idProducto} (disponible: ${info.stock})`);
    }

    const subtotal = Number(info.precio) * cantidad;

    await client.query(
        `INSERT INTO Detalle_Venta (id_venta, id_producto, precio_unitario, cantidad, subtotal)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id_venta, id_producto)
         DO UPDATE SET
             cantidad = Detalle_Venta.cantidad + EXCLUDED.cantidad,
             subtotal = Detalle_Venta.subtotal + EXCLUDED.subtotal`,
        [idVenta, idProducto, info.precio, cantidad, subtotal]
    );

    await client.query(
        `UPDATE Ventas
         SET precio_final = (SELECT COALESCE(SUM(subtotal), 0) FROM Detalle_Venta WHERE id_venta = $1)
         WHERE id_venta = $1`,
        [idVenta]
    );
}

export async function finalizarVentaService(venta, items)
{
    const client = await pool.connect();

    try
    {
        await client.query('BEGIN');

        const ventaRes = await client.query(
            `INSERT INTO Ventas (fecha_venta, id_tienda, id_cliente, precio_final, estado)
             VALUES (CURRENT_DATE, $1, $2, 0, 'ABIERTA')
             RETURNING id_venta`,
            [venta.idTienda, venta.idCliente]
        );
        const idVenta = ventaRes.rows[0].id_venta;

        for (const item of items)
        {
            await agregarItem(client, idVenta, item.idProducto, item.cantidad);
        }

        await client.query('COMMIT');
        return idVenta;
    }
    catch(err)
    {
        await client.query('ROLLBACK');
        throw new Error(err.message);
    }
    finally
    {
        client.release();
    }
}

export async function cerrarVentaService(idVenta, idPago)
{
    const client = await pool.connect();

    try
    {
        await client.query('BEGIN');

        const itemsRes = await client.query(
            `SELECT dv.id_producto, dv.cantidad, p.tipo_prod
             FROM Detalle_Venta dv
             JOIN Productos p ON p.id_producto = dv.id_producto
             WHERE dv.id_venta = $1`,
            [idVenta]
        );

        for (const item of itemsRes.rows)
        {
            if (item.tipo_prod === 'FISICO')
            {
                await client.query(
                    `UPDATE Productos_Fisicos SET stock = stock - $1 WHERE id_producto = $2`,
                    [item.cantidad, item.id_producto]
                );
            }
            else if (item.tipo_prod === 'DIGITAL')
            {
                const licRes = await client.query(
                    `SELECT lv.id_lic_vta
                     FROM Productos_Digitales pd
                     JOIN Licencia_Venta lv ON lv.id_lic_vta = pd.id_lic_vta
                     WHERE pd.id_producto = $1 AND lv.clave_usada = FALSE
                     LIMIT 1`,
                    [item.id_producto]
                );
                const idLicVta = licRes.rows[0]?.id_lic_vta;

                if (!idLicVta)
                {
                    throw new Error(`No hay licencias disponibles para el producto ${item.id_producto}`);
                }

                await client.query(`UPDATE Licencia_Venta SET clave_usada = TRUE WHERE id_lic_vta = $1`, [idLicVta]);

                await client.query(
                    `UPDATE Detalle_Venta SET id_lic_vta = $1 WHERE id_venta = $2 AND id_producto = $3`,
                    [idLicVta, idVenta, item.id_producto]
                );
            }
        }

        await client.query(
            `UPDATE Ventas SET estado = 'CERRADA', id_pago = $1 WHERE id_venta = $2`,
            [idPago, idVenta]
        );

        await client.query('COMMIT');
        return true;
    }
    catch(err)
    {
        await client.query('ROLLBACK');
        throw new Error(err.message);
    }
    finally
    {
        client.release();
    }
}

export async function obtenerVentaService(idVenta)
{
    const query = `
        SELECT
            v.id_venta, v.fecha_venta, v.id_tienda, v.id_cliente, v.precio_final, v.estado,
            dv.id_producto, p.nombre_prod, dv.precio_unitario, dv.cantidad, dv.subtotal
        FROM Ventas v
        LEFT JOIN Detalle_Venta dv ON dv.id_venta = v.id_venta
        LEFT JOIN Productos p ON p.id_producto = dv.id_producto
        WHERE v.id_venta = $1
    `;

    try
    {
        const resultado = await pool.query(query, [idVenta]);
        return resultado.rows;
    }
    catch(err)
    {
        throw new Error(err.message);
    }
}

export async function obtenerVentasClienteService(idCliente)
{
    const query = `
        SELECT id_venta, fecha_venta, id_tienda, precio_final, estado
        FROM Ventas
        WHERE id_cliente = $1
        ORDER BY fecha_venta DESC
    `;

    try
    {
        const resultado = await pool.query(query, [idCliente]);
        return resultado.rows;
    }
    catch(err)
    {
        throw new Error(err.message);
    }
}

export async function cancelarVentaService(idVenta)
{
    const query = `
        UPDATE Ventas
        SET estado = 'CANCELADA'
        WHERE id_venta = $1 AND estado = 'ABIERTA'
    `;

    try
    {
        await pool.query(query, [idVenta]);
        return true;
    }
    catch(err)
    {
        throw new Error(err.message);
    }
}