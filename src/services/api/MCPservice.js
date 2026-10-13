import { mcp } from '../../config/MCP.js';
import { formatearResultado } from '../../utils/formatearResultadoMCP.js';
import { SugerenciaProducto } from '../../models/sugerenciasProducto.js';

export async function verificarEstadoFeed()
{
    const mcpRes = await llamarToolMCP('verificar_estado', {});
    return formatearResultado(mcpRes);
}

export async function llamarToolMCP(tool, parametros, opciones)
{
    const mcpRes = await mcp.callTool({name: tool, arguments: parametros}, undefined, opciones);

    if (mcpRes.isError)
    {
        throw new Error(`La tool ${tool} devolvió un error: ${formatearResultado(mcpRes)}`);
    }

    return mcpRes;
}

export async function resyncCompletoFeed(productos, intereses)
{
    await llamarToolMCP('resync_completo', { lista_productos: productos, lista_intereses: intereses });
}

export async function getUserFeedMcp(usuario, filtros, tiendaPropia)
{
    const parametros = {
        id_persona: usuario.idPersona,
        total: filtros.total,
        offset: filtros.offset
    };

    if (tiendaPropia)
    {
        parametros.id_tienda_excluida = tiendaPropia.idTienda;
    }

    const MCPres = await llamarToolMCP('get_user_feed', parametros);

    return JSON.parse(formatearResultado(MCPres));
}


export async function registrarInteraccionFeed(evento)
{
    await llamarToolMCP('registrar_interaccion', {
        id_persona: evento.idPersona,
        id_producto: evento.idProducto,
        tipo_evento: evento.tipoEvento
    });
}

export async function syncProductoFeed(evento)
{
    await llamarToolMCP('sync_producto', {
        id_producto: evento.idProducto,
        id_cat: evento.idCat,
        id_tienda: evento.idTienda,
        activo: evento.activo
    });
}

export async function setInteresesUsuarioFeed(evento)
{
    await llamarToolMCP('set_intereses_usuario', {
        id_persona: evento.idPersona,
        id_cat: evento.idCat,
        accion: evento.accion
    });
}

export async function mejorarProductoMcp(producto, categoria, atributos, urlImagen)
{
    const nombresAtributos = [];
    for (const atributo of atributos)
    {
        nombresAtributos.push(atributo.nombreAtributo);
    }

    const mcpRes = await llamarToolMCP('mejorar_producto', {
        nombre_prod: producto.nombreProd,
        categoria: categoria.categoria,
        atributos_categoria: nombresAtributos,
        url_imagen: urlImagen
    }, { timeout: 90000 });

    return SugerenciaProducto.fromMcp(JSON.parse(formatearResultado(mcpRes)));
}