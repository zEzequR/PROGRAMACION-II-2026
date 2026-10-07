use std::collections::HashMap;
use sqlx::SqlitePool;
use anyhow::{Context, Ok, Result};
use crate::config::Config;
use crate::tools::get_user_feed::UserFeedBody;

const PESO_CATEGORIA: f64 = 0.5;
const PESO_TIENDA: f64 = 0.2;
const PESO_TRENDING: f64 = 0.3;


pub async fn get_user_feed_trending_service(pool: &SqlitePool, body: &UserFeedBody, config: &Config) -> Result<Vec<i64>>
{
    let total = body.total.unwrap_or(config.feed_total as i64);
    let offset = body.offset.unwrap_or(0);
    let tope_por_categoria = config.feed_tope_x_cat as i64;
    let tope_por_tienda = (config.feed_tope_x_tienda as i64).max(1);
    let ventana = format!("-{} days", config.feed_ventana_trend_dias);

    let productos = sqlx::query_scalar("SELECT id_producto FROM (
        SELECT id_producto, trending, ROW_NUMBER()
        OVER (PARTITION BY id_tienda ORDER BY trending DESC, id_producto DESC) AS posicion_en_tienda
        FROM (
            SELECT productos_index.id_producto, productos_index.id_tienda, COALESCE(trending, 0) AS trending, ROW_NUMBER()
            OVER (PARTITION BY id_cat ORDER BY COALESCE(trending, 0) DESC, productos_index.id_producto DESC) AS posicion_en_cat
            FROM productos_index
            LEFT JOIN (SELECT id_producto, SUM(puntos) AS trending FROM interacciones WHERE fecha >= datetime('now', ?) GROUP BY id_producto) USING (id_producto)
            WHERE activo = 1 AND (? IS NULL OR productos_index.id_tienda <> ?)
        )
        WHERE posicion_en_cat <= ?
    )
    ORDER BY (posicion_en_tienda - 1) / ?, trending DESC, id_producto DESC LIMIT ? OFFSET ?")
    .bind(ventana)
    .bind(body.id_tienda_excluida)
    .bind(body.id_tienda_excluida)
    .bind(tope_por_categoria)
    .bind(tope_por_tienda)
    .bind(total)
    .bind(offset)
    .fetch_all(pool).await?;

    Ok(productos)
}

pub async fn get_user_feed_x_categoria_service(pool: &SqlitePool, body: &UserFeedBody, config: &Config) -> Result<Vec<i64>>
{
    let total = body.total.unwrap_or(config.feed_total as i64);
    let offset = body.offset.unwrap_or(0);
    let tope_por_categoria = config.feed_tope_x_cat as i64;
    let tope_por_tienda = (config.feed_tope_x_tienda as i64).max(1);
    let ventana = format!("-{} days", config.feed_ventana_trend_dias);
    let id_persona : i64 = body.id_persona.context("Esta función necesita un id_persona")?;

    let productos: Vec<i64> = sqlx::query_scalar("SELECT id_producto FROM (
        SELECT id_producto, trending, ROW_NUMBER()
        OVER (PARTITION BY id_tienda ORDER BY trending DESC, id_producto DESC) AS posicion_en_tienda
        FROM (
            SELECT productos_index.id_producto, productos_index.id_tienda, COALESCE(trending, 0) AS trending, ROW_NUMBER()
            OVER (PARTITION BY id_cat ORDER BY COALESCE(trending, 0) DESC, productos_index.id_producto DESC) AS posicion_en_cat
            FROM productos_index
            LEFT JOIN (SELECT id_producto, SUM(puntos) AS trending FROM interacciones WHERE fecha >= datetime('now', ?) GROUP BY id_producto) USING (id_producto)
            WHERE activo = 1 AND id_cat IN (SELECT id_cat FROM usuario_categorias WHERE id_persona = ?)
            AND (? IS NULL OR productos_index.id_tienda <> ?)
        )
        WHERE posicion_en_cat <= ?
    )
    ORDER BY (posicion_en_tienda - 1) / ?, trending DESC, id_producto DESC LIMIT ? OFFSET ?")
        .bind(ventana)
        .bind(id_persona)
        .bind(body.id_tienda_excluida)
        .bind(body.id_tienda_excluida)
        .bind(tope_por_categoria)
        .bind(tope_por_tienda)
        .bind(total)
        .bind(offset)
        .fetch_all(pool).await?;

    Ok(productos)
}

#[derive(sqlx::FromRow)]
pub struct Candidato
{
    pub id_producto : i64,
    pub id_tienda : i64,
    pub afinidad_categoria : i64,
    pub afinidad_tienda : i64,
    pub trending : i64
}

pub async fn get_user_feed_personalizado_service(pool: &SqlitePool, body: &UserFeedBody, config: &Config) -> Result<Vec<i64>>
{
    let id_persona = body.id_persona.context("Falta el campo ID persona")?;
    let ventana = format!("-{} days", config.feed_ventana_trend_dias);

    let productos_candidatos  = sqlx::query_as::<_, Candidato>("SELECT productos_index.id_producto, productos_index.id_tienda,
    COALESCE(puntajes_categoria.puntaje_total, 0) AS afinidad_categoria,
    COALESCE(puntajes_tienda.puntaje_total, 0) AS afinidad_tienda,
    COALESCE(trending_por_producto.trending, 0) AS trending
    FROM productos_index
    LEFT JOIN puntajes_categoria ON puntajes_categoria.id_persona = ? AND puntajes_categoria.id_cat = productos_index.id_cat
    LEFT JOIN puntajes_tienda ON puntajes_tienda.id_persona = ? AND puntajes_tienda.id_tienda = productos_index.id_tienda
    LEFT JOIN (
        SELECT id_producto, SUM(puntos) AS trending
        FROM interacciones
        WHERE fecha >= datetime('now', ?)
        GROUP BY id_producto
    ) trending_por_producto ON trending_por_producto.id_producto = productos_index.id_producto
    WHERE productos_index.activo = 1
    AND (? IS NULL OR productos_index.id_tienda <> ?)
    AND productos_index.id_producto NOT IN (
        SELECT id_producto FROM interacciones
        WHERE id_persona = ? AND tipo_evento = 'compra'
    )")
    .bind(id_persona)
    .bind(id_persona)
    .bind(ventana)
    .bind(body.id_tienda_excluida)
    .bind(body.id_tienda_excluida)
    .bind(id_persona)
    .fetch_all(pool).await?;

    let max_afinidad_categoria = productos_candidatos.iter().map(|pc| pc.afinidad_categoria).max().unwrap_or(0).max(1);

    let max_afinidad_tienda = productos_candidatos.iter().map(|pc| pc.afinidad_tienda).max().unwrap_or(0).max(1);

    let max_trending = productos_candidatos.iter().map(|pc| pc.trending).max().unwrap_or(0).max(1);

    let total = body.total.unwrap_or(config.feed_total as i64);
    let offset = body.offset.unwrap_or(0).max(0);
    let tope_por_tienda = (config.feed_tope_x_tienda as i64).max(1);

    let mut lista_productos: Vec<(i64, i64, f64)> = productos_candidatos.iter().map(|pc| {
        let score = (pc.afinidad_categoria as f64 / max_afinidad_categoria as f64) * PESO_CATEGORIA
            + (pc.afinidad_tienda as f64 / max_afinidad_tienda as f64) * PESO_TIENDA
            + (pc.trending as f64 / max_trending as f64) * PESO_TRENDING;
        (pc.id_producto, pc.id_tienda, score)
    }).collect();

    lista_productos.sort_by(|(id_a, _, score_a), (id_b, _, score_b)| score_b.total_cmp(score_a).then(id_b.cmp(id_a)));

    let mut cantidad_por_tienda: HashMap<i64, i64> = HashMap::new();
    let mut con_bloque: Vec<(i64, i64)> = Vec::new();

    for (id_producto, id_tienda, _) in lista_productos
    {
        let cantidad = cantidad_por_tienda.entry(id_tienda).or_insert(0);
        con_bloque.push((id_producto, *cantidad / tope_por_tienda));
        *cantidad += 1;
    }

    con_bloque.sort_by_key(|(_, bloque)| *bloque);

    let productos_finales: Vec<i64> = con_bloque.into_iter()
        .skip(offset as usize)
        .take(total as usize)
        .map(|(id, _)| id)
        .collect();

    Ok(productos_finales)
}

pub async fn get_user_feed_service(pool: &SqlitePool, body: &UserFeedBody, config: &Config) -> Result<Vec<i64>>
{
    let id_persona = match body.id_persona
    {
        Some(id) => id,
        None => return get_user_feed_trending_service(pool, body, config).await,
    };

    let tiene_historial: bool = sqlx::query_scalar(
        "SELECT EXISTS(SELECT 1 FROM puntajes_categoria WHERE id_persona = ?)"
    )
    .bind(id_persona)
    .fetch_one(pool)
    .await?;

    if tiene_historial
    {
        return get_user_feed_personalizado_service(pool, body, config).await;
    }

    let tiene_categorias: bool = sqlx::query_scalar(
        "SELECT EXISTS(SELECT 1 FROM usuario_categorias WHERE id_persona = ?)"
    )
    .bind(id_persona)
    .fetch_one(pool)
    .await?;

    if tiene_categorias
    {
        return get_user_feed_x_categoria_service(pool, body, config).await;
    }

    get_user_feed_trending_service(pool, body, config).await
}
