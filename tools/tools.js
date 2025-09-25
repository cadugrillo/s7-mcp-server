import { z } from "zod";
// ----------------------------------------------------------------------------------------------------------
import {
  objectTypeType,
  objectReadType,
  objectOperatingModeType,
  AlarmsBrowseFiltersRequestType,
  DiagnosticBufferBrowseFiltersRequestType,
} from "../utils/enum.js";
import { config } from "../utils/config.js";
import { sendReq } from "../utils/func.js";
import { server } from "../utils/mcp_server.js";
//......................................
const urlWebApi = config.URL;
const user = config.userName;
const pwr = config.pwr;
let authInfos = { user: user, pwr: pwr, token: null };
// ------------------------------------------------------------------------------------------------------------
export const logonService = () => {
  if (authInfos.user && authInfos.pwr) {
    const runLogon = async () => {
      try {
        const params = {
          user: authInfos.user,
          password: authInfos.pwr,
          include_web_application_cookie: true,
        };
        const method = {
          id: 45,
          jsonrpc: "2.0",
          method: "Api.Login",
          params,
        };
        const data = await sendReq(urlWebApi, null, method);

        if (data?.result) {
          console.log(
            `Logon successfully completed for user: '${authInfos.user}'`
          );
          authInfos.token = data.result.token;
        } else {
          console.log("failed to Logon: ", data);
        }
      } catch (err) {
        console.error("run Logon failed", err);
      }
    };
    runLogon();
    setInterval(runLogon, 600000);
  }
};

// ------------------------------------------------------------------------------------------------------------
// Tool to log in plc
// ------------------------------------------------------------------------------------------------------------

server.tool(
  "Api-Login",
  `
 The Api.Login method checks the login data of the user and on successful verification opens a
 new Web API session. The method requests the name and the password of the user in plain
 text as proof of authorization. The user name and the password are encrypted before they are
 transferred to the server.

Possible error messages:
4   No resources                    || The system does not have the required resources to carry out this request. Perform the request again as soon as enough resources are available again.
100 Login failed                    || The user name and/or password are not permissible. Assign a permissible user name and a permissible password. Another reason why the login failed may be an active brute force attack.
101 Already authenticated           || The current X-Auth-Token is already authenticated. Use Api.Logout before you authenticate yourself again.
102 Login Failed - Password expired || The password of the user account has expired. The user must change the password in order to be able to successfully authenticate again

   `,
  {
    username: z.string().min(1, "Username cannot be empty."),
    password: z.string().min(1, "Password cannot be empty."),
  },
  async ({ username, password }, executionContext) => {
    console.log(`Tool 'Api-Login' || username: ${username}`);
    try {
      const params = {
        user: username,
        password: password,
        include_web_application_cookie: true,
      };
      const method = {
        id: 45,
        jsonrpc: "2.0",
        method: "Api.Login",
        params,
      };
      const data = await sendReq(urlWebApi, null, method);
      if (data?.result) {
        authInfos.user = username;
        authInfos.pwd = password;
        authInfos.token = data.result.token;
        console.log("Tool 'Api-Login' || token is saved");
      }
      return {
        content: [
          {
            type: "text",
            text: data?.result
              ? "Tool 'Api-Login' || successfully completed."
              : JSON.stringify(data.error),
          },
        ],
      };
    } catch (err) {
      console.error("Tool 'Api-Login' || Error: ", err);
    }
  }
);

// ------------------------------------------------------------------------------------------------------------------------------------------------
// Tool to api ping
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
      const data = await sendReq(urlWebApi, authInfos, method);
      if (data?.result) {
        console.log("Tool 'api ping' || successfully completed.");
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
      console.error("Tool 'api ping' || Error: ", err);
    }
  }
);
// ------------------------------------------------------------------------------------------------------------------------------------------------
// Tool to Api.GetPermissions
// ------------------------------------------------------------------------------------------------------------------------------------------------
server.tool(
  "Api-GetPermissions",
  `
After the successful login, the Api.GetPermissions returns a list of actions for whose execution the user is authorized.
  `,
  {},
  async ({}, executionContext) => {
    try {
      const method = {
        id: 45,
        jsonrpc: "2.0",
        method: "Api.GetPermissions",
      };
      const data = await sendReq(urlWebApi, authInfos, method);
      if (data?.result) {
        console.log(
          "Tool 'Api GetPermissions' || successfully completed. number: ",
          data.result.length
        );
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
      console.error("Tool 'Api GetPermissions' || Error: ", err);
    }
  }
);
// ------------------------------------------------------------------------------------------------------------------------------------------------
// Tool to Api.Version
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
      const data = await sendReq(urlWebApi, authInfos, method);
      if (data?.result) {
        console.log("Tool 'api Version' || successfully completed.");
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
      console.error("Tool 'api Version' || Error: ", err);
    }
  }
);
// ------------------------------------------------------------------------------------------------------------------------------------------------
// Tool to Api.Browse
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
      const data = await sendReq(urlWebApi, authInfos, method);
      if (data?.result) {
        console.log(
          "Tool 'api browse' || successfully completed. number: ",
          data.result.length
        );
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
      console.error("Tool 'api browse' || Error: ", err);
    }
  }
);
// ------------------------------------------------------------------------------------------------------------------------------------------------
// Tool to Api-Logout
// ------------------------------------------------------------------------------------------------------------------------------------------------
server.tool(
  "Api-Logout",
  `
The Api.Logout method removes the token from the list of active Web API sessions and ends the session.
The Api.Logout method returns the status of whether the logout was successful or not.
For security reasons, however, the method always returns the Boolean value "true" even if the token is invalid.
  `,
  {},
  async ({}, executionContext) => {
    try {
      const method = {
        id: 45,
        jsonrpc: "2.0",
        method: "Api.Logout",
      };
      const data = await sendReq(urlWebApi, authInfos, method);
      if (data?.result) {
        console.log("Tool 'api logout' || successfully completed.");
      }
      return {
        content: [
          {
            type: "text",
            text: data?.result
              ? "Tool 'Api-Logout' || successfully completed."
              : JSON.stringify(data),
          },
        ],
      };
    } catch (err) {
      console.error("Tool 'api logout' || Error: ", err);
    }
  }
);
// ------------------------------------------------------------------------------------------------------------------------------------------------
// Tool to Api.GetPermissions
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
      const data = await sendReq(urlWebApi, authInfos, method);
      if (data?.result) {
        console.log(
          "Tool 'Api GetQuantityStructures' || successfully completed. number: ",
          data.result.length
        );
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
      console.error("Tool 'Api GetQuantityStructures' || Error: ", err);
    }
  }
);
// ------------------------------------------------------------------------------------------------------------------------------------------------
// Tool to Api.ChangePassword
// ------------------------------------------------------------------------------------------------------------------------------------------------
server.tool(
  "Api-ChangePassword",
  `
You can change the password for a user account with the Api.ChangePassword method.
Recommendation: Before changing a password, read the password policy from the CPU using the Api.GetPasswordPolicy API method.
If the new password does not conform to the password policy of the CPU, a corresponding error message is returned.
No prior authorizations are required to call the Api.ChangePassword method, but you must enter the current password for this call.
Possible error messages:
 5   System is read-only                          || The memory card is write-protected. Therefore, the password cannot be changed.
 6   Not accepted                                 || The password change is not performed because a CPU was configured with firmware version < V3.1. The method can only be used with CPUs as of firmware version V3.1.
 100 Login failed                                 || The user name and password combination is invalid. Assign a permissible user name and a permissible password. Another reason why the login failed may be an active brute force attack.
 103 New password does not follow password policy || The provided new password does not match with the required password policy. Assign a password conforming to the password policy. The Api.GetPasswordPolicy method provides you with the password policy of the CPU, if the CPU is in "local" authentication mode.
 104 New password matches former password         || The new password is identical with the previous password. Assign a different password. Note that the CPU does not store a password history. The comparison is therefore only performed between the new and previous password.
  `,
  {
    username: z.string().min(1, "Username cannot be empty."),
    password: z.string().min(1, "Password cannot be empty."),
    new_password: z.string().min(1, "new Password cannot be empty."),
  },
  async ({ username, password, new_password }, executionContext) => {
    try {
      const params = {
        username,
        password,
        new_password,
      };
      const method = {
        id: 45,
        jsonrpc: "2.0",
        method: "Api.ChangePassword",
        params,
      };
      const data = await sendReq(urlWebApi, authInfos, method);
      if (data?.result) {
        console.log("Tool 'Api-ChangePassword' || successfully completed. ");
      }
      return {
        content: [
          {
            type: "text",
            text: data?.result
              ? "Tool 'Api-ChangePassword' || successfully completed."
              : JSON.stringify(data),
          },
        ],
      };
    } catch (err) {
      console.error("Tool 'Api ChangePassword' || Error: ", err);
    }
  }
);
// ------------------------------------------------------------------------------------------------------------------------------------------------
// Tool to Api.GetPasswordPolicy
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
      const data = await sendReq(urlWebApi, authInfos, method);
      if (data?.result) {
        console.log(
          "Tool 'Api GetPasswordPolicy' || successfully completed. number: ",
          data.result.length
        );
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
      console.error("Tool 'Api GetPasswordPolicy' || Error: ", err);
    }
  }
);

// ------------------------------------------------------------------------------------------------------------------------------------------------
// Tool to browse Plc Program
// ------------------------------------------------------------------------------------------------------------------------------------------------

server.tool(
  "PlcProgram-Browse-Children",
  `
 The PlcProgram.Browse method allows you to search for tags and the corresponding metadata according to your individual requirements.
 To call the PlcProgram.Browse method, you need the "read_value" authorization.

Possible error messages:
  2   Permission denied           || The current authentication token is not authorized to call this method.
                                  || Log on with a user account that has sufficient privileges to call this method.
  3   System is busy              || The desired operation cannot be performed because the system is currently performing a different request.
                                  || Restart the query as soon as the current operation is complete.
  4   No resources                || The system does not have the required resources to retrieve the type information.
                                  || Perform the request again as soon as enough resources are available again.
  200 Address does not exist      || The requested address does not exist or the Web server cannot access the requested address.
  201 Invalid address             || The name structure of the symbolic address is not correct.
  202 Variable is not a structure || It is not possible to search the specific address because the tag is not a structured data type.
  203 Invalid array index         || The dimensions and limits of the array indexes do not correspond to the type information of the CPU.`,

  {
    _var: z.string().optional().default(""),
    type: z.array(objectTypeType).optional().default([]),
  },
  async ({ _var, type }, executionContext) => {
    try {
      const params = {
        mode: "children",
      };
      if (_var) {
        params["var"] = _var;
      }
      if (type) {
        params["type"] = type;
      }
      const method = {
        id: 45,
        jsonrpc: "2.0",
        method: "PlcProgram.Browse",
        params: params,
      };
      const data = await sendReq(urlWebApi, authInfos, method);
      if (data?.result) {
        console.log(
          "Tool 'browse-Plc-Program' ||  Number of items: ",
          data.result.length
        );
      }
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data?.result ? data.result : data.error),
          },
        ],
      };
    } catch (err) {
      console.error("Tool 'browse-Plc-Program' ||error: ", err);
    }
  }
);

// ------------------------------------------------------------------------------------------------------------------------------------------------
// Tool to browse Plc Program
// ------------------------------------------------------------------------------------------------------------------------------------------------

server.tool(
  "PlcProgram-Browse-Var",
  `
 The PlcProgram.Browse method allows you to search for tags and the corresponding metadata according to your individual requirements.
 To call the PlcProgram.Browse method, you need the "read_value" authorization.

Possible error messages:
  2   Permission denied           || The current authentication token is not authorized to call this method.
                                  || Log on with a user account that has sufficient privileges to call this method.
  3   System is busy              || The desired operation cannot be performed because the system is currently performing a different request.
                                  || Restart the query as soon as the current operation is complete.
  4   No resources                || The system does not have the required resources to retrieve the type information.
                                  || Perform the request again as soon as enough resources are available again.
  200 Address does not exist      || The requested address does not exist or the Web server cannot access the requested address.
  201 Invalid address             || The name structure of the symbolic address is not correct.
  202 Variable is not a structure || It is not possible to search the specific address because the tag is not a structured data type.
  203 Invalid array index         || The dimensions and limits of the array indexes do not correspond to the type information of the CPU.`,

  {
    _var: z.string().min(1, "_var cannot be empty."),
    type: z.array(objectTypeType).optional().default([]),
  },
  async ({ _var, type }, executionContext) => {
    try {
      const params = {
        mode: "var",
      };
      if (_var) {
        params["var"] = _var;
      }
      if (type) {
        params["type"] = type;
      }
      const method = {
        id: 45,
        jsonrpc: "2.0",
        method: "PlcProgram.Browse",
        params: params,
      };
      const data = await sendReq(urlWebApi, authInfos, method);
      if (data?.result) {
        console.log(
          "Tool 'browse-Plc-Program' ||  Number of items: ",
          data.result.length
        );
      }
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data?.result ? data.result : data.error),
          },
        ],
      };
    } catch (err) {
      console.error("Tool 'browse-Plc-Program' ||error: ", err);
    }
  }
);
// ------------------------------------------------------------------------------------------------------------------------------------------------
// Tool to PlcProgram-Read
// ------------------------------------------------------------------------------------------------------------------------------------------------
server.tool(
  "PlcProgram-Read",
  `
Use the PlcProgram.Read method to read a single variable from a CPU.
To call the PlcProgram.Read method, you need the "read_value" authorization.
 Possible error messages:
  2   Permission denied      || The current authentication token is not authorized to call this method.
                             || Log on with a user account that has sufficient privileges to call this method.
  4   No resources           || The system does not have the necessary resources to read the requested address. 
                             || Carry out the request again as soon as sufficient resources are available.
  200 Address does not exist || The requested address does not exist or the Web server cannot access it.
  201 Invalid address        || The name structure of the symbolic address is not correct.
  203 Invalid array index    || The dimensions and limits of the array indexes do not correspond to the type information of the CPU.
  204 Unsupported address    || The data type of the address cannot be read.
`,

  {
    _var: z.string().min(1, "cannot be empty."),
    mode: objectReadType,
  },
  async ({ _var, mode }, executionContext) => {
    try {
      const params = {};
      params["var"] = _var;
      if (mode) {
        params["mode"] = mode;
      }

      const method = {
        id: 45,
        jsonrpc: "2.0",
        method: "PlcProgram.Read",
        params: params,
      };
      const data = await sendReq(urlWebApi, authInfos, method);
      if (!data?.error) {
        console.log("Tool 'PlcProgram-Read' || successfully completed.");
      }
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data?.error ? data.error : data.result),
          },
        ],
      };
    } catch (err) {
      console.error("Tool 'PlcProgram-Read' ||error: ", err);
    }
  }
);
// ------------------------------------------------------------------------------------------------------------------------------------------------
// Tool to PlcProgram.Write Boolean
// ------------------------------------------------------------------------------------------------------------------------------------------------
server.tool(
  "PlcProgram-Write-Boolean",
  `
Use the PlcProgram.Write method to write a single process tag to the CPU.
To call the PlcProgram.Write method, you need the "write_value" authorization.
Possible error messages:
2   Permission denied      || The current authentication token is not authorized to call this method.
                           || Log on with a user account that has sufficient privileges to call this method.
4   No resources           || The system does not have the necessary resources to write the requested address.
                           || Carry out the request again as soon as sufficient resources are available.
200 Address does not exist || The requested address does not exist or the Web server cannot access the requested address.
201 Invalid address        || The name structure of the symbolic address is not correct.
203 Invalid array index    || The dimensions and limits of the array indexes do not correspond to the type information of the CPU.
204 Unsupported address    || The data type of the address cannot be written.
`,

  {
    _var: z.string().min(1, "cannot be empty."),
    value: z.boolean(),
  },
  async ({ _var, value }, executionContext) => {
    try {
      const params = {};
      params["var"] = _var;
      params["value"] = value;
      params["mode"] = "simple";
      const method = {
        id: 45,
        jsonrpc: "2.0",
        method: "PlcProgram.Write",
        params: params,
      };
      const data = await sendReq(urlWebApi, authInfos, method);
      if (!data?.error) {
        console.log("Tool 'PlcProgram-Write' || successfully completed.");
      }
      return {
        content: [
          {
            type: "text",
            text: data?.error
              ? JSON.stringify(data.error)
              : "Tool 'PlcProgram-Write' || successfully completed.",
          },
        ],
      };
    } catch (err) {
      console.error("Tool 'PlcProgram-Write' ||error: ", err);
    }
  }
);
// ------------------------------------------------------------------------------------------------------------------------------------------------
// Tool to PlcProgram.Write Number
// ------------------------------------------------------------------------------------------------------------------------------------------------
server.tool(
  "PlcProgram-Write-Number",
  `
Use the PlcProgram.Write method to write a single process tag to the CPU.
To call the PlcProgram.Write method, you need the "write_value" authorization.
Possible error messages:
2   Permission denied      || The current authentication token is not authorized to call this method.
                           || Log on with a user account that has sufficient privileges to call this method.
4   No resources           || The system does not have the necessary resources to write the requested address.
                           || Carry out the request again as soon as sufficient resources are available.
200 Address does not exist || The requested address does not exist or the Web server cannot access the requested address.
201 Invalid address        || The name structure of the symbolic address is not correct.
203 Invalid array index    || The dimensions and limits of the array indexes do not correspond to the type information of the CPU.
204 Unsupported address    || The data type of the address cannot be written.
`,

  {
    _var: z.string().min(1, "cannot be empty."),
    value: z.number(),
  },
  async ({ _var, value }, executionContext) => {
    try {
      const params = {};
      params["var"] = _var;
      params["value"] = value;
      params["mode"] = "simple";
      const method = {
        id: 45,
        jsonrpc: "2.0",
        method: "PlcProgram.Write",
        params: params,
      };
      const data = await sendReq(urlWebApi, authInfos, method);
      if (!data?.error) {
        console.log("Tool 'PlcProgram-Write' || successfully completed.");
      }
      return {
        content: [
          {
            type: "text",
            text: data?.error
              ? JSON.stringify(data.error)
              : "Tool 'PlcProgram-Write' || successfully completed.",
          },
        ],
      };
    } catch (err) {
      console.error("Tool 'PlcProgram-Write' ||error: ", err);
    }
  }
);
// ------------------------------------------------------------------------------------------------------------------------------------------------
// Tool to PlcProgram.Write string
// ------------------------------------------------------------------------------------------------------------------------------------------------
server.tool(
  "PlcProgram-Write-String",
  `
Use the PlcProgram.Write method to write a single process tag to the CPU.
To call the PlcProgram.Write method, you need the "write_value" authorization.
Possible error messages:
2   Permission denied      || The current authentication token is not authorized to call this method.
                           || Log on with a user account that has sufficient privileges to call this method.
4   No resources           || The system does not have the necessary resources to write the requested address.
                           || Carry out the request again as soon as sufficient resources are available.
200 Address does not exist || The requested address does not exist or the Web server cannot access the requested address.
201 Invalid address        || The name structure of the symbolic address is not correct.
203 Invalid array index    || The dimensions and limits of the array indexes do not correspond to the type information of the CPU.
204 Unsupported address    || The data type of the address cannot be written.
`,

  {
    _var: z.string().min(1, "cannot be empty."),
    value: z.string(),
  },
  async ({ _var, value }, executionContext) => {
    try {
      const params = {};
      params["var"] = _var;
      params["value"] = value;
      params["mode"] = "simple";
      const method = {
        id: 45,
        jsonrpc: "2.0",
        method: "PlcProgram.Write",
        params: params,
      };
      const data = await sendReq(urlWebApi, authInfos, method);
      if (!data?.error) {
        console.log("Tool 'PlcProgram-Write' || successfully completed.");
      }
      return {
        content: [
          {
            type: "text",
            text: data?.error
              ? JSON.stringify(data.error)
              : "Tool 'PlcProgram-Write' || successfully completed.",
          },
        ],
      };
    } catch (err) {
      console.error("Tool 'PlcProgram-Write' ||error: ", err);
    }
  }
);
// ------------------------------------------------------------------------------------------------------------------------------------------------
// Tool to Plc.ReadOperatingMode
// ------------------------------------------------------------------------------------------------------------------------------------------------
server.tool(
  "Plc-ReadOperatingMode",
  `
With the Plc.ReadOperatingMode method you can read the operating mode of the CPU.
To call the Plc.ReadOperatingMode method, you need the "read_diagnostics" authorization.
Possible error messages:
 2 Permission denied || The current authentication token is not authorized to call this method.
                     || Log on with a user account that has sufficient privileges to call this method.`,
  {},
  async ({}, executionContext) => {
    try {
      const method = {
        id: 45,
        jsonrpc: "2.0",
        method: "Plc.ReadOperatingMode",
      };
      const data = await sendReq(urlWebApi, authInfos, method);
      if (data?.result) {
        console.log("Tool 'Plc ReadOperatingMode' || successfully completed. ");
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
      console.error("Tool 'Plc ReadOperatingMode' || Error: ", err);
    }
  }
);
// ------------------------------------------------------------------------------------------------------------------------------------------------
// Tool to Plc.RequestChangeOperatingMode
// ------------------------------------------------------------------------------------------------------------------------------------------------
server.tool(
  "Plc-RequestChangeOperatingMode",
  `
With the Plc.RequestChangeOperatingMode method, you request a new operating mode forthe CPU.
Note that this is only a request for an operating mode.
The conditions for an operating mode change must be given at the CPU, e.g. by the corresponding position of the mode selector.
You can use the Plc.ReadOperatingMode method to check whether the operating mode change on the CPU was successful.
To call the Plc.RequestChangeOperatingMode method, you need the "change_operating_mode" authorization.
Possible error messages
 2 Permission denied || The current authentication token is not authorized to call this method.
                     || Log on with a user account that has sufficient privileges to call this method
`,

  {
    mode: objectOperatingModeType,
  },
  async ({ mode }, executionContext) => {
    try {
      const params = {};

      params["mode"] = mode;
      const method = {
        id: 45,
        jsonrpc: "2.0",
        method: "Plc.RequestChangeOperatingMode",
        params: params,
      };
      const data = await sendReq(urlWebApi, authInfos, method);
      if (!data?.error) {
        console.log(
          "Tool 'Plc-RequestChangeOperatingMode' || successfully completed."
        );
      }
      return {
        content: [
          {
            type: "text",
            text: data?.error
              ? JSON.stringify(data.error)
              : "Tool 'Plc-RequestChangeOperatingMode' || successfully completed.",
          },
        ],
      };
    } catch (err) {
      console.error("Tool 'Plc-RequestChangeOperatingMode' ||error: ", err);
    }
  }
);
// ------------------------------------------------------------------------------------------------------------------------------------------------
// Tool to Plc.ReadSystemTime
// ------------------------------------------------------------------------------------------------------------------------------------------------
server.tool(
  "Plc-ReadSystemTime",
  `
This API method provides the system time of the CPU. If you have synchronized the system
time of the CPU, for example via the TIA Portal function "Online & diagnostics", the system
time corresponds to Coordinated Universal Time (UCT).`,
  {},
  async ({}, executionContext) => {
    try {
      const method = {
        id: 45,
        jsonrpc: "2.0",
        method: "Plc.ReadSystemTime",
      };
      const data = await sendReq(urlWebApi, authInfos, method);
      if (data?.result) {
        console.log("Tool 'Plc ReadSystemTime' || successfully completed. ");
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
      console.error("Tool 'Plc ReadSystemTime' || Error: ", err);
    }
  }
);
// ------------------------------------------------------------------------------------------------------------------------------------------------
// Tool to Plc.Plc.SetSystemTime
// ------------------------------------------------------------------------------------------------------------------------------------------------
server.tool(
  "Plc-SetSystemTime",
  `
Use this API method to set the system time of the CPU (PLC local time).
To call the Plc.SetSystemTime method, you need the "change_time_settings" permission.
Possible error messages:
 2   Permission denied                  || The current authentication token is not authorized to call this method.
                                        || Log in with a user account that has sufficient authorizations to call this method.
 900 Invalid timestamp                  || The time stamp used does not match the required time-stamp format (ISO time-stamp defaults).
 901 Time not within allowed time range || The time stamp is not within the allowed period for time stamps.
                                        || The end of the possible timespan is 2200-12-31T23:59:59.999999999Z

`,

  {
    timestamp: z
      .string()
      .datetime({
        message: "Invalid ISO 8601 datetime string for timestamp",
      })
      .min(1, "datetime cannot be empty."),
  },
  async ({ timestamp }, executionContext) => {
    try {
      const params = {};

      params["timestamp"] = timestamp;
      const method = {
        id: 45,
        jsonrpc: "2.0",
        method: "Plc.SetSystemTime",
        params: params,
      };
      const data = await sendReq(urlWebApi, authInfos, method);
      if (!data?.error) {
        console.log("Tool 'Plc SetSystemTime' || successfully completed.");
      }
      return {
        content: [
          {
            type: "text",
            text: data?.error
              ? JSON.stringify(data.error)
              : "Tool 'Plc SetSystemTime' || successfully completed.",
          },
        ],
      };
    } catch (err) {
      console.error("Tool 'Plc SetSystemTime' ||error: ", err);
    }
  }
);
// ------------------------------------------------------------------------------------------------------------------------------------------------
// Tool to Plc.ReadSystemTime
// ------------------------------------------------------------------------------------------------------------------------------------------------
server.tool(
  "Project-ReadLanguages",
  `
This API method returns a list with the project languages available on the CPU.
You can then use the "Alarms.Browse" or "DiagnosticBuffer.Browse" API methods in one of the
available languages to get alarm messages or diagnostic messages in the available languages.
To call the Project.ReadLanguages method, you need the "read_diagnostics" permission.
Possible error messages:
2 Permission denied || The current authentication token is not authorized to call this method.
`,
  {},
  async ({}, executionContext) => {
    try {
      const method = {
        id: 45,
        jsonrpc: "2.0",
        method: "Project.ReadLanguages",
      };
      const data = await sendReq(urlWebApi, authInfos, method);
      if (data?.result) {
        console.log("Tool 'Project ReadLanguages' || successfully completed. ");
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
      console.error("Tool 'Project ReadLanguages' || Error: ", err);
    }
  }
);
// ------------------------------------------------------------------------------------------------------------------------------------------------
// Tool to Alarms-Browse
// ------------------------------------------------------------------------------------------------------------------------------------------------
server.tool(
  "Alarms-Browse",
  `
With this method you can determine which alarms are currently active on the CPU, and when
the last change occurred within the diagnostics buffer.
To call the Alarms.Browse method, you need the "read_diagnostics" permission.
Possible error messages:
2   Permission denied  || The current authentication token is not authorized to call this method. Log on with a user account that has sufficient privileges to call this method.
800 Invalid alarm ID   || The alarm ID provided is invalid.
801 Invalid parameters || The request is invalid because provided parameters are invalid (e.g. the parameters "count" and "id" are present at the same time).

`,

  {
    language: z.string().min(1, "language cannot be empty.").default("en-US"),
    count: z.number().optional(),
    alarm_id: z.string().optional(),
    filters: AlarmsBrowseFiltersRequestType.optional().default({}),
  },
  async ({ language, count, alarm_id, filters }, executionContext) => {
    try {
      const params = {};

      params["language"] = language;
      if (count) {
        params["count"] = count;
      }
      if (alarm_id) {
        params["alarm_id"] = alarm_id;
      }
      if (filters) {
        params["filters"] = filters;
      }
      const method = {
        id: 45,
        jsonrpc: "2.0",
        method: "Alarms.Browse",
        params: params,
      };
      const data = await sendReq(urlWebApi, authInfos, method);
      if (!data?.error) {
        console.log("Tool 'Alarms Browse' || successfully completed.");
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
      console.error("Tool 'Alarms Browse' ||error: ", err);
    }
  }
);
// ------------------------------------------------------------------------------------------------------------------------------------------------
// Tool to Alarms.Acknowledge
// ------------------------------------------------------------------------------------------------------------------------------------------------
server.tool(
  "Alarms-Acknowledge",
  `
Use this method to acknowledge individual alarms.
To call the Alarms.Acknowledge method, you need the "acknowledge_alarms" permission.
Possible error messages: 
2 Permission denied || The current authentication token is not authorized to call this method. Log in with a user account that has sufficient authorizations to call this method
`,

  {
    id: z.string().min(1, "id cannot be empty."),
  },
  async ({ id }, executionContext) => {
    try {
      const params = {};

      params["id"] = id;

      const method = {
        id: 45,
        jsonrpc: "2.0",
        method: "Alarms.Acknowledge",
        params: params,
      };
      const data = await sendReq(urlWebApi, authInfos, method);

      if (!data?.error) {
        console.log("Tool 'Alarms Acknowledge' || successfully completed.");
      }
      return {
        content: [
          {
            type: "text",
            text: data?.error
              ? JSON.stringify(data.error)
              : "Tool 'Alarms Acknowledge' || successfully completed.",
          },
        ],
      };
    } catch (err) {
      console.error("Tool 'Alarms Acknowledge' ||error: ", err);
    }
  }
);
// ------------------------------------------------------------------------------------------------------------------------------------------------
// Tool to DiagnosticBuffer-Browse
// ------------------------------------------------------------------------------------------------------------------------------------------------
server.tool(
  "DiagnosticBuffer-Browse",
  `
With this method you read out entries from the diagnostics buffer of the CPU.
To call the DiagnosticBuffer.Browse method, you need the "read_diagnostics" permission.
Possible error messages
2 Permission denied || The current authentication token is not authorized to call this method. Log on with a user account that has sufficient privileges to call this method
`,

  {
    language: z.string().min(1, "language cannot be empty.").default("en-US"),
    count: z.number().optional(),
    filters: DiagnosticBufferBrowseFiltersRequestType.optional().default({}),
  },
  async ({ language, count, filters }, executionContext) => {
    try {
      const params = {};

      params["language"] = language;
      if (count) {
        params["count"] = count;
      }
      if (filters) {
        params["filters"] = filters;
      }
      const method = {
        id: 45,
        jsonrpc: "2.0",
        method: "DiagnosticBuffer.Browse",
        params: params,
      };
      const data = await sendReq(urlWebApi, authInfos, method);
      if (!data?.error) {
        console.log(
          "Tool 'DiagnosticBuffer Browse' || successfully completed."
        );
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
      console.error("Tool 'DiagnosticBuffer Browse' ||error: ", err);
    }
  }
);
