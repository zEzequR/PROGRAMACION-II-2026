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

export async function getUserFeedMcp(idPersona, total, offset)
{
    const MCPres = await llamarToolMCP('get_user_feed', {
        id_persona: idPersona,
        total: total,
        offset: offset
    });

    return JSON.parse(formatearResultado(MCPres));
}

export async function registrarInteraccionFeed(idPersona, idProducto, tipoEvento)
{
    await llamarToolMCP('registrar_interaccion', {
        id_persona: idPersona,
        id_producto: idProducto,
        tipo_evento: tipoEvento
    });
}

export async function syncProductoFeed(idProducto, idCat, idTienda, activo)
{
    await llamarToolMCP('sync_producto', {
        id_producto: idProducto,
        id_cat: idCat,
        id_tienda: idTienda,
        activo: activo
    });
}

export async function setInteresesUsuarioFeed(idPersona, idCat, accion)
{
    await llamarToolMCP('set_intereses_usuario', {
        id_persona: idPersona,
        id_cat: idCat,
        accion: accion
    });
}