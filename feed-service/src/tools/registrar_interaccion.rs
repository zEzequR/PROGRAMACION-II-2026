use rmcp::{tool, tool_router};
use rmcp::handler::server::wrapper::Parameters;
use serde::Deserialize;
use schemars::JsonSchema;

use crate::mcp_server::FeedServer;
use crate::enums::evento::TipoEvento;
use crate::services::interaccion_service;

#[derive(Debug, Deserialize, JsonSchema)]
pub struct InteraccionParams
{
    pub id_persona: i64,
    pub id_producto: i64,
    pub tipo_evento: TipoEvento,
}


#[tool_router(router = tool_router_interaccion, vis = "pub")]
impl FeedServer
{
    #[tool(description = "Registra una interaccion (vista, click, favorito o compra) 
    de un usuario sobre un producto, y actualiza los puntajes de categoría, producto y tienda")]
    pub async fn registrar_interaccion(&self, Parameters(parametros): Parameters<InteraccionParams>) -> Result<String, String>
    {
        match interaccion_service::registrar_interaccion_service(&self.conexion, parametros.id_persona, parametros.id_producto, parametros.tipo_evento).await
        {
            Ok(_) =>
            {
                Ok("Interaccion registrada".to_string())
            }
            Err(e) =>
            {
                Err(e.to_string())
            }
        }
    }
}