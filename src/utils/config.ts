import fs from 'fs';

interface Config {
	URL: string;
	userName: string;
	pwd: string;
	mcpServerPort: string | number;
	transport: string;
}

const urlCheck = () => {

	const pathToConfig = 'home/edge/s7-mcp-server/configs/config.json';
	if (fs.existsSync(pathToConfig)) {
		fs.readFile(pathToConfig, 'utf8', (err, data) => {
			if (err) {
				console.error('Error reading JSON file:', err);
				return process.env["PLC_API_URL"];
			}
			const config = JSON.parse(data);
			return config.plcApiUrl || process.env["PLC_API_URL"];
		});
	}

	return process.env["PLC_API_URL"];
}

export const config: Config = {
	URL: urlCheck() || "",
	userName: process.env["PLC_USER_NAME"] || "",
	pwd: process.env["PLC_USER_PASSWD"] || "",
	mcpServerPort: process.env["MCP_SERVER_PORT"] || 5000,
	transport: process.env["TRANSPORT"] || "streamable-http"
};


