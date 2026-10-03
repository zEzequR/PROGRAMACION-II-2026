use serde::Deserialize;
use schemars::JsonSchema;

#[derive(Debug, Clone, Copy, Deserialize, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct ProductosIndex
{
    pub id_producto : u32,
    pub id_cat : u32,
    pub id_tienda : u32,
    pub activo : bool
}