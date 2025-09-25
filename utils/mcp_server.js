import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export const server = new McpServer({
  name: "WinCC Unified Core XT",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});