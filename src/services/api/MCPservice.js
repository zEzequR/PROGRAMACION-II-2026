import { mcp } from '../../config/MCP.js';
import { formatearResultado } from '../../utils/formatearResultadoMCP.js';

export async function verificarEstadoFeed()
{
    const mcpRes = await llamarToolMCP('verificar_estado', {});
    return formatearResultado(mcpRes);
}

export async function llamarToolMCP(tool, parametros)
{
    const mcpRes = await mcp.callTool({name: tool, arguments: parametros});

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
