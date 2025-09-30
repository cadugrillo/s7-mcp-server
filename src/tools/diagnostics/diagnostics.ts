import { z } from "zod";
// ----------------------------------------------------------------------------------------------------------
import {
  AlarmsBrowseFiltersRequestType,
  DiagnosticBufferBrowseFiltersRequestType,
} from "../../utils/enum.js";
import { authInfos } from "../credentials/credentials.js";
import { sendReq } from "../../utils/func.js";
import { server } from "../../utils/mcp_server.js";
import { config } from "../../utils/config.js";
//......................................
const urlWebApi = config.URL;
// ------------------------------------------------------------------------------------------------------------
// Diagnostic Funtions that does need authentication
// ------------------------------------------------------------------------------------------------------------
export const diagnostics = () => {}

interface Params {
    language?: string;
    count?: number;
    id?: string;
    alarm_id?: string;
    filters?: {};
}
// ------------------------------------------------------------------------------------------------------------------------------------------------
// Tool to Alarms-Browse
// ------------------------------------------------------------------------------------------------------------------------------------------------
server.tool(
  "Alarms-Browse",
  `
With this method you can determine which alarms are currently active on the CPU, and when the last change occurred within the diagnostics buffer.
To call the Alarms.Browse method, you need the "read_diagnostics" permission.

Structure of the request

The following table provides information about the individual parameters of the request.

Table: Alarms_Browse_Request (object)

| Name | Required | Data type | Description |
|------|----------|-----------|-------------|
| language | Yes | string | The desired language in which the text is returned in RFC 4647 format, e.g. "en-US" |
| count | No | number | The maximum number of alarm entries that are returned.<br><br>The default value is 50. If you want to determine the current status of the diagnostics buffer, enter 0 as "count". |
| alarm_id | No | string | The alarm ID of the CPU for which you are requesting data. If the Alarm ID is included, only the "count" parameter can be offered as a filter. |
| filters | No | object of type Alarms_Browse_<br><br>Filters_Request | Optional object containing parameters for filtering the response |

Table: Alarms_Browse_Filters_Request (object)

| Name | Required | Data type | Description |
|------|----------|-----------|-------------|
| mode | Yes | string | The mode that determines whether attributes are to be included or excluded in the response.<br><br>The following modes are available:<br><br>• include<br>• exclude |
| filters.attributes | Yes | array of strings | Possible array entries are:<br><br>• "alarm_text"<br>• "info_text"<br>• "status"<br>• "timestamp"<br>• "acknowledgement"<br>• "alarm_number"<br>• "producer" |

Examples:

The following example shows a request for reading a single alarm with all alarm areas in the English language:

{
"language": "en-US",
"alarm_id": "1231231231"
}
The following example shows the request for reading a single alarm without the alarm areas excluded under "exclude":

{
"language": "en-US",
"alarm_id": "1231231231",
"filters":
{
"mode": "exclude",
"attributes": ["alarm_text", "info_text"],
}
}
The following example shows the request for reading 50 alarms with the alarm ranges included in "include".

{
"language": "en-US",
"count": 50,
"filters":
{
"mode": "include",
"attributes": ["status", "acknowledgement"]
}
}

Possible error messages:
2   Permission denied  || The current authentication token is not authorized to call this method. Log on with a user account that has sufficient privileges to call this method.
800 Invalid alarm ID   || The alarm ID provided is invalid.
801 Invalid parameters || The request is invalid because provided parameters are invalid (e.g. the parameters "count" and "id" are present at the same time).

`,

  {
    language: z.string().min(1, "language cannot be empty.").default("en-US"),
    count: z.number().optional(),
    alarm_id: z.string().optional(),
    filters: AlarmsBrowseFiltersRequestType.optional().default({
      mode: "include",
      attributes: [],
    }),
  },
  async ({ language, count, alarm_id, filters }, executionContext) => {
    try {
      const params: Params = {};

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
        //console.log("Tool 'Alarms Browse' || successfully completed.");
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
      console.error("Tool 'Alarms-Browse' ||error: ", err);
      return {
        content: [
          {
            type: "text",
            text: `Tool 'Alarms-Browse' || Error: ${String(err)}`,
          },
        ],
      };
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
      const params: Params = {};

      params["id"] = id;

      const method = {
        id: 45,
        jsonrpc: "2.0",
        method: "Alarms.Acknowledge",
        params: params,
      };
      const data = await sendReq(urlWebApi, authInfos, method);

      if (!data?.error) {
        //console.log("Tool 'Alarms Acknowledge' || successfully completed.");
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
      console.error("Tool 'Alarms-Acknowledge' ||error: ", err);
      return {
        content: [
          {
            type: "text",
            text: `Tool 'Alarms-Acknowledge' || Error: ${String(err)}`,
          },
        ],
      };
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

Structure of the request:

The following table provides information about the individual parameters of the request.

Table: DiagnosticBuffer_Browse_Request (object)

| Name | Required | Data type | Description |
|------|----------|-----------|-------------|
| language | Yes | string | The desired language in which the text is returned in RFC 4647 format, e.g. "en-US" |
| count | No | number | The maximum number of alarm entries that are returned.<br><br>The default value is 50. If you want to determine the current status of the diagnostics buffer, enter 0 as "count". |
| filters | No | object of type DiagnosticBuffer_options.<br><br>Browse_Filters_<br><br>Request | The object that represents the different filtering |

Table: DiagnosticBuffer_Browse_Filters_Request (object)

| Name | Required | Data type | Description |
|------|----------|-----------|-------------|
| attributes | Yes | array of strings | The following attributes are possible for the diagnostics buffer entries:<br><br>• short_text<br>• long_text<br>• help_text |
| mode | Yes | string | The mode that determines whether attributes are to be included or excluded in the request.<br><br>The following modes are available:<br><br>• include<br>• exclude |


Example:

The following example shows a request of the diagnostic entries as LCID value 1033 (dec value), which stands for "English United States".

{
"language": "en-US",
"count": 50,
"entries":
{
"mode": "include",
"attributes": ["short_text", "long_text", "help_text"]
}
}

Possible error messages
2 Permission denied || The current authentication token is not authorized to call this method. Log on with a user account that has sufficient privileges to call this method
`,

  {
    language: z.string().min(1, "language cannot be empty.").default("en-US"),
    count: z.number().optional(),
    filters: DiagnosticBufferBrowseFiltersRequestType.optional().default({
      mode: "include",
      attributes: ["short_text", "long_text", "help_text"],
    }),
  },
  async ({ language, count, filters }, executionContext) => {
    try {
      const params: Params = {};

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
        //console.log("Tool 'DiagnosticBuffer Browse' || successfully completed.");
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
      console.error("Tool 'DiagnosticBuffer-Browse' ||error: ", err);
      return {
        content: [
          {
            type: "text",
            text: `Tool 'DiagnosticBuffer-Browse' || Error: ${String(err)}`,
          },
        ],
      };
    }
  }
);
