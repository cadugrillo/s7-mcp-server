import { sendReq } from "../../utils/func.js";
import { server } from "../../utils/mcp_server.js";
import { config } from "../../utils/config.js";
//......................................
const urlWebApi = config.URL;
// ------------------------------------------------------------------------------------------------------------
// Basic Funtions that does not need authentication
// ------------------------------------------------------------------------------------------------------------
export const basicFunctions = () => {}
// ------------------------------------------------------------------------------------------------------------------------------------------------
// Tool for Api.Ping
// ------------------------------------------------------------------------------------------------------------------------------------------------
server.tool(
  "Api-Ping",
  `
  The Api.Ping method outputs a unique ID for the CPU used. You can use it to determine whether the CPU can be reached.
  The CPU ID comprises a 28-byte string.
  The system assigns a new, unique CPU ID after each restart (POWER ON - POWER OFF) or warm start of the CPU.
  By comparing this with previously output IDs, you can also determine whether the CPU was restarted in the meantime.
  No authorization is required for calling the Api.Ping method.
  `,
  {},
  async ({}, executionContext) => {
    try {
      const method = {
        id: 45,
        jsonrpc: "2.0",
        method: "Api.Ping",
      };
      const data = await sendReq(urlWebApi, null, method);
      if (data?.result) {
        //console.log("Tool 'api ping' || successfully completed.");
      }
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data?.result ? { uID: data.result } : data),
          },
        ],
      };
    } catch (err) {
      console.error("Tool 'Api-Ping' || Error: ", err);
      return {
        content: [
          {
            type: "text",
            text: `Tool 'Api-Ping' || Error: ${String(err)}`,
          },
        ],
      };
    }
  }
);
// ------------------------------------------------------------------------------------------------------------------------------------------------
// Tool for Api.Version
// ------------------------------------------------------------------------------------------------------------------------------------------------
server.tool(
  "Api-Version",
  `
Use the Api.Version method to request the current version number of the Web API. You can draw conclusions from the version number:
• The functions supported by the CPU version
• The hardware functional status of the CPU
This information lets you implement applications that dynamically adapt to the scope of
functions offered by the contacted CPU. An application can support multiple CPU versions.
No authorization is required for calling the Api.Version method
  `,
  {},
  async ({}, executionContext) => {
    try {
      const method = {
        id: 45,
        jsonrpc: "2.0",
        method: "Api.Version",
      };
      const data = await sendReq(urlWebApi, null, method);
      if (data?.result) {
        //console.log("Tool 'api Version' || successfully completed.");
      }
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data?.result ? data.result : data),
          },
        ],
      };
    } catch (err) {
      console.error("Tool 'Api-Version' || Error: ", err);
      return {
        content: [
          {
            type: "text",
            text: `Tool 'Api-Version' || Error: ${String(err)}`,
          },
        ],
      };
    }
  }
);
// ------------------------------------------------------------------------------------------------------------------------------------------------
// Tool for Api.Browse
// ------------------------------------------------------------------------------------------------------------------------------------------------
server.tool(
  "Api-Browse",
  `
The Api.Browse method gives you a list of all methods that you can call via the Web API with the current firmware.
This provides you with an overview of all the methods supported by the CPU. No authorization is required for calling the Api.Browse method.
Possible error messages:
4 No resources || The system does not have the necessary resources to execute the Web API request.
                  Perform the request again as soon as enough resources are available again.
  `,
  {},
  async ({}, executionContext) => {
    try {
      const method = {
        id: 45,
        jsonrpc: "2.0",
        method: "Api.Browse",
      };
      const data = await sendReq(urlWebApi, null, method);
      if (data?.result) {
        //console.log("Tool 'api browse' || successfully completed. number: ", data.result.length);
      }
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data?.result ? data.result : data),
          },
        ],
      };
    } catch (err) {
      console.error("Tool 'Api-Browse' || Error: ", err);
      return {
        content: [
          {
            type: "text",
            text: `Tool 'Api-Browse' || Error: ${String(err)}`,
          },
        ],
      };
    }
  }
);
// ------------------------------------------------------------------------------------------------------------------------------------------------
// Tool for Api.GetQuantityStructures
// ------------------------------------------------------------------------------------------------------------------------------------------------
server.tool(
  "Api-GetQuantityStructures",
  `
The Api.GetQuantityStructures method returns different structure information of the Web server.
  `,
  {},
  async ({}, executionContext) => {
    try {
      const method = {
        id: 45,
        jsonrpc: "2.0",
        method: "Api.GetQuantityStructures",
      };
      const data = await sendReq(urlWebApi, null, method);
      if (data?.result) {
        //console.log("Tool 'Api GetQuantityStructures' || successfully completed. number: ", data.result.length);
      }
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data?.result ? data.result : data),
          },
        ],
      };
    } catch (err) {
      console.error("Tool 'Api-GetQuantityStructures' || Error: ", err);
      return {
        content: [
          {
            type: "text",
            text: `Tool 'Tool 'Api-GetQuantityStructures' || Error: ${String(err)}`,
          },
        ],
      };
    }
  }
);
// ------------------------------------------------------------------------------------------------------------------------------------------------
// Tool for Api.GetPasswordPolicy
// ------------------------------------------------------------------------------------------------------------------------------------------------
server.tool(
  "Api-GetPasswordPolicy",
  `
Passwords must fulfill specific criteria to be secure. The Api.GetPasswordPolicy method provides you with the password policy of the CPU.
The password policy is a global setting in the STEP 7 project and applies for all users of the Web server.
The method does not contain any information on the expiration of the password.
Any user, including unauthenticated users ("Anonymous"), can call this API method.
No authorization is required for calling the Api.GetPasswordPolicy method.
Possible error messages:
 6 Not accepted || The password policy cannot be read because a CPU is configured with a firmware version < V3.1.
                || The method can only be used with CPUs as of firmware version V3.1
  `,
  {},
  async ({}, executionContext) => {
    try {
      const method = {
        id: 45,
        jsonrpc: "2.0",
        method: "Api.GetPasswordPolicy",
      };
      const data = await sendReq(urlWebApi, null, method);
      if (data?.result) {
        //console.log("Tool 'Api GetPasswordPolicy' || successfully completed. number: ", data.result.length);
      }
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data?.result ? data.result : data),
          },
        ],
      };
    } catch (err) {
      console.error("Tool 'Api-GetPasswordPolicy' || Error: ", err);
      return {
        content: [
          {
            type: "text",
            text: `Tool 'Tool 'Api-GetPasswordPolicy' || Error: ${String(err)}`,
          },
        ],
      };
    }
  }
);