import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { config } from "./config.js";

export const server = new McpServer({
  name: "S7 MCP Server",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

export const html_readme = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>S7 MCP Server</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            border-bottom: 3px solid #007bff;
            padding-bottom: 10px;
        }
        h2 {
            color: #555;
            margin-top: 30px;
        }
        code {
            background-color: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
        pre {
            background-color: #f4f4f4;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
        }
        .endpoint {
            background-color: #e8f4f8;
            padding: 10px;
            border-left: 4px solid #007bff;
            margin: 10px 0;
        }
        .status {
            display: inline-block;
            background-color: #28a745;
            color: white;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>S7 MCP Server</h1>
        <p><span class="status">🟢 Server Running</span></p>

        <h2>About</h2>
        <p>This is an MCP (Model Context Protocol) server for Siemens S7 PLC communication.</p>

        <h2>Endpoints</h2>

        <div class="endpoint">
            <strong>POST /mcp</strong><br>
            Main MCP endpoint for client connections
        </div>

        <h2>Connection</h2>
        <p>Connect your MCP client to:</p>
        <pre><code>http://&lt;server-ip-address&gt;:${config.mcpServerPort}/mcp</code></pre>

        <h2>Available Tools</h2>
        <ul>
            <li>User authentication (login, logout, ChangePassword-user)</li>
            <li>Check PLC connectivity (ping)</li>
            <li>Retrieve user permissions (Api-GetPermissions)</li>
            <li>Get API version (Api-Version)</li>
            <li>List available API methods (Api-Browse)</li>
            <li>Retrieve structure information (Api-GetQuantityStructures)</li>
            <li>Get password security policies (Api-GetPasswordPolicy)</li>
            <li>Browse tags and metadata (PlcProgram-Browse)</li>
            <li>Read single variables (PlcProgram-Read)</li>
            <li>Write Boolean, Number, or String tags (PlcProgram-Write)</li>
            <li>Read the current CPU operating mode (Plc-ReadOperatingMode)</li>
            <li>Request a change of operating mode (Plc-RequestChangeOperatingMode)</li>
            <li>Read the CPU system time (Plc-ReadSystemTime)</li>
            <li>Set the CPU system time (Plc-SetSystemTime)</li>
            <li>Read available project languages (Project-ReadLanguages)</li>
            <li>Browse active alarms (Alarms-Browse)</li>
            <li>Acknowledge alarms (Alarms-Acknowledge)</li>
            <li>Browse diagnostic buffer entries (DiagnosticBuffer-Browse)</li>
        </ul>

        <h2>Server Information</h2>
        <ul>
            <li><strong>Port:</strong> ${config.mcpServerPort}</li>
            <li><strong>Transport:</strong> ${config.transport}</li>
            <li><strong>Status:</strong> Active</li>
        </ul>

        <h2>Connecting with Claude Desktop</h2>
    
        <p>To use this MCP server with Claude AI (desktop version):</p>
    
        <ul>
            <li>Find or create the claude_desktop_config.json file<br>
            (typically in the Claude app config folder).</li>
            <li>Add or update the following if running in a container (streamable-http) (remember to change port according to your deployment):</li>
        </ul>
    
        <pre><code>{
      "mcpServers": {
        "S7-MCP-SERVER": {
          "command": "npx",
          "args": ["mcp-remote", "http://&lt;server-ip-address&gt;:${config.mcpServerPort}/mcp"]
        }
      }
    }</code></pre>

    </div>
</body>
</html>
    `