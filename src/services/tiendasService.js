import pool from '../config/conexion.js'

export async function crearTiendaService(tienda)
{
    const query = `
        INSERT INTO Tiendas(id_emprendedor, id_plantilla,
        nombre_tienda, logo_tienda, personalizacion_tienda)
        VALUES($1, $2, $3, $4, $5)
        RETURNING id_tienda;
        `
    const values = [tienda.idEmprendedor,
        tienda.idPlantilla,
        tienda.nombreTienda,
        tienda.logoTienda,
        tienda.personalizacionTienda];

    try
    {
        const resultado = await pool.query(query, values);
        return resultado.rows[0].id_tienda
    }
    catch(err)
    {
        throw new Error(err.message);
    }
}

export async function modificarTiendaService(tienda)
{
    const query = `
        UPDATE Tiendas SET
        id_plantilla = COALESCE($2, id_plantilla),
        nombre_tienda = COALESCE($3, nombre_tienda),
        logo_tienda = COALESCE($4, logo_tienda),
        personalizacion_tienda = COALESCE($5, personalizacion_tienda)
        WHERE id_tienda = $1;
        `
    const values = [tienda.idTienda,
        tienda.idPlantilla,
        tienda.nombreTienda,
        tienda.logoTienda,
        tienda.personalizacionTienda];
    try
    {
        await pool.query(query, values);
        return true
    }
    catch(err)
    {
        throw new Error(err.message)
    }
}

export async function eliminarTiendaService(tienda)
{
    const query = `
        UPDATE Tiendas 
        SET activo = FALSE
        WHERE id_tienda = $1;
    `

    const values = [
        tienda.idTienda
    ];

    try
    {
        await pool.query(query, values);
        return true
    }
    catch(err)
    {
        throw new Error(err.message);
    }
}

export async function reactivarTiendaService(tienda)
{
    const query = `
    UPDATE Tiendas
    SET activo = TRUE
    WHERE id_tienda = $1;
    `

    const values = [
        tienda.idTienda
    ];

    try
    {
        await pool.query(query, values);
        return true
    }
    catch(err)
    {
        throw new Error(err.message);
    }
}