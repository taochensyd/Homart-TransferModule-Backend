const express = require("express");
const cors = require("cors");
axios = require("axios");
app = express();
app.use(cors());
require("dotenv").config(), app.use(express.json());
const port = 3005;
(process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"),
  app.use((s, e, o) => {
    e.header("Access-Control-Allow-Origin", "*"),
      e.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      ),
      o();
  });
/**
 * Object representing the session information.
 * @typedef {Object} SessionObj
 * @property {string} sessionId - The session ID.
 * @property {string} sessionTime - The session time.
 */
const sessionObj = { sessionId: null, sessionTime: null },
  loginToSAPSession = async () => {
    try {
      const s = await axios.post(process.env.SAP_BASE_URL + "/b1s/v1/Login", {
        CompanyDB: process.env.DB_NAME,
        UserName: process.env.SAP_USERNAME,
        Password: process.env.SAP_PASSWORD,
      });
      console.log("response.headers['set-cookie']:", s.headers["set-cookie"]),
        console.log("response.data:" + s.data);
      const e = s.headers["set-cookie"],
        o = [
          e.find((s) => s.startsWith("B1SESSION=")).split(";")[0],
          e.find((s) => s.startsWith("ROUTEID=")).split(";")[0],
        ].join("; ");
      return (
        (sessionObj.sessionId = o),
        200 === s.status
          ? (console.log("Logged in to SAP session"), s.status)
          : (console.log("Failed to login to SAP session"), s.status)
      );
    } catch (s) {
      console.log("error.message:" + s.message);
    }
  };
app.post("/api/login", async (s, e) => {
  let o = !1;
  (o = await loginToSAPSession()),
    200 === o
      ? e.status(o).send({ message: "Logged in to SAP session" })
      : e.status(o).send({ message: "Failed to login to SAP session" });
}),
  app.post("/api/userAccount", async (s, e) => {
    console.log("req.body:", s.body);
    const o = `https://192.168.0.44:50000/b1s/v1/view.svc/Homart_CheckUserAccount_B1SLQuery()?$filter=U_UserCode eq '${s.body.sapusername}' and U_UserPW eq '${s.body.sappassword}'`;
    console.log(o);
    try {
      const s = (
        await axios.get(o, {
          withCredentials: !0,
          headers: { Cookie: sessionObj.sessionId },
        })
      ).data.value.length;
      console.log("/b1s/v1/view.svc/Homart_CheckUserAccount_B1SLQuery()"),
        (200 === e.statusCode && 1 === s) || 200 === e.statusCode
          ? e.status(200).send({ count: s })
          : e.statusCode(500).send({ count: s });
    } catch (s) {
      console.log("error.message:", s.message), e.status(500).send(s.message);
    }
  });
  // app.post("/api/batchnumberdetail", async (s, e) => {
  //   console.log("req.body:", s.body);
  //   const o = `https://192.168.0.44:50000/b1s/v1/BatchNumberDetails?$filter=Batch eq '${s.body.BatchNumber}'`;
  //   console.log(o),
  //     console.log("sessionObj.sessionId: " + sessionObj.sessionId);
  //   try {
  //     const s = await axios.get(o, {
  //       withCredentials: !0,
  //       headers: {
  //         Cookie: sessionObj.sessionId,
  //         Prefer: "odata.maxpagesize=9999999999",
  //       },
  //     });
  //     console.log("/b1s/v1/BatchNumberDetails"), e.send(s.data);
  //   } catch (s) {
  //     console.log("error.message:", s.message), e.status(500).send(s.message);
  //   }
  // }),


  let batchNumberDetail = null;

  setInterval(async () => {
    try {
      const response = await axios.get(`https://192.168.0.44:50000/b1s/v1/BatchNumberDetails?$filter=Batch eq '${s.body.BatchNumber}'`, {
        withCredentials: true,
        headers: {
          Cookie: sessionObj.sessionId,
          Prefer: "odata.maxpagesize=9999999999",
        },
      });
      batchNumberDetail = response.data;
    } catch (error) {
      console.log("Error fetching batch number detail:", error.message);
    }
  }, 600000); // 600000 milliseconds = 10 minutes
  
  app.post("/api/batchnumberdetail", (req, res) => {
    if (batchNumberDetail) {
      res.send(batchNumberDetail);
    } else {
      res.status(500).send("No data available");
    }
  });
  

  app.post("/api/items", async (s, e) => {
    console.log("req.body:", s.body);
    const o = `https://192.168.0.44:50000/b1s/v1/Items('${s.body.ItemNumber}')`;
    console.log(o),
      console.log("sessionObj.sessionId: " + sessionObj.sessionId);
    try {
      const s = await axios.get(o, {
        withCredentials: !0,
        headers: {
          Cookie: sessionObj.sessionId,
          Prefer: "odata.maxpagesize=9999999999",
        },
      });
      console.log("/api/items"), e.send(s.data);
    } catch (s) {
      console.log("error.message:", s.message), e.status(500).send(s.message);
    }
  }),
  app.post("/api/binlocations", async (s, e) => {
    console.log("req.body:", s.body);
    const o =
      "https://192.168.0.44:50000/b1s/v1/BinLocations?$select=AbsEntry,BinCode,Warehouse,Inactive,";

    console.log(o),
      console.log("sessionObj.sessionId: " + sessionObj.sessionId);
    try {
      const s = await axios.get(o, {
        withCredentials: !0,
        headers: {
          Cookie: sessionObj.sessionId,
          Prefer: "odata.maxpagesize=999999999",
        },
      });
      console.log("/b1s/v1/BinLocations"),
        console.log("binlocation: " + s.data.value[0].AbsEntry);
      // Filter the data
      const filteredData = s.data.value.filter(
        (item) => item.Inactive === "tNO"
      );
      if (filteredData.length > 0) {
        e.send(filteredData);
      } else {
        console.log("No matching key-value pair found.");
      }
    } catch (s) {
      console.log("error.message:", s.message), e.status(500).send(s.message);
    }
  });
app.post("/api/batchinbin", async (s, e) => {
  console.log("req.body:", s.body);
  const o = `https://192.168.0.44:50000/b1s/v1/view.svc/Homart_B1_BatchInBinQty_B1SLQuery()?$filter=DistNumber eq '${s.body.BatchNumber}' and OnHandQty gt 0`;
  console.log(o), console.log("sessionObj.sessionId: " + sessionObj.sessionId);
  try {
    const s = await axios.get(o, {
      withCredentials: !0,
      headers: {
        Cookie: sessionObj.sessionId,
        Prefer: "odata.maxpagesize=9999999999",
      },
    });
    console.log("/b1s/v1/view.svc/Homart_BatchInBinQty_B1SLQuery()"),
      console.log("batchinbin: " + s.data.value),
      e.send(s.data);
  } catch (s) {
    console.log("error.message:", s.message), e.status(500).send(s.message);
  }
}),
  app.post("/api/nextavailablejournalmemo", async (s, e) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    const day = today.getDate().toString().padStart(2, "0");
    const dateForURL = `${year}-${month}-${day}`;
    const date = `${year}${month}${day}`;
    const o = `https://192.168.0.44:50000/b1s/v1/StockTransfers?$select=DocDate,JournalMemo&$filter=CreationDate eq '${dateForURL}' and startswith(JournalMemo, 'WEB')`;
    try {
      const s = await axios.get(o, {
        withCredentials: !0,
        headers: {
          Cookie: sessionObj.sessionId,
          Prefer: "odata.maxpagesize=9999999999",
        },
      });
      const data = s.data;
      let nextJournalMemo;
      if (data.value.length > 0) {
        const lastJournalMemo = data.value[data.value.length - 1].JournalMemo;
        const lastNumberStr = lastJournalMemo.split(":")[1];
        const lastNumber = isNaN(parseInt(lastNumberStr))
          ? 0
          : parseInt(lastNumberStr);
        const nextNumber = lastNumber + 1;
        nextJournalMemo = `WEB STOCK Transferno:${nextNumber
          .toString()
          .padStart(4, "0")}`;
      } else {
        nextJournalMemo = `WEB STOCK Transferno:${date}0001`;
      }
      e.send({ NextJournalMemo: nextJournalMemo });
    } catch (s) {
      console.log("error.message:", s.message), e.status(500).send(s.message);
    }
  });

app.post("/api/stocktransfer", async (req, res) => {
  console.log("Received request for /api/stocktransfer");
  console.log("Request Body:", req.body);

  try {
    console.log("Attempting to post data to the external API");

    const response = await axios.post(
      "https://192.168.0.44:50000/b1s/v1/StockTransfers",
      req.body,
      {
        withCredentials: true,
        headers: { Cookie: sessionObj.sessionId },
      }
    );

    console.log("Received response from the external API");
    console.log("Response Data:", response.data);

    res.send(response.data);
  } catch (error) {
    console.error("Error occurred in /api/stocktransfer:");
    console.error(error);

    // Logging error details if available
    if (error.response) {
      console.error("Error Response Data:", error.response.data);
      console.error("Error Response Status:", error.response.status);
      console.error("Error Response Headers:", error.response.headers);
    }

    res.status(500).send({ error: error.message });
  }
});

app.listen(3005, () => {
  console.log("Server listening on port 3005"),
    loginToSAPSession(),
    setInterval(loginToSAPSession, 168e4);
});
