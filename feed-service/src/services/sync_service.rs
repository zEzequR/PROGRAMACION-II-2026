use sqlx::SqlitePool;
use anyhow::Result;

pub async fn sync_producto(pool: &SqlitePool, id_producto: i64, id_cat: i64, id_tienda: i64, activo: bool) -> Result<()>
{
    let resultado = sqlx::query(
        "UPDATE productos_index SET id_cat = ?, id_tienda = ?, activo = ? WHERE id_producto = ?"
    )
    .bind(id_cat).bind(id_tienda).bind(activo).bind(id_producto)
    .execute(pool)
    .await?;

    if resultado.rows_affected() == 0
    {
        sqlx::query(
            "INSERT INTO productos_index (id_producto, id_cat, id_tienda, activo) VALUES (?, ?, ?, ?)"
        )
        .bind(id_producto).bind(id_cat).bind(id_tienda).bind(activo)
        .execute(pool)
        .await?;
    }

    Ok(())
}