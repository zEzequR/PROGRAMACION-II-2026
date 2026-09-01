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
        id_ubicacion,
        activo)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
    `
    const values = [user.email, user.psw, user.tipoAuth,
        user.nombre, user.apellido, user.telefono, user.idUbicacion , user.activo]

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

export async function autenticarUsuarioService(user)
{
    const query = `
        SELECT * FROM Personas WHERE email = $1
    `

    try
    {
        const resultado = await pool.query(query, [user.email]);

        if (resultado.rows.length === 0)
        {
            throw new Error("Credenciales inválidas");
        }

        if (!await comparePsw(user.psw, resultado.rows[0].psw))
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

export async function modificarUsuarioService(usuario) {
    const query = `
        UPDATE Personas
        SET
            nombre = COALESCE($2, nombre),
            apellido = COALESCE($3, apellido),
            telefono = COALESCE($4, telefono)
        WHERE id_persona = $1
        RETURNING id_persona, email, nombre, apellido, telefono;
    `;

    const values = [
        usuario.idPersona,
        usuario.nombre,
        usuario.apellido,
        usuario.telefono
    ];

    try {
        const resultado = await pool.query(query, values);
        if (resultado.rowCount === 0) {
            throw new Error("Usuario no encontrado");
        }
        return resultado.rows[0];
    } catch (err) {
        throw new Error(err.message);
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

export async function obtenerIDUsuario(user)
{
    const query = `
        SELECT * FROM Personas WHERE email = $1
    `

    try
    {
        const resultado = await pool.query(query, [user.email]);

        if (resultado.rows.length === 0)
        {
            throw new Error("Credenciales inválidas");
        }
        else
        {
            return resultado.rows[0]
        }
    }
    catch(err)
    {
        throw new Error(err.message)
    }   
}


export async function cambiarPswUsuario(user)
{
    const query = `
        UPDATE Personas SET psw = $3 WHERE id_persona = $1 AND email = $2
    `

    try
    {
        const resultado = await pool.query(query, [user.idPersona, user.email, user.psw]);

        if (resultado.rows.length === 0)
        {
            throw new Error("Credenciales inválidas");
        }
        else
        {
            return resultado.rows[0]
        }
    }
    catch(err)
    {
        throw new Error(err.message)
    }   
}