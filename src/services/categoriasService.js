import pool from '../config/conexion.js';
import { Categoria } from '../models/categorias.js';
import { EspecificacionProducto } from '../models/especificacionProducto.js';

export async function obtenerCategoriasService()
{
    const query = `SELECT id_cat, categoria FROM Categorias_Productos ORDER BY categoria`;

    try
    {
        const resultado = await pool.query(query);
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

export async function guardarCategoriaService(atributos, Especificacion) {
    try {
        const queryAtributo = `
            SELECT id_atributo
            FROM Atributos_Categoria
            WHERE id_cat = $1 AND LOWER(nombre_atributo) = LOWER($2)
        `;
        const resAtributo = await pool.query(queryAtributo, [atributos.idCat, atributos.nombreAtributo]);

        let idAtributo;

        if (resAtributo.rowCount === 0) {
            const insertAtributo = `
                INSERT INTO Atributos_Categoria (id_cat, nombre_atributo)
                VALUES ($1, $2)
                RETURNING id_atributo
            `;

            const resInsert = await pool.query(insertAtributo, [atributos.idCat, atributos.nombreAtributo]);
            
            idAtributo = resInsert.rows[0].id_atributo;
        }
        else
            {
                idAtributo = resAtributo.rows[0].id_atributo;
            }

        const queryEspec = `
            SELECT id_espec, id_producto, id_atributo, valor
            FROM Especificaciones_Producto
            WHERE id_producto = $1 AND id_atributo = $2
        `;
        const resEspec = await pool.query(queryEspec, [Especificacion.idProducto, idAtributo]);

        if (resEspec.rowCount === 0) {
            const insertEspec = `
                INSERT INTO Especificaciones_Producto (id_producto, id_atributo, valor)
                VALUES ($1, $2, $3)
                RETURNING id_espec, id_producto, id_atributo, valor
            `;
            const resInsertEspec = await pool.query(insertEspec, [
                Especificacion.idProducto,
                idAtributo,
                Especificacion.valor
            ]);
            return EspecificacionProducto.fromRow(resInsertEspec.rows[0]);
        }
        else
        {
            const updateEspec = `
                UPDATE Especificaciones_Producto
                SET valor = $1
                WHERE id_espec = $2
                RETURNING id_espec, id_producto, id_atributo, valor
            `;
            const resUpdate = await pool.query(updateEspec, [Especificacion.valor, resEspec.rows[0].id_espec]);
            return EspecificacionProducto.fromRow(resUpdate.rows[0]);
        }
    }
    catch (err)
        {
            throw new Error(`Error al obtener o crear el atributo/especificación: ${err.message}`);
        }
}