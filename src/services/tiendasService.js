import pool from '../config/conexion.js'

export async function crearTiendaService(tienda, emprendedor)
{
    const query = `
        SELECT fn_crear_tienda($1, $2, $3, $4, $5, $6)
        `
    const values = [emprendedor.idPersona,
        emprendedor.cuit,
        tienda.idPlantilla,
        tienda.nombreTienda,
        tienda.logoTienda,
        tienda.personalizacionTienda];

    try
    {
        const resultado = await pool.query(query, values);
        return resultado.rows[0].fn_crear_tienda
    }
    catch(err)
    {
        throw new Error(err.message);
    }
}

export async function modificarTiendaService(tienda, idTienda)
{
    const query = `
        CALL spu_modificar_tienda($1, $2, $3, $4, $5)
        `
    const values = [idTienda,
        tienda.idPlantilla,
        tienda.nombreTienda,
        tienda.logoTienda,
        tienda.personalizacionTienda];
    try
    {
        const resultado = await pool.query(query, values);
        return true
    }
    catch(err)
    {
        throw new Error(err.message)
    }
}

export async function eliminarTiendaService(idTienda)
{
    const query = `
    CALL spu_eliminar_tienda($1, $2)
    `

    const values = [
        idTienda,
        1
    ];

    try
    {
        const resultado = await pool.query(query, values);
        return true
    }
    catch(err)
    {
        throw new Error(err.message);
    }
}

export async function reactivarTiendaService(idTienda)
{
    const query = `
    CALL spu_reactivar_tienda($1)
    `

    const values = [
        idTienda
    ];

    try
    {
        const resultado = await pool.query(query, values);
        return true
    }
    catch(err)
    {
        throw new Error(err.message);
    }
}