import pool from '../config/conexion.js'

export async function crearPagoService(pago)
{
    const client = await pool.connect();

    try
    {
        await client.query('BEGIN');

        const detPagoRes = await client.query(
            `INSERT INTO Detalles_Pago (id_transaccion, estado, metodo_pago, monto, fecha_pago)
             VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP(2))
             RETURNING id_det_pago`,
            [pago.idTransaccion, pago.estado, pago.metodoPago, pago.monto]
        );
        const idDetPago = detPagoRes.rows[0].id_det_pago;

        const pagoRes = await client.query(
            `INSERT INTO Pagos (id_det_pago) VALUES ($1) RETURNING id_pago`,
            [idDetPago]
        );

        await client.query('COMMIT');
        return pagoRes.rows[0].id_pago;
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

export async function actualizarPagoService(pago)
{
    const query = `
        UPDATE Detalles_Pago
        SET estado = $1
        WHERE id_det_pago = $2 AND id_transaccion = $3
    `;

    try
    {
        await pool.query(query, [pago.estado, pago.idDetPago, pago.idTransaccion]);
        return true;
    }
    catch(err)
    {
        throw new Error(err.message);
    }
}