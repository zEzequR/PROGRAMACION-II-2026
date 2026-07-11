import e from 'express';
import pool from '../config/conexion.js'
import { comparePsw } from '../utils/password.js'

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

export async function autenticarUsuarioService(email, psw)
{
    const query = `
        SELECT * FROM Personas WHERE email = $1
    `

    try
    {
        const resultado = await pool.query(query, [email]);

        if (resultado.rows.length === 0)
        {
            throw new Error("Credenciales inválidas");
        }

        if (!await comparePsw(psw, resultado.rows[0].psw))
            {
                throw new Error("Credenciales inválidas");
            }
        return resultado.rows[0]
    }
    catch(err)
    {
        throw new Error(err.message)
    }   
}


export async function obtenerIdTienda(idPersona) {
    const query = `
        SELECT tiendas.id_tienda
        FROM tiendas
        JOIN emprendedores ON tiendas.id_emprendedor = emprendedores.id_emprendedor
        WHERE emprendedores.id_persona = $1 AND tiendas.activo = TRUE
    `;
    
    try {
        const resultado = await pool.query(query, [idPersona]);
        
        if (resultado.rowCount > 0) {
            return resultado.rows[0].id_tienda;
        }
        return null;
        
    } catch(err) {
        throw new Error(err.message);
    }
}