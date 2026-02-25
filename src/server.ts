import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

import { allTools } from './tools/index.js'

export function createServer(): McpServer {
  const server = new McpServer({
    name: 'dokploy-mcp-server',
    version: '1.0.0',
  })

  for (const tool of allTools) {
    server.registerTool(
      tool.name,
      {
        title: tool.title,
        description: tool.description,
        inputSchema: tool.schema,
        annotations: tool.annotations,
      },
      tool.handler,
    )
  }

  return server
}
