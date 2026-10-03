use sqlx::SqlitePool;
use crate::models::productos_index::ProductosIndex;
use crate::models::usuario_categorias::UsuarioCategorias;
use anyhow::Result;

pub struct ResyncCompleto
{
    pub lista_productos : Vec<ProductosIndex>,
    pub lista_intereses : Vec<UsuarioCategorias>
}

pub async fn resync_completo_service(pool : SqlitePool, resync : ResyncCompleto) -> Result<()>
{
    let mut tx = pool.begin().await?; 
    sqlx::query("DELETE FROM productos_index").execute(&mut *tx).await?;
    sqlx::query("DELETE FROM usuario_categorias").execute(&mut *tx).await?;

    for producto in resync.lista_productos
    {
        sqlx::query("INSERT INTO productos_index
        VALUES(?, ?, ?, ?)").bind(producto.id_producto).bind(producto.id_cat).
        bind(producto.id_tienda).bind(producto.activo)
        .execute(&mut *tx).await?;
    }

    for categorias in resync.lista_intereses
    {
        sqlx::query("INSERT INTO usuario_categorias
        VALUES(?, ?)").bind(categorias.id_persona).bind(categorias.id_cat)
        .execute(&mut *tx).await?;
    }
    tx.commit().await?;
    Ok(())
}