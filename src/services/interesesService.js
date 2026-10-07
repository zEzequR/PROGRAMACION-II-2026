import pool from '../config/conexion.js';
import { SyncInteresEvento } from '../models/eventos.js';
import { publicarEvento } from './api/kafkaService.js';
import { Categoria } from '../models/categorias.js';

export async function obtenerInteresesService(usuario)
{
    const query = `
        SELECT Categorias_Productos.id_cat, Categorias_Productos.categoria
        FROM Personas_Intereses
        INNER JOIN Categorias_Productos ON Personas_Intereses.id_cat = Categorias_Productos.id_cat
        WHERE Personas_Intereses.id_persona = $1
    `;

    try
    {
        const resultado = await pool.query(query, [usuario.idPersona]);
        return resultado.rows.map(function (fila)
        {
            return Categoria.fromRow(fila);
        });
    }
    catch (err)
    {
        throw new Error(err.message);
    }
}

export async function guardarInteresesService(user, categorias)
{

    const queryActuales = `SELECT id_cat FROM Personas_Intereses WHERE id_persona = $1`;
    const queryEliminar = `DELETE FROM Personas_Intereses WHERE id_persona = $1`;
    const queryAgregar = `INSERT INTO Personas_Intereses (id_persona, id_cat) VALUES ($1, $2)`;
    
    try
    {
        const resActuales = await pool.query(queryActuales, [user.idPersona]);

        const categoriasActuales = resActuales.rows.map(function (fila)
        {
            return fila.id_cat;
        });

        const categoriasNuevas = categorias.map(function (categoria)
        {
            return categoria.idCategoria;
        })

        await pool.query(queryEliminar, [user.idPersona]);

        for (const categoria of categorias)
        {
            await pool.query(queryAgregar, [user.idPersona, categoria.idCategoria]);
        }

        for (const idCat of categoriasActuales)
        {
            if (!categoriasNuevas.includes(idCat))
            {
                await publicarSyncInteres(user.idPersona, idCat, 'eliminar');
            }
        }

        for (const idCat of categoriasNuevas)
        {
            if (!categoriasActuales.includes(idCat))
            {
                await publicarSyncInteres(user.idPersona, idCat, 'agregar');
            }
        }

        return true;
    }
    catch (err)
    {
        throw new Error(err.message);
    }
}

async function publicarSyncInteres(idPersona, idCat, accion)
{
    try
    {
        const evento = new SyncInteresEvento({
            tipo: 'interes',
            idPersona: idPersona,
            idCat: idCat,
            accion: accion
        });

        await publicarEvento('sync_postgres_feed', {
            tipo: evento.tipo,
            id_persona: evento.idPersona,
            id_cat: evento.idCat,
            accion: evento.accion
        });
    }
    catch (errEvento)
    {
        console.error(`No se pudo realizar el sync de interés (persona ${idPersona}, categoría ${idCat}): ${errEvento.message}`);
    }
}