use std::sync::Arc;
use sqlx::SqlitePool;
use crate::config::Config;
use rmcp::{handler::server::router::tool::ToolRouter};

#[derive(Clone)]
pub struct FeedServer
{
    pub conexion : SqlitePool,
    pub config : Arc<Config>,
    pub router : ToolRouter<FeedServer>,
}


impl FeedServer {
    pub fn new(conexion : SqlitePool, config : Arc<Config>) -> Self
    {
        let mut router = Self::tool_router_verificar_estado();
        router.merge(Self::tool_router_interaccion());
        router.merge(Self::tool_router_sync_producto());
        router.merge(Self::tool_router_set_intereses_usuario());
        router.merge(Self::tool_router_resync_completo());
        router.merge(Self::tool_router_get_user_feed());

        Self
        {
            conexion,
            config,
            router,
        }
    }
}
