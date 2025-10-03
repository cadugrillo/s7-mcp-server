import fs from 'fs';

interface Config {
	URL: string;
	userName: string;
	pwd: string;
	mcpServerPort: string | number;
	transport: string;
}

const urlCheck = (): string => {
	const pathToConfig = '/cfg-data/config.json';
	if (fs.existsSync(pathToConfig)) {
		try {
			const data = fs.readFileSync(pathToConfig, 'utf8');
			const config = JSON.parse(data);
			return config.plcApiUrl || "";
		} catch (err) {
			console.error('Error reading JSON file:', err);
			return process.env["PLC_API_URL"] || "";
		}
	} else {
		console.error("Config file not found. Using environment variable.");
		return process.env["PLC_API_URL"] || "";
	}
}

export const config: Config = {
	URL: urlCheck(),
	userName: process.env["PLC_USER_NAME"] || "",
	pwd: process.env["PLC_USER_PASSWD"] || "",
	mcpServerPort: process.env["MCP_SERVER_PORT"] || 5000,
	transport: process.env["TRANSPORT"] || "streamable-http"
};


