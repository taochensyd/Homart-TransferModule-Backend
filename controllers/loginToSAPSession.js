const axios = require("axios");

const loginToSAPSession = async () => {
  try {
    const response = await axios.post(
      `${process.env.SAP_BASE_URL}/b1s/v1/Login`,
      {
        CompanyDB: process.env.DB_NAME,
        UserName: process.env.SAP_USERNAME,
        Password: process.env.SAP_PASSWORD,
      }
    );
    console.log(
      "response.headers['set-cookie']:",
      response.headers["set-cookie"]
    );
    console.log("response.data:" + response.data);

    const cookies = response.headers["set-cookie"];
    const b1SessionCookie = cookies
      .find((cookie) => cookie.startsWith("B1SESSION="))
      .split(";")[0];
    const routeIdCookie = cookies
      .find((cookie) => cookie.startsWith("ROUTEID="))
      .split(";")[0];
    const cookie = [b1SessionCookie, routeIdCookie].join("; ");

    sessionObj.sessionId = cookie;
    if (response.status === 200) {
      console.log("Logged in to SAP session");
      return response.status;
    } else {
      console.log("Failed to login to SAP session");
      return response.status;
    }
  } catch (error) {
    console.log("error.message:" + error.message);
  }
};

module.exports = loginToSAPSession;
