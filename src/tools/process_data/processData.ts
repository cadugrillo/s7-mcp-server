import { z } from "zod";
// ----------------------------------------------------------------------------------------------------------
import {
  objectTypeType,
  objectReadType,
  objectOperatingModeType,
} from "../../utils/enum.js";
import { authInfos } from "../credentials/credentials.js";
import { sendReq } from "../../utils/func.js";
import { server } from "../../utils/mcp_server.js";
import { config } from "../../utils/config.js";
//......................................
const urlWebApi = config.URL;
// ------------------------------------------------------------------------------------------------------------
// Process Data Functions that does need authentication
// ------------------------------------------------------------------------------------------------------------
export const processData = () => {}

interface Params {
    mode?: string;
    var?: string;
    type?: string[];
    value?: boolean | number | string;
    timestamp?: string;

}
// ------------------------------------------------------------------------------------------------------------------------------------------------
// Tool to browse Plc Program
// ------------------------------------------------------------------------------------------------------------------------------------------------
server.tool(
  "PlcProgram-Browse",
  `
 The PlcProgram.Browse method allows you to search for tags and the corresponding metadata according to your individual requirements.
 To call the PlcProgram.Browse method, you need the "read_value" authorization.

 Structure of the request:
 
 The following table informs you about the properties of the tag to be searched.

 | Name | Required                         | Data type       | Description |
 |------|----------------------------------|-----------------|-------------|
 | var  | Yes/no, see "Description" column | string          | Name of the tag to be searched. If this attribute is present, it cannot be an empty string.<br><br>• If "mode" = "var", then this attribute is required. The Browse method searches for the provided tag to retrieve the metadata of the tag<br>• If "mode" = "children", this attribute is optional. The Browse method searches for the tag and returns a list of child tags and metadata. |
 | mode | Yes                              | string          | Enumeration that determines the behavior of this method.<br><br>• "var": Displays information about the specified tag<br>• "children": Outputs information about the immediate descendants (children) of the specified tags. |
 | type | No                               | array of string | Possible array entries are:<br><br>• "code_blocks": Reads all code blocks<br>• "data_blocks": Reads all data blocks<br>• "tags": Removes all tags<br><br>If no "type" parameter is selected for compatibility reasons, only DBs and tags are returned. |


 Example 1:
 In the following example the user searches the root node ("root") of the CPU.

 {
"mode": "children"
 }

 Example 2:
 In the following example, the user searches the descendants (children) of a data block.

 {
 "var": "\"MyDB\"",
 "mode": "children"
 }

 Example 3:
 In the following example, the user requests information about a specific tag.

 {
 "var": "\"MyDB\".MyStruct.MyField",
 "mode": "var"
 }

 Example 4:
 In the following example, the user searches code blocks of a CPU.

 {
 "mode": "children",
 "type": ["code_blocks"]
 }

 Example 5:
 In the following example, the user searches the data blocks of a CPU.

 {
 "mode": "children",
 "type": ["data_blocks"]
 }

 Example 6:
 The following example shows the result of searching the root node "root" of the CPU.
 The "type" parameter is selected with all 3 possible array entries "data_blocks", "code_blocks" and "tags".

{
"var": "",
"type": ["data_blocks, "code_blocks", "tags"]
}

Possible error messages:
  1   Internal error              || An internal error in the desired operation.
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
    mode: z.string().min(1, "mode cannot be empty."),
    type: z.array(objectTypeType).optional().default([]),
  },
  async ({ _var, mode, type }, executionContext) => {
    try {
      const params: Params = {
        mode: mode,
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
        //console.log("Tool 'browse-Plc-Program' ||  Number of items: ", data.result.length);
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
      return {
        content: [
          {
            type: "text",
            text: `Tool 'browse-Plc-Program' || Error: ${String(err)}`,
          },
        ],
      };
    }
  }
);
// ------------------------------------------------------------------------------------------------------------------------------------------------
// Tool to PlcProgram-Read
// ------------------------------------------------------------------------------------------------------------------------------------------------
server.tool(
  "PlcProgram-Read",
  `
Use the this method to read a single variable from a CPU.
To call the PlcProgram.Read method, you need the "read_value" authorization.

Structure of the request:

The following table provides information about the individual parameters of the request.

| Name  | Required                | Data type                   | Description |
|-------|-------------------------|-----------------------------|-------------|
| var   | yes                     | string                      | Name of the tag to be read. |
| mode  | no, default is "simple" | string                      | Always use the "simple" mode |


Example 1:
In the following example, the user requests a global tag in the "simple" representation.

{
"var": "\"MotorSpeed\""
}

Example 2:
In the following example, the user requests a data block tag in the "simple" representation.

{
"var": "\"MyDB\".MyVariable",
}


 Possible error messages:
  1   Internal error         || An internal error in the desired operation.
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
      const params: Params = {};
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
        //console.log("Tool 'PlcProgram-Read' || successfully completed.");
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
      return {
        content: [
          {
            type: "text",
            text: `Tool 'PlcProgram-Read' || Error: ${String(err)}`,
          },
        ],
      };
    }
  }
);
// ------------------------------------------------------------------------------------------------------------------------------------------------
// Tool to PlcProgram.Write
// ------------------------------------------------------------------------------------------------------------------------------------------------
server.tool(
  "PlcProgram-Write",
  `
This method is used to write a single process tag to the CPU.
To call the PlcProgram.Write method, you require "write_value" authorization.

Structure of the request:

The following table provides information about the individual parameters of the request.

| Name  | Required                | Data type                   | Description |
|-------|-------------------------|-----------------------------|-------------|
| var   | yes                     | string                      | Name of the tag to be written. |
| value | yes                     | Boolean, Number or String   | Data type of the value to be written;<br><br>The value depends on the operating mode. |
| mode  | no, default is "simple" | string                      | Always use the "simple" mode |

Example 1:
In the following example, the user writes a global tag in the "simple" display.

{
"var": "\"MotorSpeed\"",
"value": 9001
}

Example 2:
In the following example, the user writes a tag to a data block in the "simple" display.
{
"var": "\"MyDB\".MyVariable",
"value": true
}

Example 3:
In the following example, the user writes a string tag consisting of 10 characters to the
"simple" representation.
{
"var": "\"MyDB\".MyString",
"value": "Short Str"
}

Possible error messages:
1   Internal error         || An internal error in the desired operation.
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
    value: z.union([z.boolean(), z.number(), z.string()]),
  },
  async ({ _var, value }, executionContext) => {
    try {
      const params: Params = {};
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
        //console.log("Tool 'PlcProgram-Write' || successfully completed.");
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
      return {
        content: [
          {
            type: "text",
            text: `Tool 'PlcProgram-Write' || Error: ${String(err)}`,
          },
        ],
      };
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
        //console.log("Tool 'Plc ReadOperatingMode' || successfully completed. ");
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
      return {
        content: [
          {
            type: "text",
            text: `Tool 'Plc ReadOperatingMode' || Error: ${String(err)}`,
          },
        ],
      };
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
      const params: Params = {};

      params["mode"] = mode;
      const method = {
        id: 45,
        jsonrpc: "2.0",
        method: "Plc.RequestChangeOperatingMode",
        params: params,
      };
      const data = await sendReq(urlWebApi, authInfos, method);
      if (!data?.error) {
        //console.log("Tool 'Plc-RequestChangeOperatingMode' || successfully completed.");
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
      return {
        content: [
          {
            type: "text",
            text: `Tool 'Plc-RequestChangeOperatingMode' || Error: ${String(err)}`,
          },
        ],
      };
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
        //console.log("Tool 'Plc ReadSystemTime' || successfully completed. ");
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
      console.error("Tool 'Plc-ReadSystemTime' || Error: ", err);
       return {
        content: [
          {
            type: "text",
            text: `Tool 'Plc-ReadSystemTime' || Error: ${String(err)}`,
          },
        ],
      };
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
      const params: Params = {};

      params["timestamp"] = timestamp;
      const method = {
        id: 45,
        jsonrpc: "2.0",
        method: "Plc.SetSystemTime",
        params: params,
      };
      const data = await sendReq(urlWebApi, authInfos, method);
      if (!data?.error) {
        //console.log("Tool 'Plc SetSystemTime' || successfully completed.");
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
      console.error("Tool 'Plc-SetSystemTime' ||error: ", err);
      return {
        content: [
          {
            type: "text",
            text: `Tool 'Plc-SetSystemTime' || Error: ${String(err)}`,
          },
        ],
      };
    }
  }
);
// ------------------------------------------------------------------------------------------------------------------------------------------------
// Tool to Plc.ReadLanguages
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
        //console.log("Tool 'Project ReadLanguages' || successfully completed. ");
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
      console.error("Tool 'Project-ReadLanguages' || Error: ", err);
      return {
        content: [
          {
            type: "text",
            text: `Tool 'Project-ReadLanguages' || Error: ${String(err)}`,
          },
        ],
      };
    }
  }
);