use serde::Deserialize;
use schemars::JsonSchema;

#[derive(Debug,Deserialize, JsonSchema)]
pub enum TipoEvento{
    Vista,
    Click,
    Compra,
}

impl TipoEvento{

    pub fn puntos(&self) -> i64{
        match self{
            TipoEvento::Vista => 1,
            TipoEvento::Click => 3,
            TipoEvento::Compra => 9,
        }
    }

    pub fn as_str(&self) -> &'static str{
        match self{
            TipoEvento::Vista => "vista",
            TipoEvento::Click => "click",
            TipoEvento::Compra => "compra",
        }
    }
}