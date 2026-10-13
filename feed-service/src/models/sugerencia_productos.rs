use serde::{Deserialize, Serialize};

pub const MAX_NOMBRE: usize = 60;
pub const MAX_DESCRIPCION: usize = 255;
pub const MAX_ATRIBUTO: usize = 60;
pub const MAX_VALOR: usize = 60;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SugerenciaProducto
{
    pub nombre_prod: String,
    pub descrip_prod: String,
    pub nombre_atributo: String,
    pub valor: String,
}

impl SugerenciaProducto
{
    pub fn es_valida(&self) -> bool
    {
        largo_valido(&self.nombre_prod, MAX_NOMBRE)
            && largo_valido(&self.descrip_prod, MAX_DESCRIPCION)
            && largo_valido(&self.nombre_atributo, MAX_ATRIBUTO)
            && largo_valido(&self.valor, MAX_VALOR)
    }

    pub fn recortar(&mut self)
    {
        self.nombre_prod = recortar_texto(&self.nombre_prod, MAX_NOMBRE);
        self.descrip_prod = recortar_texto(&self.descrip_prod, MAX_DESCRIPCION);
        self.nombre_atributo = recortar_texto(&self.nombre_atributo, MAX_ATRIBUTO);
        self.valor = recortar_texto(&self.valor, MAX_VALOR);
    }

    pub fn tiene_vacios(&self) -> bool
    {
        self.nombre_prod.trim().is_empty()
            || self.descrip_prod.trim().is_empty()
            || self.nombre_atributo.trim().is_empty()
            || self.valor.trim().is_empty()
    }
}

fn largo_valido(texto: &str, maximo: usize) -> bool
{
    let limpio = texto.trim();
    !limpio.is_empty() && limpio.chars().count() <= maximo
}

fn recortar_texto(texto: &str, maximo: usize) -> String
{
    let limpio = texto.trim();
    if limpio.chars().count() <= maximo
    {
        return limpio.to_string();
    }

    let cortado: String = limpio.chars().take(maximo).collect();
    match cortado.rfind(' ')
    {
        Some(posicion) if posicion > 0 => cortado[..posicion].trim_end().to_string(),
        _ => cortado,
    }
}
