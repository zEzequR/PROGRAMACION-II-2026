use anyhow::{Result, Context};
use dotenvy::dotenv;
use std::env;
use std::net::Ipv4Addr;

#[derive(Debug)]
pub struct Config
{
    pub index_db_path: String,
    pub feed_ip: Ipv4Addr,
    pub feed_port: u16,
    pub feed_total: u32,
    pub feed_tope_x_cat: u32,
    pub feed_tope_x_tienda: u32,
    pub feed_ventana_trend_dias: u32,
    pub feed_ventana_repetidos_horas: u32,
}

pub fn leer_valores_env() -> Result<Config>
{
    dotenv()?;
    
    let config: Config = Config
    {
        index_db_path: env::var("INDEX_DB_PATH").unwrap_or_else(|_| "sql/feed_index.sqlite".to_string()),
        feed_ip: env::var("FEED_HOST").unwrap_or_else(|_| "127.0.0.1".to_string()).parse()?,
        feed_port: env::var("FEED_PORT").context("Faltó ingresar el puerto para conectar el servicio MCP")?.parse()?,
        feed_total: env::var("FEED_TOTAL").unwrap_or_else(|_| "20".to_string()).parse()?,
        feed_tope_x_cat: env::var("FEED_TOPE_POR_CATEGORIA").unwrap_or_else(|_| "5".to_string()).parse()?,
        feed_tope_x_tienda: env::var("FEED_TOPE_POR_TIENDA").unwrap_or_else(|_| "3".to_string()).parse()?,
        feed_ventana_trend_dias: env::var("FEED_VENTANA_TRENDING_DIAS").unwrap_or_else(|_| "7".to_string()).parse()?,
        feed_ventana_repetidos_horas: env::var("FEED_VENTANA_REPETIDOS_HORAS").unwrap_or_else(|_| "24".to_string()).parse()?
    };

    Ok(config)
}