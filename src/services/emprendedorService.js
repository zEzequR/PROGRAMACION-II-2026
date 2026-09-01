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

export async function modificarEmprendedorService(emprendedor) {
    const query = `
        UPDATE Emprendedores
        SET
            cuit = COALESCE($2, cuit),
            mp_access_token = COALESCE($3, mp_access_token)
        WHERE id_persona = $1;`

    const values = [
        emprendedor.idPersona,
        emprendedor.cuit || null,
        emprendedor.mpAccessToken || null
    ]

    try {
        await client.query(query, values);
        return true;
    }
    catch (err) {
        throw new Error(err.message);
    }
}