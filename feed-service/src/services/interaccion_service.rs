use sqlx::SqlitePool;
use anyhow::{Result, Context};
use crate::config::Config;
use crate::enums::evento::TipoEvento;

pub async fn registrar_interaccion_service(pool: &SqlitePool, config: &Config, id_persona: i64, id_producto: i64, tipo_evento: TipoEvento) -> Result<bool>
{
    let mut transaccion = pool.begin().await?;

    if !tipo_evento.es_repetible()
    {
        let ventana = format!("-{} hours", config.feed_ventana_repetidos_horas);

        let ya_registrado: bool = sqlx::query_scalar(
            "SELECT EXISTS(SELECT 1 FROM interacciones WHERE id_persona = ? AND id_producto = ? AND tipo_evento = ? AND fecha >= datetime('now', ?))"
        )
        .bind(id_persona).bind(id_producto).bind(tipo_evento.as_str()).bind(ventana)
        .fetch_one(&mut *transaccion)
        .await?;

        if ya_registrado
        {
            return Ok(false);
        }
    }

    let (id_cat, id_tienda): (i64, i64) = sqlx::query_as(
        "SELECT id_cat, id_tienda FROM productos_index WHERE id_producto = ?"
    )
    .bind(id_producto)
    .fetch_one(&mut *transaccion)
    .await
    .context("Producto no encontrado en el índice local")?;

    let puntos_producto = tipo_evento.puntos_producto();

    sqlx::query(
        "INSERT INTO interacciones (id_persona, id_producto, id_cat, id_tienda, tipo_evento, puntos) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .bind(id_persona).bind(id_producto).bind(id_cat).bind(id_tienda).bind(tipo_evento.as_str()).bind(puntos_producto)
    .execute(&mut *transaccion)
    .await?;

    sumar_puntaje_categoria(&mut transaccion, id_persona, id_cat, tipo_evento.puntos_categoria()).await?;
    sumar_puntaje_tienda(&mut transaccion, id_persona, id_tienda, tipo_evento.puntos_tienda()).await?;

    if puntos_producto > 0
    {
        sumar_puntaje_producto(&mut transaccion, id_persona, id_producto, puntos_producto).await?;
    }

    transaccion.commit().await?;
    Ok(true)
}

async fn sumar_puntaje_categoria(transaccion: &mut sqlx::Transaction<'_, sqlx::Sqlite>, id_persona: i64, id_cat: i64, puntos: i64) -> Result<()>
{
    let resultado = sqlx::query(
        "UPDATE puntajes_categoria SET puntaje_total = puntaje_total + ? WHERE id_persona = ? AND id_cat = ?"
    )
    .bind(puntos).bind(id_persona).bind(id_cat)
    .execute(&mut **transaccion)
    .await?;

    if resultado.rows_affected() == 0
    {
        sqlx::query(
            "INSERT INTO puntajes_categoria (id_persona, id_cat, puntaje_total) VALUES (?, ?, ?)"
        )
        .bind(id_persona).bind(id_cat).bind(puntos)
        .execute(&mut **transaccion)
        .await?;
    }

    Ok(())
}

async fn sumar_puntaje_producto(transaccion: &mut sqlx::Transaction<'_, sqlx::Sqlite>, id_persona: i64, id_producto: i64, puntos: i64) -> Result<()>
{
    let resultado = sqlx::query(
        "UPDATE puntajes_producto SET puntaje_total = puntaje_total + ?, fecha_actualizacion = datetime('now') WHERE id_persona = ? AND id_producto = ?"
    )
    .bind(puntos).bind(id_persona).bind(id_producto)
    .execute(&mut **transaccion)
    .await?;

    if resultado.rows_affected() == 0
    {
        sqlx::query(
            "INSERT INTO puntajes_producto (id_persona, id_producto, puntaje_total) VALUES (?, ?, ?)"
        )
        .bind(id_persona).bind(id_producto).bind(puntos)
        .execute(&mut **transaccion)
        .await?;
    }

    Ok(())
}

async fn sumar_puntaje_tienda(transaccion: &mut sqlx::Transaction<'_, sqlx::Sqlite>, id_persona: i64, id_tienda: i64, puntos: i64) -> Result<()>
{
    let resultado = sqlx::query(
        "UPDATE puntajes_tienda SET puntaje_total = puntaje_total + ?, fecha_actualizacion = datetime('now') WHERE id_persona = ? AND id_tienda = ?"
    )
    .bind(puntos).bind(id_persona).bind(id_tienda)
    .execute(&mut **transaccion)
    .await?;

    if resultado.rows_affected() == 0
    {
        sqlx::query(
            "INSERT INTO puntajes_tienda (id_persona, id_tienda, puntaje_total) VALUES (?, ?, ?)"
        )
        .bind(id_persona).bind(id_tienda).bind(puntos)
        .execute(&mut **transaccion)
        .await?;
    }

    Ok(())
}