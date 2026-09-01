import pool from '../config/conexion.js'

export async function guardarUbicacionService(ubicacion)
{
    const query = `
        INSERT INTO Ubicaciones (
            direccion,
            piso,
            depto,
            pais,
            provincia,
            ciudad,
            codigo,
            placeid
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id_ubicacion;
        `
    const values = [
        ubicacion.direccion,
        ubicacion.piso,
        ubicacion.depto,
        ubicacion.pais,
        ubicacion.provincia,
        ubicacion.ciudad,
        ubicacion.codigo,
        ubicacion.placeid
    ];

    try
    {
        const resultado = await pool.query(query, values);
        return resultado.rows[0].id_ubicacion;
;
    }
    catch(err)
    {
        throw new Error(err.message);
    }
}

export async function actualizarUbicacionService(ubicacion)
{
    const query = `
        UPDATE Ubicaciones SET
            direccion = COALESCE($2, direccion),
            piso = COALESCE($3, piso),
            depto = COALESCE($4, depto),
            pais = COALESCE($5, pais),
            provincia = COALESCE($6, provincia),
            ciudad = COALESCE($7, ciudad),
            codigo = COALESCE($8, codigo),
            placeid = COALESCE($9, placeid)
        WHERE id_ubicacion = $1
        `
    const values = [
        ubicacion.direccion,
        ubicacion.piso,
        ubicacion.depto,
        ubicacion.pais,
        ubicacion.provincia,
        ubicacion.ciudad,
        ubicacion.codigo,
        ubicacion.placeid
    ];

    try
    {
        const resultado = await pool.query(query, values);
        return resultado.rows[0];
    }
    catch(err)
    {
        throw new Error(err.message);
    }
}