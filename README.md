# S7-MCP-SERVER

**S7-MCP-SERVER** is a server designed to interface with **SIEMENS PLC S7-1500/1200** using their **JSON-RPC 2.0 API**. It exposes API functionalities as **MCP tools**, enabling AI assistants and other MCP-compatible clients to interact with the PLC programmatically.

---

## 🔧 Features

- Connects to a **SIEMENS PLC API (Webserver)** endpoint
- Provides MCP tools for:
  - ✅ User authentication (`login`, `logout`, `ChangePassword-user`)
  - ✅ Check PLC connectivity (`ping`)
  - ✅ Retrieve user permissions via `Api-GetPermissions` after login
  - ✅ Get API version with `Api-Version`
  - ✅ List available API methods using `Api-Browse`
  - ✅ Retrieve structure information with `Api-GetQuantityStructures`
  - ✅ Get password security policies with `Api-GetPasswordPolicy`
  - ✅ Browse tags and metadata using `PlcProgram-Browse`
  - ✅ Read single variables via `PlcProgram-Read`
  - ✅ Write Boolean, Number, or String tags with `PlcProgram-Write-*`
  - ✅ Read the current CPU operating mode with `Plc-ReadOperatingMode`
  - ✅ Request a change of operating mode using `Plc-RequestChangeOperatingMode`
  - ✅ Read the CPU system time (`Plc-ReadSystemTime`)
  - ✅ Set the CPU system time (`Plc-SetSystemTime`)
  - ✅ Read available project languages (`Project-ReadLanguages`)
  - ✅ Browse active alarms (`Alarms-Browse`)
  - ✅ Acknowledge alarms (`Alarms-Acknowledge`)
  - ✅ Browse diagnostic buffer entries (`DiagnosticBuffer-Browse`)
- 🔄 Optional: automatic service account login with token refresh

---

## ⚙️ Prerequisites

- [Node.js](https://nodejs.org/) (v18.x or later recommended)
- npm (comes bundled with Node.js)
- Access to a running **SIEMENS PLC API (Webserver)**

---

## ⚙️ Configuration

This server uses environment variables for configuration.

### Example `env variables`:

```bash
export NODE_TLS_REJECT_UNAUTHORIZED=0
export PLC_API_URL="https://<PLC-IP-Address>/api/jsonrpc"
export PLC_USER_NAME="your-username" // optional
export PLC_USER_PASSWD="your-password" // optional
```

## 🚀 Getting Started

1. Navigate to the project folder:

```bash
cd your-project-directory
```

2. Install dependencies:

```bash
npm install
```

3. Edit env variables as shown above.

4. Start the server

```bash
node index.js
```

### 🖥️ Connecting with Claude Desktop

To use this MCP server with Claude AI (desktop version):

1. Find or create the claude_desktop_config.json file
   (typically in the Claude app config folder).

2. Add or update the following:

```json
{
  "mcpServers": {
    "S7-MCP-SERVER": {
      "command": "npx",
      "args": ["mcp-remote", "http://localhost:5000/mcp"]
    }
  }
}
```
