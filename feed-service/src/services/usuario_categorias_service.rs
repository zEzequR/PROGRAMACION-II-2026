use anyhow::{Error, Ok, Result};
use sqlx::SqlitePool;
use crate::models::usuario_categorias::UsuarioCategorias;
use crate::enums::accion::{self, Accion};

pub async fn usuarios_categorias_service(pool : SqlitePool,
    catergoria : UsuarioCategorias, accion : Accion) -> Result<(), Error>
{
    match accion {
        accion::Accion::Agregar => 
        {
            sqlx::query("INSERT OR IGNORE INTO usuario_categorias
            VALUES(?, ?)")
            .bind(catergoria.id_persona).bind(catergoria.id_cat)
            .execute(&pool).await?;
        }
        accion::Accion::Eliminar => 
        {
            sqlx::query("DELETE FROM usuario_categorias
            WHERE id_persona = ? AND id_cat = ?")
            .bind(catergoria.id_persona).bind(catergoria.id_cat)
            .execute(&pool).await?;
        }
    }
    Ok(())
}