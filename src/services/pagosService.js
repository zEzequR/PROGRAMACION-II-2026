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
            ON CONFLICT (id_transaccion) DO UPDATE SET
                estado = EXCLUDED.estado,
                metodo_pago = EXCLUDED.metodo_pago,
                monto = EXCLUDED.monto
            RETURNING id_det_pago`,
            [pago.idTransaccion, pago.estado, pago.metodoPago, pago.monto]
        );
        const idDetPago = detPagoRes.rows[0].id_det_pago;

        const pagoExistente = await client.query(
            `SELECT id_pago FROM Pagos WHERE id_det_pago = $1`,
            [idDetPago]
        );

        if (pagoExistente.rows.length > 0)
        {
            await client.query('COMMIT');
            return pagoExistente.rows[0].id_pago;
        }

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