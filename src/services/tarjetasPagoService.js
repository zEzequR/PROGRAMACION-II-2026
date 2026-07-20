import pool from '../config/conexion.js'

export async function obtenerTarjetasClienteService(idCliente)
{
    const query = `SELECT * FROM fn_obtener_tarjetas_cliente($1)`;
    const resultado = await pool.query(query, [idCliente]);
    return resultado.rows;
}

export async function guardarTarjetaClienteService(datos)
{
    const query = `CALL spu_guardar_tarjeta_cliente($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`;
    const values =
    [
        datos.idCliente,
        'mercadopago',
        datos.customerId,
        datos.cardId,
        datos.ultimosDigitos,
        datos.marca,
        datos.expiraMes,
        datos.expiraAno,
        datos.porDefecto,
        datos.issuerId
    ];

    await pool.query(query, values);
}