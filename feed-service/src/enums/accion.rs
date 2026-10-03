use serde::Deserialize;
use schemars::JsonSchema;

#[derive(Debug, Clone, Copy, Deserialize, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum Accion
{
    Agregar,
    Eliminar
}