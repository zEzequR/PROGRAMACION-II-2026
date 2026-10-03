use rmcp::handler::server::wrapper::Parameters;
use rmcp::{tool, tool_router};
use crate::mcp_server::FeedServer;
use crate::services::usuario_categorias_service::usuarios_categorias_service;
use crate::models::usuario_categorias::UsuarioCategorias;
use crate::enums::accion::Accion;
use std::result::Result;
use schemars::JsonSchema;
use serde::Deserialize;


#[derive(Debug, Deserialize, JsonSchema)]
pub struct UsuarioCatBody
{
    pub id_persona: i64,
    pub id_cat: i64,
    pub accion: Accion
}

#[tool_router(router = tool_router_set_intereses_usuario ,vis = "pub")]
impl FeedServer {
    #[tool(description = "Actualizar los intereses del usuario en SQLite")]
        pub async fn set_intereses_usuario (&self, Parameters(body) : Parameters<UsuarioCatBody>) -> Result<String, String>
        {
            let usuario_categorias = UsuarioCategorias
            {
                id_persona: body.id_persona,
                id_cat: body.id_cat
            };
            
            match usuarios_categorias_service(self.conexion.clone(), usuario_categorias, body.accion).await
            {
                Ok(()) => Ok("...".to_string()),
                Err(e) => Err(e.to_string())
            }
        }
}