mod config;
mod index_db;
mod mcp_server;
mod tools;
mod models;
mod enums;
mod services;
use std::sync::Arc;

use rmcp::transport::streamable_http_server::{
    StreamableHttpService, StreamableHttpServerConfig,
    session::local::LocalSessionManager,
};
use tokio::net::TcpListener;

use crate::{mcp_server::FeedServer};


#[tokio::main]
async fn main() {

    let config_env = config::leer_valores_env().unwrap();

    let db = index_db::conexion_sqlite(&config_env.index_db_path).await.unwrap();

    let config_env = Arc::new(config::leer_valores_env().unwrap());

    let addr = format!("{}:{}", config_env.feed_ip, config_env.feed_port);

    let feed_sv: Arc<FeedServer> = Arc::new(FeedServer::new(db, Arc::clone(&config_env)));

    let listener = TcpListener::bind(addr).await.unwrap();

    let config_http = StreamableHttpServerConfig::default()
    .with_legacy_session_mode(false) // stateless for legacy versions too
    .with_allowed_hosts(vec!["127.0.0.1:3002".to_string(), "192.168.1.8:3002".to_string()])
    .with_json_response(true);       // plain JSON replies for simple tools

    let service = StreamableHttpService::new(
        move || Ok(Arc::clone(&feed_sv)),
        LocalSessionManager::default().into(),
        config_http,
    );

    let router = axum::Router::new().nest_service("/mcp", service);

    let _ = axum::serve(listener, router).await;

}
