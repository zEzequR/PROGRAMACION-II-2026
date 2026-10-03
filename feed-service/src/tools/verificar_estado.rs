use rmcp::{ServerHandler, tool, tool_handler, tool_router};
use crate::mcp_server::FeedServer;
use crate::index_db::comprobar_tablas_db;

#[tool_router(router = tool_router_verificar_estado, vis = "pub")]
impl FeedServer
{
    #[tool(description = "Verifica que existan las tablas esperadas en la base SQLite")]
    pub async fn verificar_estado (&self) -> Result<String, String>
    {
        match comprobar_tablas_db(&self.conexion).await
        {
            Ok(num) => 
            {
                Ok(format!("{}", num))
            }

            Err(e) => 
            {
                Err(e.to_string())
            }
        }
    }
}

#[tool_handler(router = self.router)]
impl ServerHandler for FeedServer {}