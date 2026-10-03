use rmcp::{tool, tool_router};
use crate::services::resync_completo_service::resync_completo_service;
use crate::services::resync_completo_service::ResyncCompleto;
use crate::models::productos_index::ProductosIndex;
use crate::models::usuario_categorias::UsuarioCategorias;
use crate::mcp_server::FeedServer;
use rmcp::handler::server::wrapper::Parameters;
use schemars::JsonSchema;
use serde::Deserialize;

#[derive(Debug, Deserialize, JsonSchema)]
pub struct ResyncCompletoBody
{
    pub lista_productos : Vec<ProductosIndex>,
    pub lista_intereses : Vec<UsuarioCategorias>,
}

#[tool_router(router = tool_router_resync_completo ,vis = "pub")]
impl FeedServer {
    #[tool(description = "Actualizar los intereses del usuario en SQLite")]
    pub async fn resync_completo(&self, Parameters(body) : Parameters<ResyncCompletoBody>) -> Result<String, String> {
        
        let resync_full = ResyncCompleto
        {
            lista_productos: body.lista_productos,
            lista_intereses: body.lista_intereses
        };

        match resync_completo_service(self.conexion.clone(), resync_full).await
        {
            Ok(()) => Ok("...".to_string()),
            Err(e) => Err(e.to_string())
        }
    }
}