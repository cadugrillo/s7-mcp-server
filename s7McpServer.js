import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import express from "express";
import { logonService } from "./tools/tools.js";
import { server } from "./utils/mcp_server.js";
import { config } from "./utils/config.js";

// ------------------------------------------------------------------------------------------------------------
//process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0"; //for testing only, not recommended for production

// ------------------------------------------------------------------------------------------------------------
logonService();
// ------------------------------------------------------------------------------------------------------------

if (config.transport == "streamable-http") {

  const app = express();
  app.use(express.json());

  app.post("/mcp", async (req, res) => {
    console.log("Received POST MCP request: ", req.body);
    try {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });
      res.on("close", () => {
        transport.close();
      });
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error("Error handling MCP request:", error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: {
            code: -32603,
            message: "Internal server error",
          },
          id: null,
        });
      }
    }
  });

  app.get("/mcp", async (req, res) => {
    console.log("Received GET MCP request");
    res.writeHead(405).end(
      JSON.stringify({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Method not allowed.",
        },
        id: null,
      })
    );
  });

  app.delete("/mcp", async (req, res) => {
    console.log("Received DELETE MCP request");
    res.writeHead(405).end(
      JSON.stringify({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Method not allowed.",
        },
        id: null,
      })
    );
  });

  // Start the server
  const PORT = config.mcpServerPort;
  app.listen(PORT, () => {
    console.log(`S7-MCP-Server running at port ${PORT}\n(connect your MCP CLient at: http://<host-ip-address>:${PORT}/mcp)`);
  });

} else {
  // Use Stdio Transport
  const transport = new StdioServerTransport()
  await server.connect(transport);
}
