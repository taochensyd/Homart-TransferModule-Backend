const express = require("express");
const app = express();
const axios = require("axios");
app.use(express.json());
const port = 3005;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

const sessionObj = {
  sessionId: null,
  sessionTime: null,
};

const loginToSAPSession = async () => {
  try {
    const response = await axios.post(
      "https://192.168.0.44:50000/b1s/v1/Login",
      {
        CompanyDB: "Homart_TEST8",
        UserName: "SAPCreatio",
        Password: "Bold#By68",
      }
    );
    console.log(
      "response.headers['set-cookie']:",
      response.headers["set-cookie"]
    );
    console.log("response.data:" + response.data);
    const cookies = response.headers['set-cookie'];
    const b1SessionCookie = cookies.find(cookie => cookie.startsWith('B1SESSION=')).split(';')[0];
    const routeIdCookie = cookies.find(cookie => cookie.startsWith('ROUTEID=')).split(';')[0];
    const cookie = [b1SessionCookie, routeIdCookie].join('; ');
    
    sessionObj.sessionId = cookie;
  } catch (error) {
    console.log("error.message:" + error.message);
  }
};

app.post("/api/login", async (req, res) => {
  await loginToSAPSession();
  res.send({ message: 'Logged in to SAP session' });
});

// User SAP account verify
app.post("/api/userAccount", async (req, res) => {
  console.log('req.body:', req.body);
  const checkAccountBaseURL = `https://192.168.0.44:50000/b1s/v1/view.svc/Homart_CheckUserAccount_B1SLQuery()?$filter=U_UserCode eq '${req.body.sapusername}' and U_UserPW eq '${req.body.sappassword}'`;
  console.log(checkAccountBaseURL);
  console.log("sessionObj.sessionId: " + sessionObj.sessionId);
  try {
    const response = await axios.get(checkAccountBaseURL, {
      withCredentials: true,
      headers: {
        'Cookie': sessionObj.sessionId,
      },
    });
    const count = response.data.value.length;
    res.send({ count });
  } catch (error) {
    console.log("error.message:", error.message);
    res.status(500).send(error.message);
  }
});


// Batch number details
app.post("/api/batchnumberdetail", async (req, res) => {
  console.log('req.body:', req.body);
  const getItemByBatchBaseURL = `https://192.168.0.44:50000/b1s/v1/BatchNumberDetails?$filter=Batch eq '${req.body.BatchNumber}'`;
  console.log(getItemByBatchBaseURL);
  console.log("sessionObj.sessionId: " + sessionObj.sessionId);
  try {
    const response = await axios.get(getItemByBatchBaseURL, {
      withCredentials: true,
      headers: {
        'Cookie': sessionObj.sessionId,
      },
    });
    res.send(response.data);
  } catch (error) {
    console.log("error.message:", error.message);
    res.status(500).send(error.message);
  }
});

// Items
app.post("/api/items", async (req, res) => {
  console.log('req.body:', req.body);
  const getItemDetailByItemNumberBaseURL = `https://192.168.0.44:50000/b1s/v1/Items('${req.body.ItemNumber}')`;
  console.log(getItemDetailByItemNumberBaseURL);
  console.log("sessionObj.sessionId: " + sessionObj.sessionId);
  try {
    const response = await axios.get(getItemDetailByItemNumberBaseURL, {
      withCredentials: true,
      headers: {
        'Cookie': sessionObj.sessionId,
      },
    });
    res.send(response.data);
  } catch (error) {
    console.log("error.message:", error.message);
    res.status(500).send(error.message);
  }
});

// BinLocations
app.post("/api/binlocations", async (req, res) => {
  console.log('req.body:', req.body);
  const getBinLocationBaseURL = `https://192.168.0.44:50000/b1s/v1/BinLocations?$select=AbsEntry,BinCode,Warehouse&$filter=Warehouse eq '${req.body.WarehouseCode}'`;
  console.log(getBinLocationBaseURL);
  console.log("sessionObj.sessionId: " + sessionObj.sessionId);
  try {
    const response = await axios.get(getBinLocationBaseURL, {
      withCredentials: true,
      headers: {
        'Cookie': sessionObj.sessionId,
      },
    });
    res.send(response.data);
  } catch (error) {
    console.log("error.message:", error.message);
    res.status(500).send(error.message);
  }
});

app.listen(port, () => {
  console.log("Server listening on port " + port);
  loginToSAPSession();
  setInterval(loginToSAPSession, 28 * 60 * 1000);
});