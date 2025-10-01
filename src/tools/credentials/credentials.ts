import { z } from "zod";
// ----------------------------------------------------------------------------------------------------------
import { config } from "../../utils/config.js";
import { sendReq } from "../../utils/func.js";
import { server } from "../../utils/mcp_server.js";

//......................................
const urlWebApi = config.URL;
const user = config.userName;
const pwd = config.pwd;
export let authInfos = { user: user, pwd: pwd, token: null };
let loginIntervalId: NodeJS.Timeout | null = null;
// ------------------------------------------------------------------------------------------------------------
// AutoLogin Service (When user and pwr are set, it will try to logon and renew the token every 10 minutes)
// ------------------------------------------------------------------------------------------------------------
export const autoLoginService = () => {
  if (authInfos.user && authInfos.pwd) {
    const runLogon = async () => {
      try {
        const params = {
          user: authInfos.user,
          password: authInfos.pwd,
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
          //console.log(`Logon successfully completed for user: '${authInfos.user}'`);
          authInfos.token = data.result.token;
        } else {
          //console.log("failed to Logon: ", data);
        }
      } catch (err) {
        console.error("run Logon failed", err);
      }
    };
    runLogon();
    loginIntervalId = setInterval(runLogon, 600000); // renew token every 10 minutes
  }
};
// ------------------------------------------------------------------------------------------------------------
// Stop AutoLogin Service
// ------------------------------------------------------------------------------------------------------------
export const stopAutoLoginService = () => {
  if (loginIntervalId) {
    clearInterval(loginIntervalId);
    loginIntervalId = null;
  }
};
// ------------------------------------------------------------------------------------------------------------
// Perform Logout (for graceful shutdown)
// ------------------------------------------------------------------------------------------------------------
export const performLogout = async () => {
  if (!authInfos.token) return;

  try {
    const method = {
      id: 45,
      jsonrpc: "2.0",
      method: "Api.Logout",
    };
    await sendReq(urlWebApi, authInfos, method);
    authInfos.token = null;
    console.log("Logged out successfully");
  } catch (err) {
    console.error("Logout failed during shutdown:", err);
  }
};
// ------------------------------------------------------------------------------------------------------------
// Tool to log in to plc
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
    //console.log(`Tool 'Api-Login' || username: ${username}`);
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
        //console.log("Tool 'Api-Login' || token is saved");
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
      return {
        content: [
          {
            type: "text",
            text: `Tool 'Api-Login' || Error: ${String(err)}`,
          },
        ],
      };
    }
  }
);
// ------------------------------------------------------------------------------------------------------------------------------------------------
//  Tool to logout from plc
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
        //console.log("Tool 'api logout' || successfully completed.");
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
      console.error("Tool 'Api-Logout' || Error: ", err);
      return {
        content: [
          {
            type: "text",
            text: `Tool 'Api-Logout' || Error: ${String(err)}`,
          },
        ],
      };
    }
  }
);
// ------------------------------------------------------------------------------------------------------------------------------------------------
// Tool for Api.GetPermissions
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
        //console.log("Tool 'Api GetPermissions' || successfully completed. number: ", data.result.length);
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
      console.error("Tool 'Api-GetPermissions' || Error: ", err);
      return {
        content: [
          {
            type: "text",
            text: `Tool 'Api-GetPermissions' || Error: ${String(err)}`,
          },
        ],
      };
    }
  }
);
// ------------------------------------------------------------------------------------------------------------------------------------------------
// Tool for Api.ChangePassword
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
        //console.log("Tool 'Api-ChangePassword' || successfully completed. ");
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
      console.error("Tool 'Api-ChangePassword' || Error: ", err);
      return {
        content: [
          {
            type: "text",
            text: `Tool 'Api-ChangePassword' || Error: ${String(err)}`,
          },
        ],
      };
    }
  }
);