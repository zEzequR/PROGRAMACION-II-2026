import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import 'dotenv/config';

const mcpClient = new Client({ name: 'localiapp-feed', version: '1.0.0' });
const mcpTransporte = new StreamableHTTPClientTransport(new URL(process.env.FEED_MCP_URL));

try
{
    await mcpClient.connect(mcpTransporte);
    console.log('Conexión exitosa al microservicio de feed');
}
catch (error)
{
    console.log(`No se pudo conectar al microservicio de feed. Motivo: ${error.message}`);
}

export const mcp = mcpClient;