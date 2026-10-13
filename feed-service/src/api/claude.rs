use anyhow::{anyhow, Context, Result};
use serde_json::{json, Value};
use crate::models::sugerencia_productos::SugerenciaProducto;

const URL_API: &str = "https://api.anthropic.com/v1/messages";
const VERSION_API: &str = "2023-06-01";
const BETA_RESPALDO: &str = "server-side-fallback-2026-07-01";
const MAX_TOKENS: u32 = 8000;

pub struct PedidoSugerencia<'a>
{
    pub modelo: &'a str,
    pub prompt: &'a str,
    pub url_imagen: &'a str,
    pub texto: &'a str,
}

pub async fn pedir_sugerencia(http: &reqwest::Client, api_key: &str, pedido: &PedidoSugerencia<'_>) -> Result<SugerenciaProducto>
{
    let cuerpo = json!({
        "model": pedido.modelo,
        "max_tokens": MAX_TOKENS,
        "fallbacks": "default",
        "system": pedido.prompt,
        "output_config": {
            "effort": "low",
            "format": { "type": "json_schema", "schema": esquema_sugerencia() }
        },
        "messages": [{
            "role": "user",
            "content": [
                { "type": "image", "source": { "type": "url", "url": pedido.url_imagen } },
                { "type": "text", "text": pedido.texto }
            ]
        }]
    });

    let respuesta = http.post(URL_API)
        .header("x-api-key", api_key)
        .header("anthropic-version", VERSION_API)
        .header("anthropic-beta", BETA_RESPALDO)
        .json(&cuerpo)
        .send()
        .await
        .context("No se pudo conectar con la API de Claude")?;

    let status = respuesta.status();
    let datos: Value = respuesta.json().await.context("La API de Claude devolvió una respuesta que no es JSON")?;

    if !status.is_success()
    {
        let mensaje = datos["error"]["message"].as_str().unwrap_or("sin detalle");
        return Err(anyhow!("La API de Claude respondió {}: {}", status.as_u16(), mensaje));
    }

    match datos["stop_reason"].as_str()
    {
        Some("refusal") => return Err(anyhow!("La IA no pudo generar una sugerencia para esta imagen")),
        Some("max_tokens") => return Err(anyhow!("La respuesta de la IA quedó incompleta")),
        _ => {}
    }

    let texto = datos["content"].as_array()
        .and_then(|bloques| bloques.iter().find(|bloque| bloque["type"] == "text"))
        .and_then(|bloque| bloque["text"].as_str())
        .ok_or_else(|| anyhow!("La respuesta de la IA no trajo texto"))?;

    let sugerencia: SugerenciaProducto = serde_json::from_str(texto).context("La IA devolvió un JSON con otra forma")?;

    Ok(sugerencia)
}

fn esquema_sugerencia() -> Value
{
    json!({
        "type": "object",
        "properties": {
            "nombre_prod": { "type": "string", "description": "Nombre del producto, hasta 60 caracteres" },
            "descrip_prod": { "type": "string", "description": "Descripción del producto, hasta 255 caracteres" },
            "nombre_atributo": { "type": "string", "description": "Característica del producto, hasta 60 caracteres" },
            "valor": { "type": "string", "description": "Valor de esa característica, hasta 60 caracteres" }
        },
        "required": ["nombre_prod", "descrip_prod", "nombre_atributo", "valor"],
        "additionalProperties": false
    })
}
