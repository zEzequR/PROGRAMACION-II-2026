import pool from '../config/conexion.js'
import { crearEmprendedorService } from './emprendedorService.js';
import { sincronizarProductosTiendaFeed } from './productosService.js';
import { Tiendas } from '../models/tiendas.js';


export async function crearTiendaService(emprendedor, tienda)
{

    const query = `
        INSERT INTO Tiendas(id_emprendedor,
        nombre_tienda, logo_tienda)
        VALUES($1, $2, $3)
        RETURNING id_tienda;
        `

    try
    {
        const tiendaPersona = await buscarTiendaPorPersona(emprendedor);

        if (tiendaPersona && tiendaPersona.idTienda)
        {
            throw new Error("Ya tenés una tienda");
        }

        if (tiendaPersona)
        {
            tienda.idEmprendedor = tiendaPersona.idEmprendedor;
        }
        else
        {
            tienda.idEmprendedor = await crearEmprendedorService(emprendedor);
        }

        const values = [tienda.idEmprendedor,
        tienda.nombreTienda,
        tienda.logoTienda
        ];

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
        nombre_tienda = COALESCE($2, nombre_tienda),
        logo_tienda = COALESCE($3, logo_tienda)
        WHERE id_tienda = $1;
        `
    const values = [tienda.idTienda, tienda.nombreTienda, tienda.logoTienda];

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

export async function cambiarActivoTiendaService(tienda)
{
    const query = `UPDATE Tiendas SET activo = $2 WHERE id_tienda = $1`;

    try
    {
        await pool.query(query, [tienda.idTienda, tienda.activo]);
        await sincronizarProductosTiendaFeed(tienda);
        return true;
    }
    catch (err)
    {
        throw new Error(err.message);
    }
}



export async function buscarTiendaPorId(tienda)
{
    const query = `
        SELECT id_tienda, nombre_tienda, logo_tienda, fecha_creacion, activo
        FROM Tiendas
        WHERE id_tienda = $1
    `;

    try
    {
        const resultado = await pool.query(query, [tienda.idTienda]);

        if (resultado.rows.length === 0)
        {
            return null;
        }

        return Tiendas.fromRow(resultado.rows[0]);
    }
    catch (err)
    {
        throw new Error(err.message);
    }
}

export async function buscarTiendaPorPersona(user)
{
    const query = `
        SELECT Emprendedores.id_emprendedor, Tiendas.id_tienda, Tiendas.activo
        FROM Emprendedores
        LEFT JOIN Tiendas ON Tiendas.id_emprendedor = Emprendedores.id_emprendedor
        WHERE Emprendedores.id_persona = $1
        ORDER BY Tiendas.id_tienda
    `;

    try
    {
        const resultado = await pool.query(query, [user.idPersona]);

        if (resultado.rows.length === 0)
        {
            return null;
        }

        return Tiendas.fromRow(resultado.rows[0]);
    }
    catch (err)
    {
        throw new Error(err.message);
    }
}
