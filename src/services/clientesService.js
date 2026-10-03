import pool from '../config/conexion.js'

export async function crearClienteService(usuario, tienda)
{
    const queryBuscar = `
        SELECT id_cliente
        FROM Clientes
        WHERE id_persona = $1 AND id_tienda = $2
    `;

    const queryCrear = `
        INSERT INTO Clientes (id_persona, id_tienda, suscripcion)
        VALUES ($1, $2, $3)
        RETURNING id_cliente
    `;

    try
    {
        const resExistente = await pool.query(queryBuscar, [usuario.idPersona, tienda.idTienda]);

        if (resExistente.rows.length > 0)
        {
            return resExistente.rows[0].id_cliente;
        }

        const resNuevo = await pool.query(queryCrear, [usuario.idPersona, tienda.idTienda, usuario.suscripcion]);
        return resNuevo.rows[0].id_cliente;
    }
    catch (err)
    {
        throw new Error(err.message);
    }
}

export async function seguirTiendaService(usuario, tienda)
{
    const queryBuscar = `
        SELECT id_cliente
        FROM Clientes
        WHERE id_persona = $1 AND id_tienda = $2
    `;

    const queryCrear = `
        INSERT INTO Clientes (id_persona, id_tienda, suscripcion)
        VALUES ($1, $2, TRUE)
        RETURNING id_cliente
    `;

    const queryActualizar = `UPDATE Clientes SET suscripcion = TRUE WHERE id_cliente = $1`;

    try
    {
        const resExistente = await pool.query(queryBuscar, [usuario.idPersona, tienda.idTienda]);

        if (resExistente.rows.length > 0)
        {
            await pool.query(queryActualizar, [resExistente.rows[0].id_cliente]);
            return resExistente.rows[0].id_cliente;
        }

        const resNuevo = await pool.query(queryCrear, [usuario.idPersona, tienda.idTienda]);
        return resNuevo.rows[0].id_cliente;
    }
    catch (err)
    {
        throw new Error(err.message);
    }
}

export async function dejarDeSeguirTiendaService(usuario, tienda)
{
    const query = `UPDATE Clientes SET suscripcion = FALSE WHERE id_persona = $1 AND id_tienda = $2`;

    try
    {
        await pool.query(query, [usuario.idPersona, tienda.idTienda]);
        return true;
    }
    catch (err)
    {
        throw new Error(err.message);
    }
}

export async function obtenerTiendasSeguidasService(usuario)
{
    const query = `
        SELECT Tiendas.id_tienda, Tiendas.nombre_tienda, Tiendas.logo_tienda
        FROM Clientes
        JOIN Tiendas ON Tiendas.id_tienda = Clientes.id_tienda
        WHERE Clientes.id_persona = $1 AND Clientes.suscripcion = TRUE AND Tiendas.activo = TRUE
        ORDER BY Tiendas.nombre_tienda
    `;

    try
    {
        const resultado = await pool.query(query, [usuario.idPersona]);
        return resultado.rows;
    }
    catch (err)
    {
        throw new Error(err.message);
    }
}

export async function verificarAccesoClienteService(venta, usuario, tienda)
{
    const query = `
        SELECT id_persona, id_tienda
        FROM Clientes
        WHERE id_cliente = $1
    `;

    try
    {
        const resultado = await pool.query(query, [venta.idCliente]);

        if (resultado.rows.length === 0)
        {
            return false;
        }

        const cliente = resultado.rows[0];
        return cliente.id_persona === usuario.idPersona || cliente.id_tienda === tienda.idTienda;
    }
    catch (err)
    {
        throw new Error(err.message);
    }
}