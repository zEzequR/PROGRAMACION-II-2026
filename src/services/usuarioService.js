import pool from '../config/conexion.js'
import { comparePsw } from '../utils/password.js'
import { guardarUbicacionService, actualizarUbicacionService,
    ubicacionCompartidaService, copiarUbicacionService } from './ubicacionesService.js'
import { guardarInteresesService } from './interesesService.js'
import { cambiarActivoTiendaService, buscarTiendaPorPersona } from './tiendasService.js'
import { Tiendas } from '../models/tiendas.js'

export async function registrarseManualService(user, ubicacion, categorias)
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

    try
    {
        const existente = await buscarUsuarioPorEmail(user);

        if (existente)
        {
            throw new Error("El email ya está registrado");
        }
        
        const idUbicacion = await guardarUbicacionService(ubicacion);
        user.idUbicacion = idUbicacion;

        const values = [user.email, user.psw, user.tipoAuth,
        user.nombre, user.apellido, user.telefono, user.idUbicacion, user.activo];
        
        const resultado = await pool.query(query, values);
        const nuevaPersona = resultado.rows[0];

        user.idPersona = nuevaPersona.id_persona
        await guardarInteresesService(user, categorias)

        return nuevaPersona;
    }
    catch(err)
    {
        throw new Error(err.message)
    }
}

export async function autenticarUsuarioService(user)
{
    try
    {
        const usuarioEncontrado = await buscarUsuarioPorEmail(user);

        if (!usuarioEncontrado || usuarioEncontrado.psw === null)
        {
            throw new Error("Credenciales inválidas");
        }
        if (!await comparePsw(user.psw, usuarioEncontrado.psw))
        {
            throw new Error("Credenciales inválidas");
        }

        return usuarioEncontrado;
    }
    catch(err)
    {
        throw new Error(err.message)
    }
}


export async function modificarUsuarioService(usuario, ubicacion, categorias) {
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
            if (categorias !== undefined)
            {
                await guardarInteresesService(usuario, categorias);
            }

            if (ubicacion !== undefined)
            {
                const usuarioActual = await buscarUsuarioPorId(usuario);

                if (usuarioActual && usuarioActual.id_ubicacion)
                {
                    ubicacion.idUbicacion = usuarioActual.id_ubicacion;
                    const compartida = await ubicacionCompartidaService(usuario, ubicacion);

                    if (compartida)
                    {
                        const queryCambiarUbicacion = `UPDATE Personas SET id_ubicacion = $2 WHERE id_persona = $1`;
                        const idNueva = await copiarUbicacionService(ubicacion);
                        await pool.query(queryCambiarUbicacion, [usuario.idPersona, idNueva]);
                    }
                    else
                    {
                        await actualizarUbicacionService(ubicacion);
                    }
                }
            }

            const resultado = await pool.query(query, values);
            if (resultado.rowCount === 0)
            {
                throw new Error("Usuario no encontrado");
            }
            return resultado.rows[0];
    }
    catch (err)
    {
        throw new Error(err.message);
    }
}

export async function cambiarActivoUsuarioService(user)
{
    const query = `
        UPDATE Personas SET activo = $2
        WHERE id_persona = $1
        RETURNING id_persona, email, nombre, apellido, telefono
    `;

    try
    {
        const resultado = await pool.query(query, [user.idPersona, user.activo]);

        if (resultado.rowCount === 0)
        {
            throw new Error("Usuario no encontrado");
        }

        const tiendaPersona = await buscarTiendaPorPersona(user);
        if (tiendaPersona && tiendaPersona.id_tienda)
        {
            const tienda = new Tiendas(
                { 
                    idTienda: tiendaPersona.id_tienda,
                    activo: user.activo
                });
            await cambiarActivoTiendaService(tienda);
        }

        return resultado.rows[0];
    }
    catch (err)
    {
        throw new Error(err.message);
    }
}


export async function buscarUsuarioPorEmail(user)
{
    const query = `
        SELECT id_persona, email, psw, tipo_auth, nombre, apellido, telefono, id_ubicacion, activo
        FROM Personas
        WHERE email = $1
    `;

    try
    {
        const resultado = await pool.query(query, [user.email]);

        if (resultado.rows.length === 0)
        {
            return null;
        }

        return resultado.rows[0];
    }
    catch (err)
    {
        throw new Error(err.message);
    }
}

export async function buscarUsuarioPorId(user)
{
    const query = `
        SELECT Personas.id_persona, Personas.email, Personas.tipo_auth, Personas.nombre, Personas.apellido,
            Personas.telefono, Personas.activo, Personas.id_ubicacion,
            Ubicaciones.direccion, Ubicaciones.piso, Ubicaciones.depto, Ubicaciones.pais,
            Ubicaciones.provincia, Ubicaciones.ciudad, Ubicaciones.codigo
        FROM Personas
        LEFT JOIN Ubicaciones ON Ubicaciones.id_ubicacion = Personas.id_ubicacion
        WHERE Personas.id_persona = $1
    `;

    try
    {
        const resultado = await pool.query(query, [user.idPersona]);

        if (resultado.rows.length === 0)
        {
            return null;
        }

        return resultado.rows[0];
    }
    catch (err)
    {
        throw new Error(err.message);
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

        if (resultado.rowCount === 0)
        {
            throw new Error("Usuario no encontrado");
        }

        return true;
    }
    catch(err)
    {
        throw new Error(err.message)
    }   
}