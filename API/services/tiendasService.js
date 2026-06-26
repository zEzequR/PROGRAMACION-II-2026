import pool from '../config/conexion.js'

export async function crearTiendaService(tienda)
{
    const query = `
        CALL spu_crear_tienda($1, $2, $3, $4)
        RETURNING *
        `
    const values = [tienda.idPlantilla,
        tienda.nombreTienda,
        tienda.logoTienda,
        tienda.personalizacionTienda];

    try
    {
        const resultado = await pool.query(query, values);
        return resultado.rows[0]
    }
    catch(err)
    {
        throw new Error(err.message)
    }
}

export async function modificarTiendaService(tienda)
{
    const query = `
        CALL spu_modificar_tienda($1, $2, $3, $4, $5)
        RETURNING *
        `
    const values = [tienda.idTienda,
        tienda.idPlantilla,
        tienda.nombreTienda,
        tienda.logoTienda,
        tienda.personalizacionTienda];
    try
    {
        resultado = await pool.query(query, values);
        return resultado.rows[0]
    }
    catch(err)
    {
        throw new Error(err.message)
    }
}