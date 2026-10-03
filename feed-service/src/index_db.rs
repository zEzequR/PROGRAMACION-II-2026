use sqlx::SqlitePool;
use anyhow::{Ok, Result};

pub async fn conexion_sqlite(db_path :&str) -> Result<SqlitePool>
{
    Ok(SqlitePool::connect(db_path).await?)
}

pub async fn comprobar_tablas_db(db_pool : &SqlitePool) -> Result<i64>
{
    Ok(sqlx::query_scalar("SELECT COUNT(*) FROM sqlite_master
    WHERE type = 'table' AND
    name IN ('productos_index', 'usuario_categorias',
    'interacciones', 'puntajes_categoria',
    'puntajes_producto', 'puntajes_tienda')").fetch_one(db_pool).await?)
}