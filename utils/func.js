import https from "https";
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

// ------------------------------------------------------------------------------------------------------------------------------------------------
// send request function
// ------------------------------------------------------------------------------------------------------------------------------------------------
export const sendReq = async (URL, authInfos, methed) => {
  try {
    const headers = {
      "Content-Type": "application/json",
    };
    if (authInfos?.token) {
      headers["X-Auth-Token"] = `${authInfos.token}`;
    }
    const response = await fetch(URL, {
      method: "POST",
      headers: headers,
      agent: httpsAgent,
      body: JSON.stringify(methed),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(
        `send request || request failed with status ${response.status}: ${errorBody}`
      );
    }

    const jsonResponse = await response.json();

    if (jsonResponse.errors) {
      console.error(
        "send request || errors:",
        JSON.stringify(jsonResponse.errors, null, 2)
      );
    }

    return jsonResponse;
  } catch (error) {}
};
