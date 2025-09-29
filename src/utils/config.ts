interface Config {
	URL: string;
	userName: string;
	pwd: string;
	mcpServerPort: string | number;
	transport: string;
}

export const config: Config = {
	URL: process.env["PLC_API_URL"] || "",
	userName: process.env["PLC_USER_NAME"] || "",
	pwd: process.env["PLC_USER_PASSWD"] || "",
	mcpServerPort: process.env["MCP_SERVER_PORT"] || 5000,
	transport: process.env["TRANSPORT"] || "streamable-http"
};
