use serde::Deserialize;
use schemars::JsonSchema;

#[derive(Debug,Deserialize, JsonSchema)]
pub enum TipoEvento{
    Detalle,
    VisitaTienda,
    Carrito,
    Compra,
}

impl TipoEvento{
    pub fn puntos_producto(&self) -> i64{
        match self{
            TipoEvento::Detalle => 2,
            TipoEvento::VisitaTienda => 0,
            TipoEvento::Carrito => 5,
            TipoEvento::Compra => 9,
        }
    }

    pub fn puntos_categoria(&self) -> i64{
        match self{
            TipoEvento::Detalle => 2,
            TipoEvento::VisitaTienda => 1,
            TipoEvento::Carrito => 5,
            TipoEvento::Compra => 9,
        }
    }

    pub fn puntos_tienda(&self) -> i64{
        match self{
            TipoEvento::Detalle => 1,
            TipoEvento::VisitaTienda => 3,
            TipoEvento::Carrito => 3,
            TipoEvento::Compra => 9,
        }
    }

    pub fn es_repetible(&self) -> bool{
        match self{
            TipoEvento::Compra => true,
            _ => false,
        }
    }

    pub fn as_str(&self) -> &'static str{
        match self{
            TipoEvento::Detalle => "detalle",
            TipoEvento::VisitaTienda => "visita_tienda",
            TipoEvento::Carrito => "carrito",
            TipoEvento::Compra => "compra",
        }
    }
}
