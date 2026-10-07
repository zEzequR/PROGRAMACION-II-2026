use rmcp::handler::server::wrapper::Parameters;
use rmcp::{tool, tool_router};
use crate::mcp_server::FeedServer;
use crate::services::get_user_feed_service::get_user_feed_service;
use serde::Deserialize;
use schemars::JsonSchema;

#[derive(Debug, Deserialize, JsonSchema)]
pub struct UserFeedBody
{
    pub id_persona: Option<i64>,
    pub total: Option<i64>,
    pub offset: Option<i64>,
    pub id_tienda_excluida: Option<i64>,
}

#[tool_router(router = tool_router_get_user_feed, vis = "pub")]
impl FeedServer
{
    #[tool(description = "Devuelve el feed")]
    pub async fn get_user_feed(&self, Parameters(body): Parameters<UserFeedBody>) -> Result<String, String>
    {
        match get_user_feed_service(&self.conexion, &body, &self.config).await
        {
            Ok(productos) => serde_json::to_string(&productos).map_err(|e| e.to_string()),
            Err(e) => Err(e.to_string()),
        }
    }
}