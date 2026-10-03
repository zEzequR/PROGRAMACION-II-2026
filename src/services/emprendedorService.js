import pool from '../config/conexion.js'

export async function crearEmprendedorService(emprendedor)
{
    const query = `
        INSERT INTO Emprendedores(id_persona, cuit)
            VALUES ($1, $2)
            RETURNING id_emprendedor
        `
    const values = [emprendedor.idPersona, emprendedor.cuit];

    try
    {
        const resultado = await pool.query(query, values);
        return resultado.rows[0].id_emprendedor
    }
    catch(err)
    {
        throw new Error(err.message);
    }
}

export async function modificarEmprendedorService(emprendedor)
{
    const query = `
        UPDATE Emprendedores
        SET
            cuit = COALESCE($2, cuit),
            mp_access_token = COALESCE($3, mp_access_token),
            mp_refresh_token = COALESCE($4, mp_refresh_token),
            mp_user_id = COALESCE($5, mp_user_id),
            mp_public_key = COALESCE($6, mp_public_key),
            mp_token_expires_at = COALESCE($7, mp_token_expires_at),
            mp_qr_access_token = COALESCE($8, mp_qr_access_token),
            mp_qr_refresh_token = COALESCE($9, mp_qr_refresh_token),
            mp_qr_user_id = COALESCE($10, mp_qr_user_id),
            mp_qr_token_expires_at = COALESCE($11, mp_qr_token_expires_at),
            mp_qr_store_id = COALESCE($12, mp_qr_store_id),
            mp_qr_pos_id = COALESCE($13, mp_qr_pos_id)
        WHERE id_persona = $1;`

    const values = [
        emprendedor.idPersona,
        emprendedor.cuit || null,
        emprendedor.mpAccessToken || null,
        emprendedor.mpRefreshToken || null,
        emprendedor.mpUserId || null,
        emprendedor.mpPublicKey || null,
        emprendedor.mpTokenExpiresAt || null,
        emprendedor.mpQrAccessToken || null,
        emprendedor.mpQrRefreshToken || null,
        emprendedor.mpQrUserId || null,
        emprendedor.mpQrTokenExpiresAt || null,
        emprendedor.mpQrStoreId || null,
        emprendedor.mpQrPosId || null
    ];

    try
    {
        await pool.query(query, values);
        return true;
    }
    catch (err)
    {
        throw new Error(err.message);
    }
}


export async function obtenerEmprendedorPorTienda(emprendedor)
{
    const query = `
        SELECT Emprendedores.id_emprendedor, Emprendedores.id_persona, Emprendedores.mp_access_token,
            Emprendedores.mp_refresh_token, Emprendedores.mp_user_id, Emprendedores.mp_public_key,
            Emprendedores.mp_token_expires_at, Emprendedores.mp_qr_access_token,
            Emprendedores.mp_qr_refresh_token, Emprendedores.mp_qr_user_id,
            Emprendedores.mp_qr_token_expires_at, Emprendedores.mp_qr_store_id, Emprendedores.mp_qr_pos_id
        FROM Emprendedores
        JOIN Tiendas ON Tiendas.id_emprendedor = Emprendedores.id_emprendedor
        WHERE Tiendas.id_tienda = $1
    `;

    try
    {
        const resultado = await pool.query(query, [emprendedor.idTienda]);
        if (resultado.rows.length === 0)
        {
            return null;
        }
        return resultado.rows[0];
    }
    catch(err)
    {
        throw new Error(err.message);
    }
}

export async function obtenerEmprendedorPorMpUserId(emprendedor)
{
    const query = `
        SELECT id_emprendedor, id_persona, mp_access_token,
            mp_refresh_token, mp_user_id, mp_public_key, mp_token_expires_at,
            mp_qr_access_token, mp_qr_refresh_token, mp_qr_user_id,
            mp_qr_token_expires_at, mp_qr_store_id, mp_qr_pos_id
        FROM Emprendedores WHERE mp_user_id = $1 OR mp_qr_user_id = $1`;

    try
    {
        const resultado = await pool.query(query, [emprendedor.mpUserId]);
        if (resultado.rows.length === 0)
        {
            return null;
        }
        return resultado.rows[0];
    }
    catch(err)
    {
        throw new Error(err.message);
    }
}