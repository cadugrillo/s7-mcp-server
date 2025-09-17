// export const config = {};
// config.URL = "https://192.168.2.200/api/jsonrpc";
// config.userName = "admin";
// config.pwr = "Siemens@1";

export const config = {};
config.URL = process.env["PLC_API_URL"];
config.userName = process.env["PLC_USER_NAME"];
config.pwr = process.env["PLC_USER_PASSWD"];
