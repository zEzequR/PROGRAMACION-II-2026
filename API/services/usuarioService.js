import e from 'express';
import pool from '../config/conexion.js'

export async function registrarseManualService(user)
{
    const query = `
        INSERT INTO Personas(
        email,
        psw,
        tipo_auth,
        nombre,
        apellido,
        telefono,
        activo)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
    `
    const values = [user.email, user.psw, user.tipo_auth,
        user.nombre, user.apellido, user.telefono, user.activo]

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

export async function buscarUsuarioPorEmailService(email)
{
    const query = `SELECT * FROM Personas WHERE email = $1`

    try
    {
        const resultado = await pool.query(query, [email]);

        if (resultado.rows.length === 0)
        {
            return null;
        }
        return resultado.rows[0]
    }
    catch(err)
    {
        throw new Error(err.message)
    }
}