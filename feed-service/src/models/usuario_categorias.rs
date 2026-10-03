use serde::Deserialize;
use schemars::JsonSchema;

#[derive(Debug, Clone, Copy, Deserialize, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct UsuarioCategorias
{
    pub id_persona: i64,
    pub id_cat: i64
}