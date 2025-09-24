export const config = {};
config.URL = process.env["PLC_API_URL"];
config.userName = process.env["PLC_USER_NAME"];
config.pwr = process.env["PLC_USER_PASSWD"];
config.mcpServerPort = process.env["MCP_SERVER_PORT"] || 5000;
