import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import express, { type Express } from "express";
import type { Server } from "http";
import { autoLoginService, stopAutoLoginService, performLogout } from "./tools/credentials/credentials.js";
import { basicFunctions } from "./tools/basic_functions/basicFunctions.js";
import { processData } from "./tools/process_data/processData.js";
import { diagnostics } from "./tools/diagnostics/diagnostics.js";
import { server } from "./utils/mcp_server.js";
import { config } from "./utils/config.js";

// ------------------------------------------------------------------------------------------------------------
//process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0"; //for testing only, not recommended for production
// ------------------------------------------------------------------------------------------------------------
let httpServer: Server | null = null;

// ------------------------------------------------------------------------------------------------------------
// Graceful Shutdown Handler
// ------------------------------------------------------------------------------------------------------------
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  // 1. Stop auto-login service
  stopAutoLoginService();

  // 2. Logout from PLC
  await performLogout();

  // 3. Close HTTP server if running
  if (httpServer) {
    await new Promise<void>((resolve) => {
      httpServer!.close(() => {
        console.log("HTTP server closed");
        resolve();
      });
    });
  }

  // 4. Close MCP server
  await server.close();

  console.log("Graceful shutdown complete");
  process.exit(0);
};

// Register signal handlers
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// ------------------------------------------------------------------------------------------------------------
autoLoginService();
// ------------------------------------------------------------------------------------------------------------

if (config.transport !== "stdio") {

  const app: Express = express();
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
  httpServer = app.listen(PORT, () => {
    console.log(`S7-MCP-Server running at port ${PORT}\n(connect your MCP CLient at: http://<host-ip-address>:${PORT}/mcp)`);
  });

} else {
  // Use Stdio Transport
  const transport = new StdioServerTransport()
  await server.connect(transport);
}
