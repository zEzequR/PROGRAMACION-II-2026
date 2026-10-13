use rmcp::handler::server::wrapper::Parameters;
use rmcp::{tool, tool_router};
use crate::mcp_server::FeedServer;
use crate::services::mejorar_producto_service::mejorar_producto_service;
use serde::Deserialize;
use schemars::JsonSchema;

#[derive(Debug, Deserialize, JsonSchema)]
pub struct MejorarProductoBody
{
    pub nombre_prod: String,
    pub categoria: String,
    pub atributos_categoria: Vec<String>,
    pub url_imagen: String,
}

#[tool_router(router = tool_router_mejorar_producto, vis = "pub")]
impl FeedServer
{
    #[tool(description = "Sugiere con IA el nombre, la descripción y una característica con su valor para un producto, \
a partir de su foto (url_imagen), el nombre que escribió el emprendedor y su categoría. No guarda nada.")]
    pub async fn mejorar_producto(&self, Parameters(body): Parameters<MejorarProductoBody>) -> Result<String, String>
    {
        match mejorar_producto_service(&self.http, &self.config, &body).await
        {
            Ok(sugerencia) => serde_json::to_string(&sugerencia).map_err(|e| e.to_string()),
            Err(e) => Err(e.to_string()),
        }
    }
}