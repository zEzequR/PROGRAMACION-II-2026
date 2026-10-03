use rmcp::{tool, tool_router};
use rmcp::handler::server::wrapper::Parameters;
use serde::Deserialize;
use schemars::JsonSchema;

use crate::mcp_server::FeedServer;
use crate::services::sync_service;

#[derive(Debug, Deserialize, JsonSchema)]
pub struct SyncProductoParams
{
    pub id_producto: i64,
    pub id_cat: i64,
    pub id_tienda: i64,
    pub activo: bool,
}

#[tool_router(router = tool_router_sync_producto, vis = "pub")]
impl FeedServer
{
    #[tool(description = "Refleja el alta, baja o edición de un producto en productos_index")]
    pub async fn sync_producto(&self, Parameters(parametros): Parameters<SyncProductoParams>) -> Result<String, String>
    {
        match sync_service::sync_producto(&self.conexion, parametros.id_producto, parametros.id_cat, parametros.id_tienda, parametros.activo).await
        {
            Ok(_) =>
            {
                Ok("Producto sincronizado".to_string())
            }

            Err(e) =>
            {
                Err(e.to_string())
            }
        }
    }
}