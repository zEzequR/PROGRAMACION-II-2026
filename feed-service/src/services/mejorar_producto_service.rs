use anyhow::{anyhow, Result};
use crate::api::claude::{pedir_sugerencia, PedidoSugerencia};
use crate::config::Config;
use crate::models::sugerencia_productos::SugerenciaProducto;
use crate::tools::mejorar_especificaciones_producto::MejorarProductoBody;

const PROMPT: &str = "Ayudás a emprendedores de Argentina a publicar sus productos en Localia, un marketplace. \
Te llegan la foto del producto, el nombre que escribió el emprendedor y la categoría que eligió, y con eso armás los datos de la publicación.

Escribí como lo haría alguien que conoce bien lo que vende y se lo cuenta a un cliente: en argentino/castellano, con voseo si le hablás \
al comprador, natural y concreto. Evitá las frases de catálogo como «ideal para», «perfecto para» o «de excelente calidad», los signos de \
exclamación y los emojis. Cuidá la ortografía, los acentos y el espacio después de cada coma y cada punto.

Basate en lo que se ve en la foto: forma, color, terminaciones, detalles. No agregues lo que no se ve ni sabés, como medidas, materiales \
dudosos, garantía o precio.

Si el emprendedor escribió una marca en el nombre, respetala: mantenela en el nombre y, si está mal escrita, corregí solo la ortografía \
(por ejemplo, «addidas» → «Adidas»). No la cambies por otra aunque la foto muestre algo distinto. Si no escribió ninguna, no agregues \
una salvo que se lea con claridad en el producto.

Qué tenés que devolver:
- nombre_prod: el nombre mejorado, sin cambiar qué producto es. Hasta 60 caracteres.
- descrip_prod: una o dos oraciones sobre cómo es y para qué sirve. Hasta 255 caracteres.
- nombre_atributo: la característica que más ayuda a decidir la compra en esa categoría (Color, Material, Talle, Formato…). \
Si alguno de los atributos que ya existen en la categoría encaja, usá ese mismo nombre, escrito igual. Hasta 60 caracteres.
- valor: el valor de esa característica para este producto, según la foto. Hasta 60 caracteres.

Si la foto no muestra un producto o no tiene que ver con el nombre, guiate por el nombre y escribí una descripción más general.";



pub async fn mejorar_producto_service(http: &reqwest::Client, config: &Config, body: &MejorarProductoBody) -> Result<SugerenciaProducto>
{
    let api_key = config.anthropic_api_key.as_deref()
        .ok_or_else(|| anyhow!("Falta ANTHROPIC_API_KEY en el .env del feed-service"))?;

    if body.nombre_prod.trim().is_empty() || body.categoria.trim().is_empty() || body.url_imagen.trim().is_empty()
    {
        return Err(anyhow!("Faltan el nombre, la categoría o la imagen del producto"));
    }

    let texto = armar_texto(body);
    let pedido = PedidoSugerencia
    {
        modelo: &config.ia_modelo,
        prompt: PROMPT,
        url_imagen: &body.url_imagen,
        texto: &texto,
    };

    let mut sugerencia = pedir_sugerencia(http, api_key, &pedido).await?;
    if !sugerencia.es_valida()
    {
        sugerencia = pedir_sugerencia(http, api_key, &pedido).await?;
    }

    sugerencia.recortar();

    if sugerencia.tiene_vacios()
    {
        return Err(anyhow!("La IA devolvió campos vacíos"));
    }

    Ok(sugerencia)
}

fn armar_texto(body: &MejorarProductoBody) -> String
{
    let atributos = if body.atributos_categoria.is_empty()
    {
        "ninguno todavía".to_string()
    }
    else
    {
        body.atributos_categoria.join(", ")
    };

    format!(
        "Nombre que escribió el emprendedor: {}\nCategoría: {}\nAtributos que ya existen en esta categoría: {}",
        body.nombre_prod.trim(),
        body.categoria.trim(),
        atributos
    )
}
